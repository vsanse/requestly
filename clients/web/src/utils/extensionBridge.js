/**
 * Example integration of @requestly/bridge package
 *
 * This file demonstrates how to use the bridge package
 * for extension communication and cross-context messaging.
 */

import {
  isExtensionInstalled,
  getExtensionVersion,
  sendMessageToExtension,
  EventBridge,
  getFromExtensionStorage,
  setInExtensionStorage
} from "@requestly/bridge";

/**
 * Extension detection and version check
 */
export const ExtensionUtils = {
  async checkInstalled() {
    try {
      const installed = await isExtensionInstalled();
      return installed;
    } catch (error) {
      console.error("Error checking extension:", error);
      return false;
    }
  },

  async getVersion() {
    try {
      const version = await getExtensionVersion();
      return version;
    } catch (error) {
      console.error("Error getting extension version:", error);
      return null;
    }
  },

  async getInfo() {
    const installed = await this.checkInstalled();
    if (!installed) {
      return { installed: false };
    }

    const version = await this.getVersion();
    return {
      installed: true,
      version
    };
  }
};

/**
 * Rule sync bridge between web app and extension
 */
export const RuleSyncBridge = {
  async pushRulesToExtension(rules) {
    try {
      const response = await sendMessageToExtension("SYNC_RULES", { rules });
      return { success: true, response };
    } catch (error) {
      console.error("Failed to sync rules to extension:", error);
      return { success: false, error: error.message };
    }
  },

  async fetchRulesFromExtension() {
    try {
      const response = await sendMessageToExtension("GET_RULES", {});
      return { success: true, rules: response.rules };
    } catch (error) {
      console.error("Failed to fetch rules from extension:", error);
      return { success: false, error: error.message };
    }
  },

  async toggleRule(ruleId, enabled) {
    try {
      const response = await sendMessageToExtension("TOGGLE_RULE", {
        ruleId,
        enabled
      });
      return { success: true, response };
    } catch (error) {
      console.error("Failed to toggle rule:", error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Extension storage bridge
 */
export const ExtensionStorageBridge = {
  async getSyncedData(key) {
    try {
      const data = await getFromExtensionStorage(key);
      return data;
    } catch (error) {
      console.error(`Failed to get ${key} from extension:`, error);
      return null;
    }
  },

  async setSyncedData(key, value) {
    try {
      await setInExtensionStorage(key, value);
      return { success: true };
    } catch (error) {
      console.error(`Failed to set ${key} in extension:`, error);
      return { success: false, error: error.message };
    }
  },

  async getUserSettings() {
    return await this.getSyncedData("user_settings");
  },

  async saveUserSettings(settings) {
    return await this.setSyncedData("user_settings", settings);
  }
};

/**
 * Real-time event bridge for cross-context communication
 */
export class WebAppEventBridge {
  constructor() {
    this.bridge = new EventBridge();
    this.setupListeners();
  }

  setupListeners() {
    // Setup message listener for extension messages
    this.bridge.setupMessageListener({
      validateSender: (sender) => {
        // Validate messages from extension
        return sender.id && sender.origin === "extension";
      }
    });

    // Handle rule updates from extension
    this.bridge.on("ruleUpdated", (data) => {
      console.log("Rule updated in extension:", data);
      // Trigger UI update or Redux action
    });

    // Handle sync status changes
    this.bridge.on("syncStatusChanged", (data) => {
      console.log("Sync status changed:", data);
      // Update UI status indicator
    });
  }

  // Emit events to extension
  notifyRuleCreated(rule) {
    this.bridge.emit("ruleCreated", { rule });
  }

  notifyRuleDeleted(ruleId) {
    this.bridge.emit("ruleDeleted", { ruleId });
  }

  notifySettingsChanged(settings) {
    this.bridge.emit("settingsChanged", { settings });
  }

  // Subscribe to custom events
  onRuleUpdated(callback) {
    this.bridge.on("ruleUpdated", callback);
  }

  onSyncStatusChanged(callback) {
    this.bridge.on("syncStatusChanged", callback);
  }

  // Cleanup
  destroy() {
    this.bridge.clear();
  }
}

// Singleton instance
let eventBridgeInstance = null;

export const getEventBridge = () => {
  if (!eventBridgeInstance) {
    eventBridgeInstance = new WebAppEventBridge();
  }
  return eventBridgeInstance;
};

const BridgeUtils = {
  ExtensionUtils,
  RuleSyncBridge,
  ExtensionStorageBridge,
  getEventBridge
};

export default BridgeUtils;
