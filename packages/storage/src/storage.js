/**
 * Storage Module
 * Platform-agnostic storage abstraction for browser, Node.js, and VS Code
 * @module storage
 */

/**
 * Storage Service Interface
 * All storage implementations must follow this interface
 * @interface IStorageService
 */
export class IStorageService {
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} Stored value or null if not found
   */
  async get(key) {
    throw new Error('Method "get" must be implemented');
  }

  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    throw new Error('Method "set" must be implemented');
  }

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    throw new Error('Method "remove" must be implemented');
  }

  /**
   * Clear all values from storage
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Method "clear" must be implemented');
  }

  /**
   * Get all keys from storage
   * @returns {Promise<string[]>} Array of all keys
   */
  async keys() {
    throw new Error('Method "keys" must be implemented');
  }

  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key) {
    throw new Error('Method "has" must be implemented');
  }
}

/**
 * LocalStorage Service (Browser)
 * Uses window.localStorage for browser environments
 */
export class LocalStorageService extends IStorageService {
  constructor() {
    super();
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage is not available in this environment');
    }
  }

  async get(key) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting key "${key}" from localStorage:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key "${key}" in localStorage:`, error);
      throw error;
    }
  }

  async remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}" from localStorage:`, error);
      throw error;
    }
  }

  async clear() {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw error;
    }
  }

  async keys() {
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  async has(key) {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking key "${key}" in localStorage:`, error);
      return false;
    }
  }
}

/**
 * File Storage Service (Node.js/CLI)
 * Uses fs module for file-based storage
 * Note: This is a basic implementation. In production, you might want to use a proper database.
 */
export class FileStorageService extends IStorageService {
  constructor(storagePath = './.storage') {
    super();
    this.storagePath = storagePath;
    this.fs = null;
    this.path = null;

    // Lazy load Node.js modules only when needed
    if (typeof window === 'undefined') {
      try {
        this.fs = require('fs');
        this.path = require('path');
        this._ensureStorageDirectory();
      } catch (error) {
        throw new Error('FileStorageService requires Node.js fs and path modules');
      }
    } else {
      throw new Error('FileStorageService is only available in Node.js environments');
    }
  }

  _ensureStorageDirectory() {
    if (!this.fs.existsSync(this.storagePath)) {
      this.fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  _getFilePath(key) {
    return this.path.join(this.storagePath, `${key}.json`);
  }

  async get(key) {
    try {
      const filePath = this._getFilePath(key);
      if (!this.fs.existsSync(filePath)) {
        return null;
      }
      const data = this.fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error getting key "${key}" from file storage:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      const filePath = this._getFilePath(key);
      this.fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error setting key "${key}" in file storage:`, error);
      throw error;
    }
  }

  async remove(key) {
    try {
      const filePath = this._getFilePath(key);
      if (this.fs.existsSync(filePath)) {
        this.fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error removing key "${key}" from file storage:`, error);
      throw error;
    }
  }

  async clear() {
    try {
      const files = this.fs.readdirSync(this.storagePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          this.fs.unlinkSync(this.path.join(this.storagePath, file));
        }
      }
    } catch (error) {
      console.error('Error clearing file storage:', error);
      throw error;
    }
  }

  async keys() {
    try {
      const files = this.fs.readdirSync(this.storagePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Error getting file storage keys:', error);
      return [];
    }
  }

  async has(key) {
    try {
      const filePath = this._getFilePath(key);
      return this.fs.existsSync(filePath);
    } catch (error) {
      console.error(`Error checking key "${key}" in file storage:`, error);
      return false;
    }
  }
}

/**
 * VS Code Storage Service
 * Uses VS Code's ExtensionContext storage APIs
 */
export class VSCodeStorageService extends IStorageService {
  constructor(context) {
    super();
    if (!context || !context.globalState) {
      throw new Error('VSCodeStorageService requires a valid ExtensionContext with globalState');
    }
    this.context = context;
  }

  async get(key) {
    try {
      return this.context.globalState.get(key) ?? null;
    } catch (error) {
      console.error(`Error getting key "${key}" from VS Code storage:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.context.globalState.update(key, value);
    } catch (error) {
      console.error(`Error setting key "${key}" in VS Code storage:`, error);
      throw error;
    }
  }

  async remove(key) {
    try {
      await this.context.globalState.update(key, undefined);
    } catch (error) {
      console.error(`Error removing key "${key}" from VS Code storage:`, error);
      throw error;
    }
  }

  async clear() {
    try {
      const allKeys = this.context.globalState.keys();
      for (const key of allKeys) {
        await this.context.globalState.update(key, undefined);
      }
    } catch (error) {
      console.error('Error clearing VS Code storage:', error);
      throw error;
    }
  }

  async keys() {
    try {
      return this.context.globalState.keys();
    } catch (error) {
      console.error('Error getting VS Code storage keys:', error);
      return [];
    }
  }

  async has(key) {
    try {
      return this.context.globalState.get(key) !== undefined;
    } catch (error) {
      console.error(`Error checking key "${key}" in VS Code storage:`, error);
      return false;
    }
  }
}

/**
 * Storage Factory
 * Automatically detects environment and returns appropriate storage service
 * @param {Object} options - Configuration options
 * @param {string} options.type - Force specific storage type ('local', 'file', 'vscode')
 * @param {string} options.storagePath - Path for file storage (Node.js only)
 * @param {Object} options.context - VS Code ExtensionContext (VS Code only)
 * @returns {IStorageService} Storage service instance
 */
export function createStorageService(options = {}) {
  const { type, storagePath, context } = options;

  // Force specific type if provided
  if (type === 'local') {
    return new LocalStorageService();
  }
  if (type === 'file') {
    return new FileStorageService(storagePath);
  }
  if (type === 'vscode') {
    return new VSCodeStorageService(context);
  }

  // Auto-detect environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return new LocalStorageService();
  }

  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return new FileStorageService(storagePath);
  }

  throw new Error('Unable to determine appropriate storage service for this environment');
}
