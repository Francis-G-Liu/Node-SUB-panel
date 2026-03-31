export declare class CreateNodeDto {
    providerId?: string;
    hostname: string;
    port: number;
    protocol: 'vmess' | 'vless' | 'trojan' | 'ss' | 'socks' | 'http';
    region: string;
    tags: string[];
    active?: boolean;
    maxBandwidthMbps?: number;
}
