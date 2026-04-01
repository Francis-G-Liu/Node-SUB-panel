import * as dns from 'dns/promises';
import { BadRequestException } from '@nestjs/common';
import * as ipAddr from 'ipaddr.js';

/**
 * Parses the provided string to an IP address object, if possible.
 */
function parseIP(ipStr: string) {
  try {
    return ipAddr.parse(ipStr);
  } catch (e) {
    return null;
  }
}

/**
 * Checks if the given IP address is in a forbidden range (e.g. localhost, private networks, link-local / IMDS)
 */
export function isForbiddenIP(ip: string): boolean {
  const parsed = parseIP(ip);
  if (!parsed) return false;

  const range = parsed.range();
  
  // Forbidden ranges:
  // - loopback: 127.0.0.0/8, ::1
  // - private: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
  // - linkLocal: 169.254.0.0/16, fe80::/10  (includes AWS IMDS 169.254.169.254)
  // - unspec: 0.0.0.0, ::
  // - broadcast: 255.255.255.255

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

/**
 * Validates a URL to prevent Server-Side Request Forgery (SSRF) attacks.
 * It ensures the protocol is valid and that the resolved IP address is not internal.
 */
export async function validateUrlForSSRF(urlStr: string): Promise<void> {
  // Allow bypassing in development environment if needed
  if (process.env.DISABLE_SSRF_PROTECTION === 'true') {
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch (err) {
    throw new BadRequestException('Invalid URL format');
  }

  // Only allow HTTP and HTTPS
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new BadRequestException(`Unsupported protocol: ${parsedUrl.protocol}`);
  }

  // Resolve hostname to IP
  let addresses: string[] = [];
  try {
    // dns.promises.lookup returns both IPv4 and IPv6 available addresses
    const lookupResult = await dns.lookup(parsedUrl.hostname, { all: true });
    addresses = lookupResult.map(res => res.address);
  } catch (err) {
    throw new BadRequestException(`Failed to resolve hostname: ${parsedUrl.hostname}`);
  }

  if (addresses.length === 0) {
    throw new BadRequestException('Hostname resolved to no IP addresses');
  }

  // Check if ANY of the resolved IPs are forbidden
  for (const ip of addresses) {
    if (isForbiddenIP(ip)) {
      throw new BadRequestException(`SSRF Attempt detected: Target resolves to forbidden/internal IP: ${ip}`);
    }
  }
}

/**
 * A wrapper over global `fetch` that pre-validates the URL to prevent SSRF
 * and manually handles redirects up to a certain limit so that each hop is validated.
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
  maxRedirects: number = 5
): Promise<Response> {
  let currentUrl = url;
  let redirects = 0;

  while (redirects <= maxRedirects) {
    // 1. Validate the current URL before actually requesting it
    await validateUrlForSSRF(currentUrl);

    // 2. Fetch the URL but DO NOT follow redirects automatically
    const fetchOptions: RequestInit = {
      ...options,
      redirect: 'manual', // Intercept 3xx status codes
    };

    const response = await fetch(currentUrl, fetchOptions);

    // 3. Handle redirects manually
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      const location = response.headers.get('location');
      if (!location) {
        return response; 
      }
      
      // Resolve relative redirects against the current URL
      currentUrl = new URL(location, currentUrl).href;
      redirects++;
      continue;
    }

    return response;
  }

  throw new BadRequestException('Too many redirects');
}
