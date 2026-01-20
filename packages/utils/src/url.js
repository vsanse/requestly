/**
 * URL and Path Utilities
 *
 * Pure utility functions for URL parsing, manipulation, and validation.
 * Platform-agnostic and works in both browser and Node.js environments.
 */

/**
 * Parse query parameters from URL search string
 * @param {string} searchString - URL search string (e.g., "?foo=bar&baz=qux")
 * @returns {Object} Object with query parameters as key-value pairs
 */
export const getQueryParamsAsMap = (searchString) => {
  const queryParams = {};

  // Handle both window.location.search and direct string input
  const search = searchString || (typeof window !== 'undefined' ? window.location.search : '');

  if (!search) return queryParams;

  try {
    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
  } catch (error) {
    // Fallback for environments without URLSearchParams
    console.error('Failed to parse query params:', error);
  }

  return queryParams;
};

/**
 * Extract route from path (max 2 sub-routes)
 * @param {string} path - Path string (e.g., "/foo/bar/baz")
 * @returns {string} Route with maximum 2 sub-routes (e.g., "/foo/bar")
 */
export const getRouteFromCurrentPath = (path) => {
  if (!path || typeof path !== 'string') return '';

  // Only taking maximum of 2 sub-routes
  const significantPathParts = path.split("/").slice(0, 3);
  const route = significantPathParts.join("/");
  return route;
};

/**
 * Add HTTPS prefix to URL if missing
 * @param {string} url - URL string
 * @returns {string} URL with HTTPS prefix
 */
export const prefixUrlWithHttps = (url) => {
  if (!url || typeof url !== 'string') return '';

  let newUrl = url.trim();
  if (newUrl && !newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
    newUrl = "https://" + newUrl;
  }
  return newUrl;
};

/**
 * Add URL scheme (http/https) if missing
 * @param {string} url - URL string
 * @param {string} scheme - Scheme to add (default: 'https')
 * @returns {string} URL with scheme
 */
export const addUrlSchemeIfMissing = (url, scheme = 'https') => {
  if (!url || typeof url !== 'string') return '';

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  return `${scheme}://${trimmedUrl}`;
};

/**
 * Extract domain/hostname from URL
 * @param {string} url - URL string
 * @returns {string} Domain/hostname or empty string if invalid
 */
export const getDomainFromURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    // Try to add scheme if missing for proper parsing
    let urlToParse = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToParse = 'https://' + url;
    }

    const parsedUrl = new URL(urlToParse);
    return parsedUrl.hostname;
  } catch (error) {
    // If URL parsing fails, return empty string
    return '';
  }
};

/**
 * Extract protocol from URL
 * @param {string} url - URL string
 * @returns {string} Protocol (e.g., "https:") or empty string if invalid
 */
export const getProtocolFromURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol;
  } catch (error) {
    return '';
  }
};

/**
 * Extract pathname from URL
 * @param {string} url - URL string
 * @returns {string} Pathname or empty string if invalid
 */
export const getPathnameFromURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname;
  } catch (error) {
    return '';
  }
};

/**
 * Check if two URLs have the same origin
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} True if origins match
 */
export const isSameOrigin = (url1, url2) => {
  if (!url1 || !url2) return false;

  try {
    const parsed1 = new URL(url1);
    const parsed2 = new URL(url2);
    return parsed1.origin === parsed2.origin;
  } catch (error) {
    return false;
  }
};

/**
 * Normalize URL by removing trailing slash and lowercasing domain
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export const normalizeURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    let trimmed = url.trim();

    // Remove trailing slash
    if (trimmed.endsWith('/')) {
      trimmed = trimmed.slice(0, -1);
    }

    // Parse and lowercase domain
    const parsed = new URL(trimmed);
    parsed.hostname = parsed.hostname.toLowerCase();

    return parsed.toString();
  } catch (error) {
    // If parsing fails, just remove trailing slash
    return url.trim().replace(/\/$/, '');
  }
};

/**
 * Join URL parts correctly
 * @param {string} base - Base URL
 * @param {...string} parts - URL parts to join
 * @returns {string} Joined URL
 */
export const joinURL = (base, ...parts) => {
  if (!base || typeof base !== 'string') return '';

  let url = base.replace(/\/+$/, ''); // Remove trailing slashes from base

  for (const part of parts) {
    if (part && typeof part === 'string') {
      const cleaned = part.replace(/^\/+/, '').replace(/\/+$/, ''); // Remove leading and trailing slashes
      if (cleaned) {
        url += '/' + cleaned;
      }
    }
  }

  return url;
};
