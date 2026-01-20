/**
 * Example integration of @requestly/storage package
 *
 * This file demonstrates how to use the storage package
 * for unified storage operations across different environments.
 */

import { createStorageService } from "@requestly/storage";

// Create a storage service that auto-detects the environment
const storage = createStorageService();

/**
 * User preferences storage
 */
export const UserPreferences = {
  async save(preferences) {
    await storage.set("user_preferences", preferences);
  },

  async load() {
    return await storage.get("user_preferences") || {};
  },

  async update(key, value) {
    const prefs = await this.load();
    prefs[key] = value;
    await this.save(prefs);
  },

  async clear() {
    await storage.remove("user_preferences");
  }
};

/**
 * Recent searches storage
 */
export const RecentSearches = {
  MAX_ITEMS: 10,

  async add(searchTerm) {
    const searches = await this.getAll();

    // Remove duplicates and add to front
    const filtered = searches.filter(s => s !== searchTerm);
    filtered.unshift(searchTerm);

    // Limit to MAX_ITEMS
    const limited = filtered.slice(0, this.MAX_ITEMS);

    await storage.set("recent_searches", limited);
    return limited;
  },

  async getAll() {
    return await storage.get("recent_searches") || [];
  },

  async clear() {
    await storage.remove("recent_searches");
  }
};

/**
 * Draft rules storage
 */
export const DraftRules = {
  async save(ruleId, draftData) {
    const drafts = await this.getAll();
    drafts[ruleId] = {
      ...draftData,
      lastModified: Date.now()
    };
    await storage.set("draft_rules", drafts);
  },

  async load(ruleId) {
    const drafts = await this.getAll();
    return drafts[ruleId] || null;
  },

  async getAll() {
    return await storage.get("draft_rules") || {};
  },

  async delete(ruleId) {
    const drafts = await this.getAll();
    delete drafts[ruleId];
    await storage.set("draft_rules", drafts);
  },

  async clearAll() {
    await storage.remove("draft_rules");
  },

  async getKeys() {
    const drafts = await this.getAll();
    return Object.keys(drafts);
  }
};

/**
 * Session state storage (temporary)
 */
export const SessionState = {
  async save(key, value) {
    const state = await this.getAll();
    state[key] = value;
    await storage.set("session_state", state);
  },

  async load(key) {
    const state = await this.getAll();
    return state[key];
  },

  async getAll() {
    return await storage.get("session_state") || {};
  },

  async clear() {
    await storage.remove("session_state");
  }
};

/**
 * Export storage utilities
 */
export const StorageHelpers = {
  /**
   * Get all keys in storage
   */
  async getAllKeys() {
    return await storage.keys();
  },

  /**
   * Check if a key exists
   */
  async hasKey(key) {
    return await storage.has(key);
  },

  /**
   * Clear all storage (use with caution!)
   */
  async clearAll() {
    await storage.clear();
  },

  /**
   * Get storage statistics
   */
  async getStats() {
    const keys = await storage.keys();
    const stats = {
      totalKeys: keys.length,
      keys: keys
    };
    return stats;
  }
};

const StorageUtils = {
  UserPreferences,
  RecentSearches,
  DraftRules,
  SessionState,
  StorageHelpers
};

export default StorageUtils;
