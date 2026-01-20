/**
 * MV3 Extension - Package Integration Examples
 *
 * This file demonstrates how to use the integrated packages in the MV3 extension.
 * These are utility wrappers that can be imported and used throughout the extension.
 */

/**
 * ============================================================================
 * @requestly/validators - Input Validation
 * ============================================================================
 */
import {
  validateEmail,
  validateUrl,
  validateDomain,
  validateHttpMethod
} from '@requestly/validators';

/**
 * Validate rule configuration before saving
 */
export const validateRuleSource = (sourceUrl: string): { valid: boolean; error?: string } => {
  // Validate if source is a valid URL
  if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    return validateUrl(sourceUrl);
  }

  // Validate if source is a domain
  if (!sourceUrl.includes('/')) {
    return validateDomain(sourceUrl);
  }

  return { valid: true };
};

/**
 * Validate HTTP method for rule modification
 */
export const validateRequestMethod = (method: string): boolean => {
  return validateHttpMethod(method).valid;
};

/**
 * Validate email for team invites
 */
export const isValidEmail = (email: string): boolean => {
  return validateEmail(email).valid;
};

/**
 * ============================================================================
 * @requestly/utils - Common Utilities
 * ============================================================================
 */
import {
  debounce,
  throttle,
  formatDate,
  deepClone,
  generateId
} from '@requestly/utils';

/**
 * Debounced function for search/filter operations
 * Usage: const debouncedSearch = debouncedFunction(() => performSearch(), 300);
 */
export const debouncedFunction = debounce;

/**
 * Throttled function for scroll/resize events
 * Usage: const throttledHandler = throttledFunction(() => handleEvent(), 100);
 */
export const throttledFunction = throttle;

/**
 * Format timestamp for display
 * Usage: formatTimestamp(Date.now()) => "2026-01-20"
 */
export const formatTimestamp = (timestamp: number): string => {
  return formatDate(timestamp, 'yyyy-mm-dd');
};

/**
 * Deep clone objects (useful for rule modifications)
 */
export const cloneRule = <T>(rule: T): T => {
  return deepClone(rule);
};

/**
 * Generate unique IDs for rules/sessions
 */
export const generateUniqueId = (): string => {
  return generateId();
};

/**
 * ============================================================================
 * @requestly/storage - Storage Abstraction
 * ============================================================================
 */
import { createChromeStorageAdapter } from '@requestly/storage';

/**
 * Chrome Storage Adapter for extension
 * This provides a unified interface for chrome.storage operations
 */
export const ExtensionStorage = createChromeStorageAdapter(chrome.storage.local);

/**
 * Save rule draft
 */
export const saveDraftRule = async (ruleId: string, ruleData: any): Promise<void> => {
  await ExtensionStorage.set(`draft_rule_${ruleId}`, {
    ...ruleData,
    savedAt: Date.now()
  });
};

/**
 * Get rule draft
 */
export const getDraftRule = async (ruleId: string): Promise<any> => {
  return await ExtensionStorage.get(`draft_rule_${ruleId}`);
};

/**
 * Save user preferences
 */
export const saveUserPreference = async (key: string, value: any): Promise<void> => {
  await ExtensionStorage.set(`pref_${key}`, value);
};

/**
 * Get user preference
 */
export const getUserPreference = async <T>(key: string, defaultValue?: T): Promise<T> => {
  const value = await ExtensionStorage.get(`pref_${key}`);
  return value !== null ? value : defaultValue;
};

/**
 * ============================================================================
 * @requestly/bridge - Cross-Context Communication
 * ============================================================================
 */
import { createExtensionBridge, createMessageBus } from '@requestly/bridge';

/**
 * Extension Message Bridge for cross-context communication
 */
const messageBridge = createExtensionBridge();

/**
 * Send message to background script
 */
export const sendToBackground = async (action: string, data?: any): Promise<any> => {
  return messageBridge.sendMessage({
    target: 'background',
    action,
    data
  });
};

/**
 * Broadcast message to all tabs
 */
export const broadcastToAllTabs = async (action: string, data?: any): Promise<void> => {
  const tabs = await chrome.tabs.query({});
  const promises = tabs.map(tab => {
    if (tab.id) {
      return chrome.tabs.sendMessage(tab.id, { action, data }).catch(() => {
        // Tab might not have content script
      });
    }
  });
  await Promise.all(promises);
};

/**
 * Message Bus for event-driven communication
 */
const eventBus = createMessageBus();

/**
 * Publish event
 */
export const publishEvent = (event: string, data?: any): void => {
  eventBus.publish(event, data);
};

/**
 * Subscribe to event
 */
export const subscribeToEvent = (event: string, callback: (data: any) => void): () => void => {
  return eventBus.subscribe(event, callback);
};

/**
 * ============================================================================
 * @requestly/api-client - HTTP Client (Example)
 * ============================================================================
 *
 * Note: The actual API client integration should be done in:
 * src/service-worker/services/apiClient/index.ts
 *
 * This is just a reference for how to use it.
 */

/*
import { createApiClient } from '@requestly/api-client';

// Create API client instance
const apiClient = createApiClient('https://api2.requestly.io');

// Set auth token
apiClient.rules.setAuthToken('your-api-key');

// Fetch rules
const rules = await apiClient.rules.getRules();

// Create rule
const newRule = await apiClient.rules.createRule(ruleData);

// Update rule
const updated = await apiClient.rules.updateRule(ruleId, ruleData);

// Delete rule
await apiClient.rules.deleteRule(ruleId);
*/

/**
 * ============================================================================
 * Usage Examples in Extension
 * ============================================================================
 */

/**
 * Example 1: Validate and save a rule
 */
export const validateAndSaveRule = async (rule: any): Promise<boolean> => {
  // Validate source URL
  const sourceValidation = validateRuleSource(rule.source);
  if (!sourceValidation.valid) {
    console.error('Invalid source:', sourceValidation.error);
    return false;
  }

  // Validate destination if it exists
  if (rule.destination) {
    const destValidation = validateUrl(rule.destination);
    if (!destValidation.valid) {
      console.error('Invalid destination:', destValidation.error);
      return false;
    }
  }

  // Save as draft
  await saveDraftRule(rule.id, rule);

  // Publish event
  publishEvent('rule:saved', { ruleId: rule.id });

  return true;
};

/**
 * Example 2: Debounced search handler
 */
export const createDebouncedSearch = (searchFunction: (query: string) => void) => {
  return debounce((query: string) => {
    // Validate query
    if (query.includes('://')) {
      const validation = validateUrl(query);
      if (!validation.valid) {
        console.warn('Invalid URL in search:', validation.error);
      }
    }
    searchFunction(query);
  }, 300);
};

/**
 * Example 3: Clone and modify rule
 */
export const duplicateRule = async (originalRule: any): Promise<any> => {
  // Deep clone the rule
  const duplicatedRule = cloneRule(originalRule);

  // Generate new ID
  duplicatedRule.id = generateUniqueId();
  duplicatedRule.name = `${originalRule.name} (Copy)`;
  duplicatedRule.createdAt = Date.now();

  // Save as draft
  await saveDraftRule(duplicatedRule.id, duplicatedRule);

  return duplicatedRule;
};

/**
 * Example 4: Event-driven rule updates
 */
export const watchRuleChanges = (callback: (rule: any) => void): () => void => {
  return subscribeToEvent('rule:changed', callback);
};

/**
 * Example 5: User preferences management
 */
export const getUserTheme = async (): Promise<'light' | 'dark'> => {
  return await getUserPreference<'light' | 'dark'>('theme', 'light');
};

export const setUserTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  await saveUserPreference('theme', theme);
  publishEvent('theme:changed', { theme });
};
