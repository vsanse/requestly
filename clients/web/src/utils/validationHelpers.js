/**
 * Example integration of @requestly/validators package
 *
 * This file demonstrates how to use the validators package
 * for common validation scenarios in the web client.
 */

import {
  validateEmail,
  validateUrl,
  validateDomain,
  validateJson,
  validateHttpMethod,
  validatePort
} from "@requestly/validators";

/**
 * Validate user input for rule creation
 */
export const validateRuleInput = (input) => {
  const errors = [];

  // Validate URLs
  if (input.sourceUrl && !validateUrl(input.sourceUrl)) {
    errors.push("Invalid source URL");
  }

  if (input.destinationUrl && !validateUrl(input.destinationUrl)) {
    errors.push("Invalid destination URL");
  }

  // Validate domains
  if (input.domain && !validateDomain(input.domain)) {
    errors.push("Invalid domain format");
  }

  // Validate HTTP method
  if (input.method && !validateHttpMethod(input.method)) {
    errors.push("Invalid HTTP method");
  }

  // Validate port
  if (input.port && !validatePort(input.port)) {
    errors.push("Port must be between 1 and 65535");
  }

  // Validate JSON body
  if (input.jsonBody) {
    const jsonValidation = validateJson(input.jsonBody);
    if (!jsonValidation.isValid) {
      errors.push(`Invalid JSON: ${jsonValidation.error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email for team invitations
 */
export const validateTeamInviteEmail = (email) => {
  const validation = validateEmail(email);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: "Please enter a valid email address"
    };
  }

  // Additional business logic validation
  const domain = email.split("@")[1];
  if (domain && !validateDomain(domain)) {
    return {
      isValid: false,
      error: "Email domain is invalid"
    };
  }

  return {
    isValid: true,
    email: validation.normalized
  };
};

/**
 * Validate API endpoint configuration
 */
export const validateApiEndpoint = (url, method = "GET") => {
  const errors = [];

  // Validate URL
  if (!validateUrl(url)) {
    errors.push("Invalid API endpoint URL");
  }

  // Validate HTTP method
  if (!validateHttpMethod(method)) {
    errors.push(`Invalid HTTP method: ${method}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Example: Comprehensive form validation
 */
export const validateMockServerConfig = (config) => {
  const errors = {};

  // Validate URL
  if (!config.url || !validateUrl(config.url)) {
    errors.url = "Please enter a valid URL";
  }

  // Validate method
  if (!config.method || !validateHttpMethod(config.method)) {
    errors.method = "Please select a valid HTTP method";
  }

  // Validate response body if provided
  if (config.responseBody) {
    const jsonValidation = validateJson(config.responseBody);
    if (!jsonValidation.isValid) {
      errors.responseBody = `Invalid JSON: ${jsonValidation.error}`;
    }
  }

  // Validate custom port if provided
  if (config.port && !validatePort(config.port)) {
    errors.port = "Port must be between 1 and 65535";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateRuleInput,
  validateTeamInviteEmail,
  validateApiEndpoint,
  validateMockServerConfig
};
