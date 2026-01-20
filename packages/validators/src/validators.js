/**
 * Validators Module
 * Centralized validation logic for emails, URLs, rules, domains, etc.
 * @module validators
 */

/**
 * Validation result interface
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} [errors] - Array of error messages if validation failed
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {ValidationResult}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, errors: ['Email is required'] };
  }

  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, errors: ['Invalid email format'] };
  }

  return { valid: true };
};

/**
 * Validate URL format (must start with http://, https://, ftp://, or javascript:)
 * @param {string} url - URL to validate
 * @returns {ValidationResult}
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, errors: ['URL is required'] };
  }

  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:', 'ftp:', 'javascript:'];

    if (!validProtocols.includes(urlObj.protocol)) {
      return { valid: false, errors: ['URL must use http, https, ftp, or javascript protocol'] };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, errors: ['Invalid URL format'] };
  }
};

/**
 * Validate Requestly-specific URL format
 * @param {string} url - Requestly URL to validate
 * @returns {ValidationResult}
 */
export const validateRequestlyUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, errors: ['Requestly URL is required'] };
  }

  const urlValidation = validateUrl(url);
  if (!urlValidation.valid) {
    return urlValidation;
  }

  // Check if it's a Requestly domain
  const requestlyDomains = ['requestly.io', 'requestly.com', 'sessionbear.com'];
  const urlObj = new URL(url);
  const isRequestlyDomain = requestlyDomains.some(domain => urlObj.hostname.includes(domain));

  if (!isRequestlyDomain) {
    return { valid: false, errors: ['URL must be from a Requestly domain'] };
  }

  return { valid: true };
};

/**
 * Validate domain name format
 * @param {string} domain - Domain to validate
 * @returns {ValidationResult}
 */
export const validateDomain = (domain) => {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, errors: ['Domain is required'] };
  }

  const trimmedDomain = domain.trim().toLowerCase();
  // Basic domain regex: alphanumeric with dots and hyphens
  const domainRegex = /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;

  if (!domainRegex.test(trimmedDomain)) {
    return { valid: false, errors: ['Invalid domain format'] };
  }

  return { valid: true };
};

/**
 * Validate rule object structure
 * @param {Object} rule - Rule object to validate
 * @returns {ValidationResult}
 */
export const validateRule = (rule) => {
  const errors = [];

  if (!rule || typeof rule !== 'object') {
    return { valid: false, errors: ['Rule must be an object'] };
  }

  // Check required fields
  if (!rule.id) errors.push('Rule must have an id');
  if (!rule.name) errors.push('Rule must have a name');
  if (!rule.ruleType) errors.push('Rule must have a ruleType');
  if (!Array.isArray(rule.pairs)) errors.push('Rule must have a pairs array');

  // Check rule status
  if (rule.status && !['Active', 'Inactive'].includes(rule.status)) {
    errors.push('Rule status must be Active or Inactive');
  }

  // Check pairs structure
  if (Array.isArray(rule.pairs)) {
    rule.pairs.forEach((pair, index) => {
      if (!pair.id) errors.push(`Pair at index ${index} must have an id`);
      if (pair.source === undefined) errors.push(`Pair at index ${index} must have a source`);
    });
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true };
};

/**
 * Validate IP address format (IPv4 and IPv6)
 * @param {string} ip - IP address to validate
 * @returns {ValidationResult}
 */
export const validateIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, errors: ['IP address is required'] };
  }

  const trimmedIp = ip.trim();

  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  const isIpv4 = ipv4Regex.test(trimmedIp);
  const isIpv6 = ipv6Regex.test(trimmedIp);

  if (!isIpv4 && !isIpv6) {
    return { valid: false, errors: ['Invalid IP address format'] };
  }

  // Additional IPv4 validation: each octet should be 0-255
  if (isIpv4) {
    const octets = trimmedIp.split('.');
    const invalidOctet = octets.some(octet => {
      const num = parseInt(octet, 10);
      return isNaN(num) || num < 0 || num > 255;
    });

    if (invalidOctet) {
      return { valid: false, errors: ['IPv4 octets must be between 0 and 255'] };
    }
  }

  return { valid: true };
};

/**
 * Validate regex pattern string
 * @param {string} pattern - Regex pattern to validate
 * @returns {ValidationResult}
 */
export const validateRegexPattern = (pattern) => {
  if (!pattern || typeof pattern !== 'string') {
    return { valid: false, errors: ['Regex pattern is required'] };
  }

  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: [`Invalid regex pattern: ${error.message}`] };
  }
};

/**
 * Validate port number
 * @param {number|string} port - Port number to validate
 * @returns {ValidationResult}
 */
export const validatePort = (port) => {
  const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNumber)) {
    return { valid: false, errors: ['Port must be a number'] };
  }

  if (portNumber < 1 || portNumber > 65535) {
    return { valid: false, errors: ['Port must be between 1 and 65535'] };
  }

  return { valid: true };
};

/**
 * Validate HTTP method
 * @param {string} method - HTTP method to validate
 * @returns {ValidationResult}
 */
export const validateHttpMethod = (method) => {
  if (!method || typeof method !== 'string') {
    return { valid: false, errors: ['HTTP method is required'] };
  }

  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const upperMethod = method.toUpperCase();

  if (!validMethods.includes(upperMethod)) {
    return { valid: false, errors: [`Invalid HTTP method. Must be one of: ${validMethods.join(', ')}`] };
  }

  return { valid: true };
};

/**
 * Validate JSON string
 * @param {string} jsonString - JSON string to validate
 * @returns {ValidationResult}
 */
export const validateJson = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return { valid: false, errors: ['JSON string is required'] };
  }

  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: [`Invalid JSON: ${error.message}`] };
  }
};

/**
 * Validate file extension
 * @param {string} filename - Filename to validate
 * @param {string[]} allowedExtensions - Array of allowed extensions (e.g., ['.js', '.ts'])
 * @returns {ValidationResult}
 */
export const validateFileExtension = (filename, allowedExtensions) => {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, errors: ['Filename is required'] };
  }

  if (!Array.isArray(allowedExtensions) || allowedExtensions.length === 0) {
    return { valid: false, errors: ['Allowed extensions array is required'] };
  }

  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const isValid = allowedExtensions.some(ext => ext.toLowerCase() === extension);

  if (!isValid) {
    return {
      valid: false,
      errors: [`File extension must be one of: ${allowedExtensions.join(', ')}`]
    };
  }

  return { valid: true };
};

// Convenience exports for backward compatibility
export const isEmailValid = (email) => validateEmail(email).valid;
export const isValidUrl = (url) => validateUrl(url).valid;
export const isValidRQUrl = (url) => validateRequestlyUrl(url).valid;
export const isValidDomain = (domain) => validateDomain(domain).valid;
export const isValidIp = (ip) => validateIpAddress(ip).valid;
export const isValidRegex = (pattern) => validateRegexPattern(pattern).valid;
export const isValidPort = (port) => validatePort(port).valid;
export const isValidHttpMethod = (method) => validateHttpMethod(method).valid;
export const isValidJson = (jsonString) => validateJson(jsonString).valid;
