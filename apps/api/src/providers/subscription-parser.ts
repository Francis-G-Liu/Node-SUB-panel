import { NodeProtocol } from '../domain/entities';

// ─────────────────────────────────────────
// Public types
// ─────────────────────────────────────────

export interface ParsedNode {
  hostname: string;
  port: number;
  protocol: NodeProtocol;
  /** Original protocol tag when the wire protocol differs from stored protocol */
  wireProtocol?: string;
  name?: string;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

/** Safe base64 decode (URL-safe variant) */
const decodeBase64 = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};

/** Parse as number, return NaN on failure */
const safePort = (raw: string | number | undefined): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 65535 ? n : NaN;
};

/** Strip enclosing brackets from IPv6 like [::1] */
const stripBrackets = (h: string): string =>
  h.startsWith('[') && h.endsWith(']') ? h.slice(1, -1) : h;

/** Validate hostname: non-empty, no whitespace, no control chars */
const isValidHost = (h: string): boolean =>
  Boolean(h) && !/\s/.test(h) && !/[\x00-\x1f]/.test(h);

/** Map an arbitrary protocol string to a stored NodeProtocol.
 *  New protocols (hysteria, tuic, wg) are stored as 'socks'
 *  with wireProtocol recorded separately.
 */
const mapProtocol = (
  wire: string,
): { protocol: NodeProtocol; wireProtocol?: string } => {
  const lc = wire.toLowerCase();
  switch (lc) {
    case 'vmess':
      return { protocol: 'vmess' };
    case 'vless':
      return { protocol: 'vless' };
    case 'trojan':
      return { protocol: 'trojan' };
    case 'ss':
    case 'shadowsocks':
      return { protocol: 'ss' };
    case 'socks':
    case 'socks5':
      return { protocol: 'socks' };
    case 'http':
    case 'https':
      return { protocol: 'http' };
    // New protocols – stored under 'socks' to avoid schema migration
    case 'hysteria':
    case 'hysteria2':
    case 'hy2':
    case 'tuic':
    case 'wireguard':
    case 'wg':
      return { protocol: 'socks', wireProtocol: lc };
    default:
      return { protocol: 'socks', wireProtocol: lc };
  }
};

// ─────────────────────────────────────────
// URI-line parsers
// ─────────────────────────────────────────

const parseVmess = (line: string): ParsedNode | null => {
  try {
    const payload = decodeBase64(line.slice('vmess://'.length));
    const data = JSON.parse(payload) as {
      add?: string;
      port?: string | number;
      ps?: string;
      host?: string;
    };
    const hostname = stripBrackets((data.add ?? '').trim());
    const port = safePort(data.port);
    if (!isValidHost(hostname) || isNaN(port)) return null;
    return { hostname, port, protocol: 'vmess', name: data.ps || undefined };
  } catch {
    return null;
  }
};

/** Generic URL-based parser for vless / trojan / socks / http / hysteria / tuic etc. */
const parseUrl = (line: string, wireProto: string): ParsedNode | null => {
  try {
    const url = new URL(line);
    const hostname = stripBrackets(url.hostname);
    // hysteria2 may encode port in 'port' query param as fallback
    const port =
      safePort(url.port) || safePort(url.searchParams.get('port') ?? '');
    if (!isValidHost(hostname) || isNaN(port)) return null;
    const rawName = url.hash
      ? decodeURIComponent(url.hash.replace('#', ''))
      : undefined;
    const name = rawName || undefined;
    const { protocol, wireProtocol } = mapProtocol(wireProto);
    return { hostname, port, protocol, wireProtocol, name };
  } catch {
    return null;
  }
};

const parseShadowsocks = (line: string): ParsedNode | null => {
  try {
    const noScheme = line.slice('ss://'.length);
    // Format A: base64(method:password)@host:port#name
    // Format B: base64(method:password@host:port)#name
    const hashIdx = noScheme.indexOf('#');
    const mainPart = hashIdx >= 0 ? noScheme.slice(0, hashIdx) : noScheme;
    const rawName =
      hashIdx >= 0
        ? decodeURIComponent(noScheme.slice(hashIdx + 1))
        : undefined;

    let hostPort: string;
    if (mainPart.includes('@')) {
      // SIP002: userinfo@host:port
      const atIdx = mainPart.lastIndexOf('@');
      hostPort = mainPart.slice(atIdx + 1);
    } else {
      // Legacy: entire string is base64
      const decoded = decodeBase64(mainPart);
      if (!decoded.includes('@')) return null;
      const atIdx = decoded.lastIndexOf('@');
      hostPort = decoded.slice(atIdx + 1);
    }

    // Handle IPv6 [::1]:port
    let hostname: string;
    let rawPort: string;
    if (hostPort.startsWith('[')) {
      const close = hostPort.indexOf(']');
      if (close < 0) return null;
      hostname = hostPort.slice(1, close);
      rawPort = hostPort.slice(close + 2); // skip ]:
    } else {
      const colonIdx = hostPort.lastIndexOf(':');
      if (colonIdx < 0) return null;
      hostname = hostPort.slice(0, colonIdx);
      rawPort = hostPort.slice(colonIdx + 1);
    }

    const port = safePort(rawPort);
    if (!isValidHost(hostname) || isNaN(port)) return null;
    return { hostname, port, protocol: 'ss', name: rawName || undefined };
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────
// Clash YAML parser (zero-dependency)
// ─────────────────────────────────────────

/**
 * Minimalist Clash YAML proxies parser.
 * Only handles the `proxies:` block; does not need a full YAML parser
 * because Clash config always uses simple key-value pairs inside list items.
 */
const parseClashYaml = (raw: string): ParsedNode[] => {
  const results: ParsedNode[] = [];

  // Find `proxies:` section
  const proxiesMatch = raw.match(/^proxies\s*:/m);
  if (!proxiesMatch) return results;

  const proxiesStart = proxiesMatch.index! + proxiesMatch[0].length;
  // Next top-level key (zero-indented non-comment line starting a word)
  const nextSection = raw.slice(proxiesStart).search(/\n[a-zA-Z]/);
  const proxiesBlock =
    nextSection >= 0
      ? raw.slice(proxiesStart, proxiesStart + nextSection)
      : raw.slice(proxiesStart);

  // Split into individual proxy entries (lines starting with `  - `)
  const entries = proxiesBlock.split(/\n(?=\s*-\s)/);

  for (const entry of entries) {
    if (!entry.trim().startsWith('-')) continue;
    const kvMap = parseClashEntry(entry);
    const node = clashEntryToNode(kvMap);
    if (node) results.push(node);
  }

  return results;
};

/** Extract key: value pairs from a Clash proxy entry block */
const parseClashEntry = (block: string): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const trimmed = line.trim().replace(/^-\s*/, '');
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx < 0) continue;
    const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const value = trimmed
      .slice(colonIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key && value) map[key] = value;
  }
  return map;
};

/** Convert a parsed Clash entry kv map to ParsedNode */
const clashEntryToNode = (kv: Record<string, string>): ParsedNode | null => {
  const wireProto = (kv['type'] ?? '').toLowerCase();
  const server = (kv['server'] ?? '').trim();
  const port = safePort(kv['port']);
  const name = kv['name'] || undefined;

  if (!isValidHost(server) || isNaN(port) || !wireProto) return null;

  const hostname = stripBrackets(server);
  const { protocol, wireProtocol } = mapProtocol(wireProto);
  return { hostname, port, protocol, wireProtocol, name };
};

// ─────────────────────────────────────────
// Deduplication
// ─────────────────────────────────────────

const dedup = (nodes: ParsedNode[]): ParsedNode[] => {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    const key = `${n.hostname}:${n.port}:${n.protocol}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────

/**
 * Parse subscription content in any supported format:
 *   - URI list (plain or base64-encoded)
 *   - Clash YAML / Clash Meta YAML
 *
 * Supported protocols:
 *   vmess, vless, trojan, shadowsocks (ss), socks5,
 *   http/https, hysteria, hysteria2, tuic, wireguard
 */
export const parseSubscriptionContent = (raw: string): ParsedNode[] => {
  const trimmed = raw.trim();

  // ── 1. Clash YAML detection ──────────────────────────────────────────────
  // A real Clash config always has 'proxies:' at the top level.
  if (/^proxies\s*:/m.test(trimmed)) {
    return dedup(parseClashYaml(trimmed));
  }

  // ── 2. Attempt base64 decode of entire payload ───────────────────────────
  let content = trimmed;
  if (!trimmed.includes('://')) {
    try {
      const decoded = decodeBase64(trimmed);
      // After decode, might be Clash YAML
      if (/^proxies\s*:/m.test(decoded)) {
        return dedup(parseClashYaml(decoded));
      }
      if (decoded.includes('://')) {
        content = decoded;
      }
    } catch {
      // ignore – keep original
    }
  }

  // ── 3. URI list parsing ──────────────────────────────────────────────────
  const nodes = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): ParsedNode | null => {
      if (line.startsWith('vmess://')) return parseVmess(line);
      if (line.startsWith('vless://')) return parseUrl(line, 'vless');
      if (line.startsWith('trojan://')) return parseUrl(line, 'trojan');
      if (line.startsWith('ss://')) return parseShadowsocks(line);
      if (line.startsWith('socks://') || line.startsWith('socks5://'))
        return parseUrl(line, 'socks');
      if (line.startsWith('http://') || line.startsWith('https://'))
        return parseUrl(line, 'http');
      // New protocols
      if (line.startsWith('hysteria2://') || line.startsWith('hy2://'))
        return parseUrl(line, 'hysteria2');
      if (line.startsWith('hysteria://')) return parseUrl(line, 'hysteria');
      if (line.startsWith('tuic://')) return parseUrl(line, 'tuic');
      if (line.startsWith('wireguard://') || line.startsWith('wg://'))
        return parseUrl(line, 'wireguard');
      return null;
    })
    .filter((n): n is ParsedNode => n !== null);

  return dedup(nodes);
};
