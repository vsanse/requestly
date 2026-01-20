/**
 * Operating system detection utilities
 * Platform-agnostic OS detection for browser and Node.js environments
 * @module os
 */

/**
 * Operating system types
 * @enum {string}
 */
export const OS = {
  MACOS: 'macOS',
  IOS: 'iOS',
  WINDOWS: 'Windows',
  ANDROID: 'Android',
  LINUX: 'Linux',
};

// Cache for detected OS to avoid repeated detection
let detectedOS = null;

/**
 * Detects the user's operating system from browser environment
 * Uses navigator.userAgent and navigator.platform for detection
 *
 * @returns {string|null} - OS name from OS enum or null if unknown
 *
 * @example
 * const os = getUserOS();
 * if (os === OS.MACOS) {
 *   console.log('Running on macOS');
 * }
 */
export const getUserOS = () => {
  // Return cached result if available
  if (detectedOS) {
    return detectedOS;
  }

  // Browser environment check
  if (typeof window === 'undefined' || !window.navigator) {
    return null;
  }

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = OS.MACOS;
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = OS.IOS;
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = OS.WINDOWS;
  } else if (/Android/.test(userAgent)) {
    os = OS.ANDROID;
  } else if (!os && /Linux/.test(platform)) {
    os = OS.LINUX;
  }

  detectedOS = os;
  return os;
};

/**
 * Checks if the current OS is macOS
 * @returns {boolean}
 */
export const isMacOS = () => {
  return getUserOS() === OS.MACOS;
};

/**
 * Checks if the current OS is iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return getUserOS() === OS.IOS;
};

/**
 * Checks if the current OS is Windows
 * @returns {boolean}
 */
export const isWindows = () => {
  return getUserOS() === OS.WINDOWS;
};

/**
 * Checks if the current OS is Android
 * @returns {boolean}
 */
export const isAndroid = () => {
  return getUserOS() === OS.ANDROID;
};

/**
 * Checks if the current OS is Linux
 * @returns {boolean}
 */
export const isLinux = () => {
  return getUserOS() === OS.LINUX;
};

/**
 * Checks if the current OS is mobile (iOS or Android)
 * @returns {boolean}
 */
export const isMobile = () => {
  const os = getUserOS();
  return os === OS.IOS || os === OS.ANDROID;
};

/**
 * Checks if the current OS is desktop (macOS, Windows, or Linux)
 * @returns {boolean}
 */
export const isDesktop = () => {
  const os = getUserOS();
  return os === OS.MACOS || os === OS.WINDOWS || os === OS.LINUX;
};

/**
 * Resets the cached OS detection
 * Useful for testing or when environment changes
 */
export const resetOSCache = () => {
  detectedOS = null;
};
