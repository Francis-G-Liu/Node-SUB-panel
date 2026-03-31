import yaml, { FAILSAFE_SCHEMA } from 'js-yaml';

type YamlRecord = Record<string, unknown>;

const NODE_PROTOCOL_MAP: Record<string, string> = {
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  ss: 'Shadowsocks',
  shadowsocks: 'Shadowsocks',
  hysteria2: 'Hysteria2',
  hy2: 'Hysteria2',
};

const isYamlRecord = (value: unknown): value is YamlRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const toPositiveInt = (value: unknown) => {
  const normalized = toTrimmedString(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const toPort = (value: unknown) => {
  const parsed = toPositiveInt(value);
  return parsed && parsed <= 65535 ? parsed : undefined;
};

const toTagList = (value: unknown) => {
  if (typeof value === 'string') {
    const single = toTrimmedString(value);
    return single ? [single] : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((item) => toTrimmedString(item))
    .filter((item): item is string => Boolean(item));

  return normalized.length > 0 ? normalized : undefined;
};

const toTagText = (value: unknown) => toTagList(value)?.join(', ');

export const parseSafeYamlRecord = (input: string): YamlRecord => {
  const parsed = yaml.load(input, { schema: FAILSAFE_SCHEMA });

  if (!isYamlRecord(parsed)) {
    throw new Error('YAML import must be a top-level mapping.');
  }

  return parsed;
};

export const extractLegacyProviderYamlFields = (input: string) => {
  const parsed = parseSafeYamlRecord(input);

  return {
    name: toTrimmedString(parsed.name),
    url: toTrimmedString(parsed.url) ?? toTrimmedString(parsed.subscriptionUrl),
    region: toTrimmedString(parsed.region) ?? toTrimmedString(parsed.regionHint),
    interval:
      toPositiveInt(parsed.interval) ??
      toPositiveInt(parsed.syncIntervalMinutes),
    tags: toTagText(parsed.tags),
  };
};

export const extractProviderYamlFields = (input: string) => {
  const parsed = parseSafeYamlRecord(input);

  return {
    name: toTrimmedString(parsed.name),
    subscriptionUrl:
      toTrimmedString(parsed.subscriptionUrl) ?? toTrimmedString(parsed.url),
    regionHint:
      toTrimmedString(parsed.regionHint) ?? toTrimmedString(parsed.region),
    syncIntervalMinutes:
      toPositiveInt(parsed.syncIntervalMinutes) ?? toPositiveInt(parsed.interval),
    tags: toTagText(parsed.tags),
  };
};

export const extractNodeYamlFields = (input: string) => {
  const parsed = parseSafeYamlRecord(input);
  const protocolRaw =
    toTrimmedString(parsed.protocol) ?? toTrimmedString(parsed.type);
  const protocol = protocolRaw
    ? NODE_PROTOCOL_MAP[protocolRaw.toLowerCase()]
    : undefined;

  return {
    protocol,
    host:
      toTrimmedString(parsed.host) ??
      toTrimmedString(parsed.hostname) ??
      toTrimmedString(parsed.server),
    port: toPort(parsed.port),
    region: toTrimmedString(parsed.region),
    tags: toTagText(parsed.tags),
  };
};
