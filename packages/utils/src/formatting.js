/**
 * String and Data Formatting Utilities
 *
 * Pure utility functions for string manipulation, data formatting,
 * and validation. Platform-agnostic and zero-dependency.
 */

/**
 * Generate a random object ID
 * @returns {string} Random 5-character alphanumeric string
 */
export const generateObjectId = () => {
  return Math.random().toString(36).substr(2, 5);
};

/**
 * Generate a shared list ID based on timestamp
 * @returns {number} Current timestamp in milliseconds
 */
export const generateSharedListId = () => {
  return Date.now();
};

/**
 * Convert camelCase or snake_case strings to readable format
 * Example: "sharedLists" -> "shared lists"
 * @param {string} string - Input string to format
 * @returns {string} Formatted string with spaces
 */
export const getPrettyString = (string) => {
  if (!string || typeof string !== 'string') return '';

  return string
    .replaceAll("_", " ")
    .match(/([A-Z]?[^A-Z]*)/g)
    .slice(0, -1)
    .map((word) => word.toLowerCase())
    .join(" ");
};

/**
 * Validate if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
export const isValidUrl = (string) => {
  if (!string || typeof string !== 'string') return false;

  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Validate if a URL is a valid Requestly URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Requestly URL, false otherwise
 */
export const isValidRQUrl = (url) => {
  if (!isValidUrl(url)) return false;

  try {
    const urlObj = new URL(url);
    const requestlyDomains = ['requestly.io', 'requestly.com', 'sessionbear.com'];
    return requestlyDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (_) {
    return false;
  }
};

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string|undefined} Domain part of email
 */
export const getDomainFromEmail = (email) => {
  if (!email || typeof email !== 'string') return undefined;
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : undefined;
};

/**
 * Extract company name from email domain
 * @param {string} email - Email address
 * @returns {string|undefined} Capitalized company name
 */
export const getCompanyNameFromEmail = (email) => {
  if (!email) return undefined;
  const domain = getDomainFromEmail(email);
  if (!domain) return undefined;

  const companyName = domain.split(".")[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1);
};

/**
 * Calculate byte size of a string
 * @param {string} inputString - String to measure
 * @returns {number} Size in bytes
 */
export const getByteSize = (inputString) => {
  if (typeof inputString !== 'string') return 0;

  // Use TextEncoder for accurate byte size calculation (works in Node.js and browsers)
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(inputString).length;
  }

  // Fallback for environments without TextEncoder
  return new Blob([inputString]).size;
};

/**
 * Filter array to keep only unique objects by ID
 * @param {Array<{id: any}>} myArr - Array of objects with id property
 * @returns {Array} Array with duplicate IDs removed
 */
export const filterUniqueObjects = (myArr) => {
  if (!Array.isArray(myArr)) return [];

  const seen = new Set();
  return myArr.filter((el) => {
    if (!el || !el.id) return false;
    const duplicate = seen.has(el.id);
    seen.add(el.id);
    return !duplicate;
  });
};

/**
 * Remove trailing slash from URL or path
 * @param {string} url - URL or path string
 * @returns {string} URL without trailing slash
 */
export const removeTrailingSlash = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace(/\/$/, "");
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isEmailValid = (email) => {
  if (!email || typeof email !== 'string') return false;

  // Check for whitespace and basic email pattern
  return !/\s/.test(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Convert flat array of rules to object with IDs as keys
 * Transforms [[...],[...]] -> {id:[],id:[]}
 * @param {Array} inputArray - Array of rule objects with id property
 * @returns {Object} Object with rule IDs as keys
 */
export const rulesFlatObjectToObjectIdArray = (inputArray) => {
  if (!Array.isArray(inputArray)) return {};

  const myRecords = {};
  inputArray.forEach((rule) => {
    if (rule && rule.id) {
      myRecords[rule.id] = rule;
    }
  });
  return myRecords;
};

/**
 * Get a greeting based on time of day
 * @returns {string} "Good Morning", "Good Afternoon", or "Good Evening"
 */
export const getGreeting = () => {
  const myDate = new Date();
  const hrs = myDate.getHours();

  if (hrs < 12) return "Good Morning";
  else if (hrs >= 12 && hrs <= 17) return "Good Afternoon";
  else return "Good Evening";
};

/**
 * Convert plan name to pretty display format
 * @param {string} planName - Raw plan name (e.g., "professional", "basic_v2")
 * @returns {string} Formatted plan name (e.g., "Professional", "Basic")
 */
export const getPrettyPlanName = (planName) => {
  if (!planName) return '';

  const planNameLower = planName.toLowerCase();

  // Handle specific plan name mappings
  const planNameMap = {
    'professional': 'Professional',
    'basic': 'Basic',
    'basic_v2': 'Basic',
    'enterprise': 'Enterprise',
    'gold': 'Gold',
    'lite': 'Lite',
    'free': 'Free',
    'bronze': 'Bronze',
    'silver': 'Silver',
  };

  // Return mapped name if found, otherwise capitalize first letter of each word
  if (planNameMap[planNameLower]) {
    return planNameMap[planNameLower];
  }

  // Handle snake_case and capitalize each word
  return planName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
