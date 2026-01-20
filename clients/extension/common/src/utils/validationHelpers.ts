/**
 * Extension Validation Helpers
 * Uses @requestly/validators for common validation tasks
 */
import {
  validateEmail,
  validateUrl,
  validateDomain,
  validateJson,
  validateHttpMethod,
  validatePort,
  validateRegex,
  validatePath,
} from '@requestly/validators';

/**
 * Validate rule configuration
 */
export const validateRuleConfig = (rule: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate rule name
  if (!rule.name || rule.name.trim().length === 0) {
    errors.push('Rule name is required');
  }

  // Validate source URL patterns
  if (rule.pairs) {
    rule.pairs.forEach((pair: any, index: number) => {
      if (pair.source) {
        // Validate URL if it's not a regex
        if (!pair.source.startsWith('Regex:')) {
          const urlValidation = validateUrl(pair.source);
          if (!urlValidation.valid) {
            errors.push(`Pair ${index + 1}: Invalid source URL - ${urlValidation.error}`);
          }
        } else {
          // Validate regex pattern
          const regexPattern = pair.source.replace('Regex:', '').trim();
          const regexValidation = validateRegex(regexPattern);
          if (!regexValidation.valid) {
            errors.push(`Pair ${index + 1}: Invalid regex pattern - ${regexValidation.error}`);
          }
        }
      }

      // Validate destination URL for redirect rules
      if (pair.destination) {
        const destValidation = validateUrl(pair.destination);
        if (!destValidation.valid) {
          errors.push(`Pair ${index + 1}: Invalid destination URL - ${destValidation.error}`);
        }
      }
    });
  }

  // Validate headers
  if (rule.pairs) {
    rule.pairs.forEach((pair: any, index: number) => {
      if (pair.modifications) {
        pair.modifications.forEach((mod: any, modIndex: number) => {
          if (mod.type === 'Add' || mod.type === 'Modify') {
            if (!mod.header || mod.header.trim().length === 0) {
              errors.push(`Pair ${index + 1}, Modification ${modIndex + 1}: Header name is required`);
            }
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mock server configuration
 */
export const validateMockServerConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.endpoint) {
    errors.push('Endpoint path is required');
  } else {
    const pathValidation = validatePath(config.endpoint);
    if (!pathValidation.valid) {
      errors.push(`Invalid endpoint path: ${pathValidation.error}`);
    }
  }

  if (config.method) {
    const methodValidation = validateHttpMethod(config.method);
    if (!methodValidation.valid) {
      errors.push(`Invalid HTTP method: ${methodValidation.error}`);
    }
  }

  if (config.statusCode && (config.statusCode < 100 || config.statusCode > 599)) {
    errors.push('Status code must be between 100 and 599');
  }

  if (config.response && config.contentType === 'application/json') {
    const jsonValidation = validateJson(config.response);
    if (!jsonValidation.valid) {
      errors.push(`Invalid JSON response: ${jsonValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate desktop app connection settings
 */
export const validateDesktopAppConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.host) {
    errors.push('Host is required');
  }

  if (config.port) {
    const portValidation = validatePort(config.port.toString());
    if (!portValidation.valid) {
      errors.push(`Invalid port: ${portValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate team invite email
 */
export const validateTeamInviteEmail = (email: string): { valid: boolean; error?: string } => {
  const validation = validateEmail(email);
  return {
    valid: validation.valid,
    error: validation.error,
  };
};

/**
 * Validate API endpoint configuration
 */
export const validateApiEndpoint = (endpoint: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!endpoint.url) {
    errors.push('URL is required');
  } else {
    const urlValidation = validateUrl(endpoint.url);
    if (!urlValidation.valid) {
      errors.push(`Invalid URL: ${urlValidation.error}`);
    }
  }

  if (endpoint.method) {
    const methodValidation = validateHttpMethod(endpoint.method);
    if (!methodValidation.valid) {
      errors.push(`Invalid HTTP method: ${methodValidation.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate domain for rule matching
 */
export const validateDomainPattern = (domain: string): { valid: boolean; error?: string } => {
  return validateDomain(domain);
};

/**
 * Validate regex pattern for advanced matching
 */
export const validateRegexPattern = (pattern: string): { valid: boolean; error?: string } => {
  return validateRegex(pattern);
};
