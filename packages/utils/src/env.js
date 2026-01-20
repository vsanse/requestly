/**
 * Environment Detection Utilities
 *
 * Platform-agnostic utilities for detecting runtime environment,
 * execution context, and platform-specific configurations.
 */

/**
 * Check if running in Node.js environment
 * @returns {boolean} True if Node.js environment
 */
export const isNodeEnvironment = () => {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
};

/**
 * Check if running in browser environment
 * @returns {boolean} True if browser environment
 */
export const isBrowserEnvironment = () => {
  return typeof window !== 'undefined' &&
         typeof window.document !== 'undefined';
};

/**
 * Check if running in Web Worker environment
 * @returns {boolean} True if Web Worker environment
 */
export const isWebWorkerEnvironment = () => {
  return typeof self === 'object' &&
         self.constructor &&
         self.constructor.name === 'DedicatedWorkerGlobalScope';
};

/**
 * Check if development environment
 * @returns {boolean} True if NODE_ENV is development
 */
export const isNodeEnvDev = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

/**
 * Check if production environment
 * @returns {boolean} True if NODE_ENV is production
 */
export const isNodeEnvProduction = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  return false;
};

/**
 * Check if test environment
 * @returns {boolean} True if NODE_ENV is test
 */
export const isNodeEnvTest = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'test';
  }
  return false;
};

/**
 * Check if automation environment (CI/CD)
 * @returns {boolean} True if running in automation
 */
export const isEnvAutomation = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.CI === 'true' ||
           process.env.CONTINUOUS_INTEGRATION === 'true' ||
           process.env.AUTOMATION === 'true';
  }
  return false;
};

/**
 * Get environment variable value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string|undefined} Environment variable value
 */
export const getEnvVar = (key, defaultValue = undefined) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

/**
 * Check if specific backend environment
 * Note: These are application-specific and may need customization
 * @param {string} envName - Environment name to check
 * @returns {boolean} True if matches backend environment
 */
export const isBackendEnv = (envName) => {
  const backendEnv = getEnvVar('BACKEND_ENV', '');
  return backendEnv === envName;
};

/**
 * Check if backend environment is emulator
 * @returns {boolean} True if emulator environment
 */
export const isBackendEnvEmulator = () => {
  return isBackendEnv('emulator');
};

/**
 * Check if backend environment is beta
 * @returns {boolean} True if beta environment
 */
export const isBackendEnvBeta = () => {
  return isBackendEnv('beta');
};

/**
 * Check if backend environment is staging
 * @returns {boolean} True if staging environment
 */
export const isBackendEnvStaging = () => {
  return isBackendEnv('staging');
};

/**
 * Check if backend environment is production
 * @returns {boolean} True if production backend environment
 */
export const isBackendEnvProduction = () => {
  return isBackendEnv('production');
};

/**
 * Get platform name (browser, node, webworker)
 * @returns {string} Platform name
 */
export const getPlatform = () => {
  if (isWebWorkerEnvironment()) return 'webworker';
  if (isBrowserEnvironment()) return 'browser';
  if (isNodeEnvironment()) return 'node';
  return 'unknown';
};

/**
 * Check if running in development mode
 * Checks both NODE_ENV and common development indicators
 * @returns {boolean} True if development mode
 */
export const isDevelopment = () => {
  return isNodeEnvDev() ||
         getEnvVar('DEV') === 'true' ||
         getEnvVar('DEVELOPMENT') === 'true';
};

/**
 * Check if running in production mode
 * @returns {boolean} True if production mode
 */
export const isProduction = () => {
  return isNodeEnvProduction() ||
         getEnvVar('PROD') === 'true' ||
         getEnvVar('PRODUCTION') === 'true';
};
