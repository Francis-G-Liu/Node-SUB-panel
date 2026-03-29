"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSubscriptionContent = void 0;
const decodeBase64 = (value) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
};
const safePort = (raw) => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 && n <= 65535 ? n : NaN;
};
const stripBrackets = (h) => h.startsWith('[') && h.endsWith(']') ? h.slice(1, -1) : h;
const isValidHost = (h) => Boolean(h) && !/\s/.test(h) && !/[\x00-\x1f]/.test(h);
const mapProtocol = (wire) => {
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
const parseVmess = (line) => {
    try {
        const payload = decodeBase64(line.slice('vmess://'.length));
        const data = JSON.parse(payload);
        const hostname = stripBrackets((data.add ?? '').trim());
        const port = safePort(data.port);
        if (!isValidHost(hostname) || isNaN(port))
            return null;
        return { hostname, port, protocol: 'vmess', name: data.ps || undefined };
    }
    catch {
        return null;
    }
};
const parseUrl = (line, wireProto) => {
    try {
        const url = new URL(line);
        const hostname = stripBrackets(url.hostname);
        const port = safePort(url.port) || safePort(url.searchParams.get('port') ?? '');
        if (!isValidHost(hostname) || isNaN(port))
            return null;
        const rawName = url.hash
            ? decodeURIComponent(url.hash.replace('#', ''))
            : undefined;
        const name = rawName || undefined;
        const { protocol, wireProtocol } = mapProtocol(wireProto);
        return { hostname, port, protocol, wireProtocol, name };
    }
    catch {
        return null;
    }
};
const parseShadowsocks = (line) => {
    try {
        const noScheme = line.slice('ss://'.length);
        const hashIdx = noScheme.indexOf('#');
        const mainPart = hashIdx >= 0 ? noScheme.slice(0, hashIdx) : noScheme;
        const rawName = hashIdx >= 0
            ? decodeURIComponent(noScheme.slice(hashIdx + 1))
            : undefined;
        let hostPort;
        if (mainPart.includes('@')) {
            const atIdx = mainPart.lastIndexOf('@');
            hostPort = mainPart.slice(atIdx + 1);
        }
        else {
            const decoded = decodeBase64(mainPart);
            if (!decoded.includes('@'))
                return null;
            const atIdx = decoded.lastIndexOf('@');
            hostPort = decoded.slice(atIdx + 1);
        }
        let hostname;
        let rawPort;
        if (hostPort.startsWith('[')) {
            const close = hostPort.indexOf(']');
            if (close < 0)
                return null;
            hostname = hostPort.slice(1, close);
            rawPort = hostPort.slice(close + 2);
        }
        else {
            const colonIdx = hostPort.lastIndexOf(':');
            if (colonIdx < 0)
                return null;
            hostname = hostPort.slice(0, colonIdx);
            rawPort = hostPort.slice(colonIdx + 1);
        }
        const port = safePort(rawPort);
        if (!isValidHost(hostname) || isNaN(port))
            return null;
        return { hostname, port, protocol: 'ss', name: rawName || undefined };
    }
    catch {
        return null;
    }
};
const parseClashYaml = (raw) => {
    const results = [];
    const proxiesMatch = raw.match(/^proxies\s*:/m);
    if (!proxiesMatch)
        return results;
    const proxiesStart = proxiesMatch.index + proxiesMatch[0].length;
    const nextSection = raw.slice(proxiesStart).search(/\n[a-zA-Z]/);
    const proxiesBlock = nextSection >= 0
        ? raw.slice(proxiesStart, proxiesStart + nextSection)
        : raw.slice(proxiesStart);
    const entries = proxiesBlock.split(/\n(?=\s*-\s)/);
    for (const entry of entries) {
        if (!entry.trim().startsWith('-'))
            continue;
        const kvMap = parseClashEntry(entry);
        const node = clashEntryToNode(kvMap);
        if (node)
            results.push(node);
    }
    return results;
};
const parseClashEntry = (block) => {
    const map = {};
    for (const line of block.split('\n')) {
        const trimmed = line.trim().replace(/^-\s*/, '');
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx < 0)
            continue;
        const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
        const value = trimmed
            .slice(colonIdx + 1)
            .trim()
            .replace(/^["']|["']$/g, '');
        if (key && value)
            map[key] = value;
    }
    return map;
};
const clashEntryToNode = (kv) => {
    const wireProto = (kv['type'] ?? '').toLowerCase();
    const server = (kv['server'] ?? '').trim();
    const port = safePort(kv['port']);
    const name = kv['name'] || undefined;
    if (!isValidHost(server) || isNaN(port) || !wireProto)
        return null;
    const hostname = stripBrackets(server);
    const { protocol, wireProtocol } = mapProtocol(wireProto);
    return { hostname, port, protocol, wireProtocol, name };
};
const dedup = (nodes) => {
    const seen = new Set();
    return nodes.filter((n) => {
        const key = `${n.hostname}:${n.port}:${n.protocol}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
};
const parseSubscriptionContent = (raw) => {
    const trimmed = raw.trim();
    if (/^proxies\s*:/m.test(trimmed)) {
        return dedup(parseClashYaml(trimmed));
    }
    let content = trimmed;
    if (!trimmed.includes('://')) {
        try {
            const decoded = decodeBase64(trimmed);
            if (/^proxies\s*:/m.test(decoded)) {
                return dedup(parseClashYaml(decoded));
            }
            if (decoded.includes('://')) {
                content = decoded;
            }
        }
        catch {
        }
    }
    const nodes = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
        if (line.startsWith('vmess://'))
            return parseVmess(line);
        if (line.startsWith('vless://'))
            return parseUrl(line, 'vless');
        if (line.startsWith('trojan://'))
            return parseUrl(line, 'trojan');
        if (line.startsWith('ss://'))
            return parseShadowsocks(line);
        if (line.startsWith('socks://') || line.startsWith('socks5://'))
            return parseUrl(line, 'socks');
        if (line.startsWith('http://') || line.startsWith('https://'))
            return parseUrl(line, 'http');
        if (line.startsWith('hysteria2://') || line.startsWith('hy2://'))
            return parseUrl(line, 'hysteria2');
        if (line.startsWith('hysteria://'))
            return parseUrl(line, 'hysteria');
        if (line.startsWith('tuic://'))
            return parseUrl(line, 'tuic');
        if (line.startsWith('wireguard://') || line.startsWith('wg://'))
            return parseUrl(line, 'wireguard');
        return null;
    })
        .filter((n) => n !== null);
    return dedup(nodes);
};
exports.parseSubscriptionContent = parseSubscriptionContent;
//# sourceMappingURL=subscription-parser.js.map