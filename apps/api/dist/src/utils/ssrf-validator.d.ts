export declare function isForbiddenIP(ip: string): boolean;
export declare function validateUrlForSSRF(urlStr: string): Promise<void>;
export declare function safeFetch(url: string, options?: RequestInit, maxRedirects?: number): Promise<Response>;
