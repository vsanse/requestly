/**
 * Extension Storage Adapter
 * Adapts @requestly/storage to work with Chrome extension storage API
 */
import { createChromeStorageAdapter } from '@requestly/storage';

/**
 * Chrome Extension Storage Adapter
 * Provides a unified interface for extension storage
 */
export const ExtensionStorage = createChromeStorageAdapter(chrome.storage.local);

/**
 * User Preferences Manager for Extension
 */
export class ExtensionUserPreferences {
  private static KEYS = {
    THEME: 'user_theme',
    AUTO_SYNC: 'auto_sync_enabled',
    NOTIFICATION_SETTINGS: 'notification_settings',
    RECORDING_SETTINGS: 'recording_settings',
  };

  static async getTheme(): Promise<string> {
    return (await ExtensionStorage.get(this.KEYS.THEME)) || 'light';
  }

  static async setTheme(theme: string): Promise<void> {
    await ExtensionStorage.set(this.KEYS.THEME, theme);
  }

  static async isAutoSyncEnabled(): Promise<boolean> {
    return (await ExtensionStorage.get(this.KEYS.AUTO_SYNC)) ?? true;
  }

  static async setAutoSync(enabled: boolean): Promise<void> {
    await ExtensionStorage.set(this.KEYS.AUTO_SYNC, enabled);
  }

  static async getNotificationSettings(): Promise<any> {
    return (await ExtensionStorage.get(this.KEYS.NOTIFICATION_SETTINGS)) || {
      enabled: true,
      sound: true,
      desktop: true,
    };
  }

  static async setNotificationSettings(settings: any): Promise<void> {
    await ExtensionStorage.set(this.KEYS.NOTIFICATION_SETTINGS, settings);
  }

  static async getRecordingSettings(): Promise<any> {
    return (await ExtensionStorage.get(this.KEYS.RECORDING_SETTINGS)) || {
      quality: 'high',
      fps: 30,
      includeConsole: true,
    };
  }

  static async setRecordingSettings(settings: any): Promise<void> {
    await ExtensionStorage.set(this.KEYS.RECORDING_SETTINGS, settings);
  }
}

/**
 * Draft Rules Manager
 * Manages temporary rule drafts in extension storage
 */
export class DraftRulesManager {
  private static PREFIX = 'draft_rule_';

  static async saveDraft(ruleId: string, ruleData: any): Promise<void> {
    await ExtensionStorage.set(`${this.PREFIX}${ruleId}`, {
      ...ruleData,
      savedAt: Date.now(),
    });
  }

  static async getDraft(ruleId: string): Promise<any> {
    return await ExtensionStorage.get(`${this.PREFIX}${ruleId}`);
  }

  static async getAllDrafts(): Promise<any[]> {
    const allData = await ExtensionStorage.getAll();
    return Object.entries(allData)
      .filter(([key]) => key.startsWith(this.PREFIX))
      .map(([_, value]) => value);
  }

  static async deleteDraft(ruleId: string): Promise<void> {
    await ExtensionStorage.remove(`${this.PREFIX}${ruleId}`);
  }

  static async clearAllDrafts(): Promise<void> {
    const drafts = await this.getAllDrafts();
    const keys = Object.keys(drafts);
    await ExtensionStorage.remove(keys);
  }
}

/**
 * Session State Manager
 * Manages temporary session state
 */
export class SessionStateManager {
  private static KEYS = {
    ACTIVE_TAB: 'session_active_tab',
    RECORDING_STATE: 'session_recording_state',
    PENDING_ACTIONS: 'session_pending_actions',
  };

  static async setActiveTab(tabId: number, url: string): Promise<void> {
    await ExtensionStorage.set(this.KEYS.ACTIVE_TAB, { tabId, url, timestamp: Date.now() });
  }

  static async getActiveTab(): Promise<{ tabId: number; url: string; timestamp: number } | null> {
    return await ExtensionStorage.get(this.KEYS.ACTIVE_TAB);
  }

  static async setRecordingState(state: any): Promise<void> {
    await ExtensionStorage.set(this.KEYS.RECORDING_STATE, state);
  }

  static async getRecordingState(): Promise<any> {
    return await ExtensionStorage.get(this.KEYS.RECORDING_STATE);
  }

  static async addPendingAction(action: any): Promise<void> {
    const actions = (await ExtensionStorage.get(this.KEYS.PENDING_ACTIONS)) || [];
    actions.push({ ...action, timestamp: Date.now() });
    await ExtensionStorage.set(this.KEYS.PENDING_ACTIONS, actions);
  }

  static async getPendingActions(): Promise<any[]> {
    return (await ExtensionStorage.get(this.KEYS.PENDING_ACTIONS)) || [];
  }

  static async clearPendingActions(): Promise<void> {
    await ExtensionStorage.remove(this.KEYS.PENDING_ACTIONS);
  }
}
