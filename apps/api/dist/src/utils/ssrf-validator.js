"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isForbiddenIP = isForbiddenIP;
exports.validateUrlForSSRF = validateUrlForSSRF;
exports.safeFetch = safeFetch;
const dns = __importStar(require("dns/promises"));
const common_1 = require("@nestjs/common");
const ipAddr = __importStar(require("ipaddr.js"));
function parseIP(ipStr) {
    try {
        return ipAddr.parse(ipStr);
    }
    catch (e) {
        return null;
    }
}
function isForbiddenIP(ip) {
    const parsed = parseIP(ip);
    if (!parsed)
        return false;
    const range = parsed.range();
    switch (range) {
        case 'loopback':
        case 'private':
        case 'linkLocal':
        case 'unspecified':
        case 'broadcast':
            return true;
        default:
            return false;
    }
}
async function validateUrlForSSRF(urlStr) {
    if (process.env.DISABLE_SSRF_PROTECTION === 'true') {
        return;
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(urlStr);
    }
    catch (err) {
        throw new common_1.BadRequestException('Invalid URL format');
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new common_1.BadRequestException(`Unsupported protocol: ${parsedUrl.protocol}`);
    }
    let addresses = [];
    try {
        const lookupResult = await dns.lookup(parsedUrl.hostname, { all: true });
        addresses = lookupResult.map(res => res.address);
    }
    catch (err) {
        throw new common_1.BadRequestException(`Failed to resolve hostname: ${parsedUrl.hostname}`);
    }
    if (addresses.length === 0) {
        throw new common_1.BadRequestException('Hostname resolved to no IP addresses');
    }
    for (const ip of addresses) {
        if (isForbiddenIP(ip)) {
            throw new common_1.BadRequestException(`SSRF Attempt detected: Target resolves to forbidden/internal IP: ${ip}`);
        }
    }
}
async function safeFetch(url, options, maxRedirects = 5) {
    let currentUrl = url;
    let redirects = 0;
    while (redirects <= maxRedirects) {
        await validateUrlForSSRF(currentUrl);
        const fetchOptions = {
            ...options,
            redirect: 'manual',
        };
        const response = await fetch(currentUrl, fetchOptions);
        if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
            const location = response.headers.get('location');
            if (!location) {
                return response;
            }
            currentUrl = new URL(location, currentUrl).href;
            redirects++;
            continue;
        }
        return response;
    }
    throw new common_1.BadRequestException('Too many redirects');
}
//# sourceMappingURL=ssrf-validator.js.map