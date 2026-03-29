import { NodeProtocol } from '../domain/entities';
export interface ParsedNode {
    hostname: string;
    port: number;
    protocol: NodeProtocol;
    wireProtocol?: string;
    name?: string;
}
export declare const parseSubscriptionContent: (raw: string) => ParsedNode[];
