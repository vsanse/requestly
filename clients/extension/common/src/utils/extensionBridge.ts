/**
 * Extension Bridge Utilities
 * Uses @requestly/bridge for cross-context communication
 */
import { createExtensionBridge, createMessageBus, createEventBridge } from '@requestly/bridge';

/**
 * Extension Message Bridge
 * Handles communication between extension contexts (popup, background, content scripts)
 */
export class ExtensionMessageBridge {
  private static bridge = createExtensionBridge();

  /**
   * Send message from popup to background script
   */
  static async sendToBackground(action: string, data?: any): Promise<any> {
    return this.bridge.sendMessage({
      target: 'background',
      action,
      data,
    });
  }

  /**
   * Send message from background to content script
   */
  static async sendToContentScript(tabId: number, action: string, data?: any): Promise<any> {
    return chrome.tabs.sendMessage(tabId, {
      action,
      data,
    });
  }

  /**
   * Send message from content script to background
   */
  static async sendFromContentScript(action: string, data?: any): Promise<any> {
    return chrome.runtime.sendMessage({
      action,
      data,
    });
  }

  /**
   * Broadcast message to all tabs
   */
  static async broadcast(action: string, data?: any): Promise<void> {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action, data }).catch(() => {
          // Tab might not have content script injected
        });
      }
    });
  }

  /**
   * Listen for messages in background script
   */
  static onBackgroundMessage(
    callback: (message: any, sender: chrome.runtime.MessageSender) => any | Promise<any>
  ): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      Promise.resolve(callback(message, sender))
        .then(sendResponse)
        .catch((error) => {
          console.error('Message handler error:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response
    });
  }

  /**
   * Listen for messages in content script
   */
  static onContentScriptMessage(callback: (message: any) => any | Promise<any>): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      Promise.resolve(callback(message))
        .then(sendResponse)
        .catch((error) => {
          console.error('Message handler error:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response
    });
  }
}

/**
 * Rule Sync Bridge
 * Syncs rules between extension and web app
 */
export class RuleSyncBridge {
  private static eventBridge = createEventBridge();

  /**
   * Sync rules from web app to extension
   */
  static async syncRulesFromWeb(): Promise<void> {
    const rules = await ExtensionMessageBridge.sendToBackground('GET_RULES');
    this.eventBridge.emit('rules:synced', { rules });
  }

  /**
   * Push rule changes to web app
   */
  static async pushRulesToWeb(rules: any[]): Promise<void> {
    await ExtensionMessageBridge.sendToBackground('SYNC_RULES', { rules });
    this.eventBridge.emit('rules:pushed', { count: rules.length });
  }

  /**
   * Listen for rule sync events
   */
  static onRulesChanged(callback: (rules: any[]) => void): () => void {
    return this.eventBridge.on('rules:changed', ({ rules }) => callback(rules));
  }

  /**
   * Watch for storage changes
   */
  static watchRuleChanges(callback: (changes: any) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        callback(changes);
      }
    });
  }
}

/**
 * Recording Event Bridge
 * Manages session recording events
 */
export class RecordingEventBridge {
  private static messageBus = createMessageBus();

  /**
   * Start recording session
   */
  static async startRecording(tabId: number, options: any = {}): Promise<void> {
    await ExtensionMessageBridge.sendToBackground('START_RECORDING', { tabId, options });
    this.messageBus.publish('recording:started', { tabId });
  }

  /**
   * Stop recording session
   */
  static async stopRecording(tabId: number): Promise<void> {
    await ExtensionMessageBridge.sendToBackground('STOP_RECORDING', { tabId });
    this.messageBus.publish('recording:stopped', { tabId });
  }

  /**
   * Listen for recording events
   */
  static onRecordingEvent(
    event: 'started' | 'stopped' | 'paused' | 'resumed',
    callback: (data: any) => void
  ): () => void {
    return this.messageBus.subscribe(`recording:${event}`, callback);
  }

  /**
   * Broadcast recording status to all contexts
   */
  static async broadcastStatus(status: any): Promise<void> {
    await ExtensionMessageBridge.broadcast('RECORDING_STATUS', status);
  }
}

/**
 * Tab Communication Bridge
 * Handles communication with specific tabs
 */
export class TabCommunicationBridge {
  /**
   * Send message to specific tab
   */
  static async sendToTab(tabId: number, action: string, data?: any): Promise<any> {
    return ExtensionMessageBridge.sendToContentScript(tabId, action, data);
  }

  /**
   * Get active tab and send message
   */
  static async sendToActiveTab(action: string, data?: any): Promise<any> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      return this.sendToTab(tab.id, action, data);
    }
    throw new Error('No active tab found');
  }

  /**
   * Execute script in tab
   */
  static async executeInTab(tabId: number, func: Function, args?: any[]): Promise<any> {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args: args || [],
    });
    return results[0]?.result;
  }

  /**
   * Inject content script into tab
   */
  static async injectContentScript(tabId: number, file: string): Promise<void> {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [file],
    });
  }
}

/**
 * DevTools Bridge
 * Communication between DevTools panel and background
 */
export class DevToolsBridge {
  private static tabId: number;

  static init(tabId: number): void {
    this.tabId = tabId;
  }

  static async sendToInspectedPage(action: string, data?: any): Promise<any> {
    return ExtensionMessageBridge.sendToContentScript(this.tabId, action, data);
  }

  static async evalInPage(expression: string): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.devtools.inspectedWindow.eval(expression, (result, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static onNetworkRequest(callback: (request: chrome.devtools.network.Request) => void): void {
    chrome.devtools.network.onRequestFinished.addListener(callback);
  }
}
