/**
 * Bridge Module
 * Browser extension communication utilities
 * @module bridge
 */

/**
 * Extension Detection Utilities
 */

/**
 * Check if Requestly extension is installed
 * @returns {Promise<boolean>} True if extension is installed
 */
export async function isExtensionInstalled() {
  if (typeof window === 'undefined' || !window.chrome || !window.chrome.runtime) {
    return false;
  }

  try {
    // Try to detect Requestly extension by sending a ping message
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);

      if (window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(
          'requestly-extension-id', // Extension ID
          { action: 'ping' },
          (response) => {
            clearTimeout(timeout);
            resolve(!!response);
          }
        );
      } else {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  } catch (error) {
    return false;
  }
}

/**
 * Get extension version
 * @returns {Promise<string|null>} Extension version or null
 */
export async function getExtensionVersion() {
  try {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 1000);

      if (window.chrome.runtime && window.chrome.runtime.sendMessage) {
        window.chrome.runtime.sendMessage(
          'requestly-extension-id',
          { action: 'getVersion' },
          (response) => {
            clearTimeout(timeout);
            resolve(response?.version || null);
          }
        );
      } else {
        clearTimeout(timeout);
        resolve(null);
      }
    });
  } catch (error) {
    return null;
  }
}

/**
 * Message Passing
 */

/**
 * Send message to extension
 * @param {string} action - Action type
 * @param {Object} data - Message data
 * @returns {Promise<any>} Response from extension
 */
export function sendMessageToExtension(action, data = {}) {
  return new Promise((resolve, reject) => {
    if (!window.chrome || !window.chrome.runtime) {
      reject(new Error('Extension runtime not available'));
      return;
    }

    try {
      window.chrome.runtime.sendMessage(
        'requestly-extension-id',
        { action, data },
        (response) => {
          if (window.chrome.runtime.lastError) {
            reject(new Error(window.chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Send message to content script
 * @param {number} tabId - Tab ID
 * @param {string} action - Action type
 * @param {Object} data - Message data
 * @returns {Promise<any>} Response from content script
 */
export function sendMessageToTab(tabId, action, data = {}) {
  return new Promise((resolve, reject) => {
    if (!window.chrome || !window.chrome.tabs) {
      reject(new Error('Chrome tabs API not available'));
      return;
    }

    try {
      window.chrome.tabs.sendMessage(
        tabId,
        { action, data },
        (response) => {
          if (window.chrome.runtime.lastError) {
            reject(new Error(window.chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Broadcast message to all tabs
 * @param {string} action - Action type
 * @param {Object} data - Message data
 * @returns {Promise<Array>} Array of responses
 */
export async function broadcastMessage(action, data = {}) {
  if (!window.chrome || !window.chrome.tabs) {
    throw new Error('Chrome tabs API not available');
  }

  const tabs = await new Promise((resolve) => {
    window.chrome.tabs.query({}, (tabs) => resolve(tabs));
  });

  const promises = tabs.map(tab =>
    sendMessageToTab(tab.id, action, data).catch(() => null)
  );

  return Promise.all(promises);
}

/**
 * Event Communication
 */

/**
 * Event emitter for cross-context communication
 */
export class EventBridge {
  constructor() {
    this.listeners = new Map();
    this.setupMessageListener();
  }

  /**
   * Setup Chrome runtime message listener
   */
  setupMessageListener() {
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.onMessage) {
      window.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action && this.listeners.has(message.action)) {
          const handlers = this.listeners.get(message.action);
          handlers.forEach(handler => {
            try {
              const result = handler(message.data, sender);
              if (result instanceof Promise) {
                result.then(sendResponse);
                return true; // Indicates async response
              } else {
                sendResponse(result);
              }
            } catch (error) {
              console.error('EventBridge handler error:', error);
            }
          });
        }
      });
    }
  }

  /**
   * Subscribe to an event
   * @param {string} action - Event action
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(action, handler) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set());
    }

    this.listeners.get(action).add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(action);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(action);
        }
      }
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} action - Event action
   * @param {Function} handler - Event handler
   */
  off(action, handler) {
    const handlers = this.listeners.get(action);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(action);
      }
    }
  }

  /**
   * Subscribe to an event once
   * @param {string} action - Event action
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  once(action, handler) {
    const wrappedHandler = (data, sender) => {
      this.off(action, wrappedHandler);
      return handler(data, sender);
    };
    return this.on(action, wrappedHandler);
  }

  /**
   * Emit an event
   * @param {string} action - Event action
   * @param {Object} data - Event data
   * @returns {Promise<any>}
   */
  async emit(action, data = {}) {
    return sendMessageToExtension(action, data);
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
}

/**
 * Create a new event bridge instance
 * @returns {EventBridge}
 */
export function createEventBridge() {
  return new EventBridge();
}

/**
 * Storage Bridge
 * Communicate with extension storage
 */

/**
 * Get item from extension storage
 * @param {string} key - Storage key
 * @returns {Promise<any>}
 */
export async function getFromExtensionStorage(key) {
  return sendMessageToExtension('getStorageItem', { key });
}

/**
 * Set item in extension storage
 * @param {string} key - Storage key
 * @param {any} value - Storage value
 * @returns {Promise<void>}
 */
export async function setInExtensionStorage(key, value) {
  return sendMessageToExtension('setStorageItem', { key, value });
}

/**
 * Remove item from extension storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function removeFromExtensionStorage(key) {
  return sendMessageToExtension('removeStorageItem', { key });
}

/**
 * Clear extension storage
 * @returns {Promise<void>}
 */
export async function clearExtensionStorage() {
  return sendMessageToExtension('clearStorage');
}
