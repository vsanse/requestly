# Extension Client Package Integration Guide

## Overview
This guide documents the integration of all shared packages into the extension clients (common, mv3, sessionbear).

## Packages Integrated

All extension clients now have access to:

1. **@requestly/utils** - Common utilities (Phase 1)
2. **@requestly/validators** - Input validation (Phase 2.1)
3. **@requestly/storage** - Storage abstraction (Phase 2.2)
4. **@requestly/api-client** - HTTP client (Phase 2.3)
5. **@requestly/bridge** - Cross-context communication (Phase 2.4)

## Package Installation Status

### ✅ Extension Common (`clients/extension/common`)
```json
"dependencies": {
  "@requestly/api-client": "workspace:*",
  "@requestly/bridge": "workspace:*",
  "@requestly/storage": "workspace:*",
  "@requestly/utils": "workspace:*",
  "@requestly/validators": "workspace:*"
}
```

### ✅ Extension MV3 (`clients/extension/mv3`)
```json
"dependencies": {
  "@requestly/api-client": "workspace:*",
  "@requestly/bridge": "workspace:*",
  "@requestly/storage": "workspace:*",
  "@requestly/utils": "workspace:*",
  "@requestly/validators": "workspace:*"
}
```

## Integration Examples Created

### 1. Storage Adapter (`common/src/utils/storageAdapter.ts`)

Provides unified storage interface for Chrome extension:

```typescript
import { ExtensionStorage, ExtensionUserPreferences, DraftRulesManager, SessionStateManager } from './utils/storageAdapter';

// User preferences
await ExtensionUserPreferences.setTheme('dark');
const theme = await ExtensionUserPreferences.getTheme();

// Draft rules
await DraftRulesManager.saveDraft('rule-123', ruleData);
const draft = await DraftRulesManager.getDraft('rule-123');

// Session state
await SessionStateManager.setActiveTab(tabId, url);
const activeTab = await SessionStateManager.getActiveTab();
```

**Key Features:**
- Chrome storage adapter integration
- User preferences management
- Draft rules persistence
- Session state tracking

### 2. Validation Helpers (`common/src/utils/validationHelpers.ts`)

Validation utilities for extension data:

```typescript
import { 
  validateRuleConfig,
  validateMockServerConfig,
  validateDesktopAppConfig,
  validateTeamInviteEmail,
  validateApiEndpoint
} from './utils/validationHelpers';

// Validate rule before saving
const validation = validateRuleConfig(rule);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Validate mock server config
const mockValidation = validateMockServerConfig(mockConfig);

// Validate email for team invite
const emailValidation = validateTeamInviteEmail('user@example.com');
```

**Key Features:**
- Rule configuration validation
- Mock server config validation
- API endpoint validation
- Email and domain validation
- Regex pattern validation

### 3. Extension Bridge (`common/src/utils/extensionBridge.ts`)

Cross-context communication utilities:

```typescript
import {
  ExtensionMessageBridge,
  RuleSyncBridge,
  RecordingEventBridge,
  TabCommunicationBridge,
  DevToolsBridge
} from './utils/extensionBridge';

// Background to content script
await ExtensionMessageBridge.sendToContentScript(tabId, 'UPDATE_RULES', { rules });

// Broadcast to all tabs
await ExtensionMessageBridge.broadcast('RULES_UPDATED', { count: rules.length });

// Rule synchronization
await RuleSyncBridge.syncRulesFromWeb();
RuleSyncBridge.onRulesChanged((rules) => {
  console.log('Rules changed:', rules);
});

// Recording events
await RecordingEventBridge.startRecording(tabId, options);
RecordingEventBridge.onRecordingEvent('started', (data) => {
  console.log('Recording started:', data);
});

// Tab communication
await TabCommunicationBridge.sendToActiveTab('GET_DOM_STATE');
await TabCommunicationBridge.executeInTab(tabId, () => {
  return document.title;
});

// DevTools
DevToolsBridge.init(tabId);
DevToolsBridge.onNetworkRequest((request) => {
  console.log('Network request:', request);
});
```

**Key Features:**
- Message passing between contexts
- Rule synchronization
- Recording event management
- Tab communication helpers
- DevTools integration

## Migration Opportunities

### Current API Clients to Migrate

Both MV3 and SessionBear have custom API client implementations that should be migrated:

**Files to migrate:**
- `clients/extension/mv3/src/service-worker/services/apiClient/index.ts` (158 lines)
- `clients/extension/sessionbear/src/service-worker/services/apiClient.ts` (133 lines)

**Migration Strategy:**
1. Import `createApiClient` from `@requestly/api-client`
2. Replace custom `getAPIResponse` function
3. Maintain backward compatibility with existing interface
4. Update callers to use new client

### Storage Migration

**Current extension storage:**
- `clients/extension/common/src/storage.ts` - Custom Chrome storage wrapper

**Migration path:**
1. Replace direct `chrome.storage` calls with `@requestly/storage`
2. Use `ExtensionStorage` adapter for consistency
3. Maintain existing API for backward compatibility

### Validation Integration

**Add validation to:**
- Rule creation/modification flows
- Mock server configuration
- Desktop app connection settings
- Team invitation forms
- API configuration panels

## Build and Testing

### Building Extension with New Packages

```bash
# Build all packages first
pnpm --filter @requestly/utils --filter @requestly/validators --filter @requestly/storage --filter @requestly/api-client --filter @requestly/bridge build

# Build extension common
pnpm --filter @requestly/extension-common build

# Build MV3 extension
pnpm --filter @requestly/extension-mv3 build
```

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Storage operations work correctly
- [ ] Validation helpers catch invalid inputs
- [ ] Message passing works between contexts
- [ ] API clients make successful requests
- [ ] DevTools integration functions properly
- [ ] Recording features work as expected

## Next Steps

### Immediate Tasks

1. **Migrate API Clients**
   - Replace custom fetch-based clients in MV3 and SessionBear
   - Use `@requestly/api-client` for consistency
   - Add error handling with `@requestly/utils`

2. **Integrate Storage Package**
   - Replace direct chrome.storage calls
   - Use storage adapters for better abstraction
   - Add type safety with TypeScript

3. **Add Validation**
   - Validate all user inputs
   - Add form-level validation
   - Show user-friendly error messages

4. **Implement Bridge Utilities**
   - Replace manual message passing
   - Use event bridges for complex flows
   - Standardize communication patterns

### Future Enhancements

1. **Error Handling**
   - Use `@requestly/utils` error utilities
   - Add consistent error logging
   - Implement retry logic for API calls

2. **Performance**
   - Use memoization from `@requestly/utils`
   - Optimize storage operations
   - Cache frequently accessed data

3. **Testing**
   - Add unit tests for integration code
   - Test cross-context communication
   - Validate storage operations

## Common Issues and Solutions

### TypeScript Errors

If you see "Cannot find module '@requestly/xyz'" errors:

```bash
# Rebuild the package
pnpm --filter @requestly/xyz build

# Rebuild extension client
pnpm --filter @requestly/extension-common build
```

### Chrome Storage Issues

If storage operations fail:
- Ensure STORAGE_TYPE is correctly configured
- Check chrome.storage permissions in manifest
- Verify storage quota limits

### Message Passing Errors

If messages don't arrive:
- Check content script injection timing
- Verify message listener registration
- Add error handlers to catch failures
- Use `return true` in listeners for async responses

## Documentation

- Main instructions: `/.github/copilot-instructions.md`
- Phase 2 status: `/docs/PHASE_2_INTEGRATION_STATUS.md`
- Extension guide: `/docs/EXTENSION_CLIENT_INTEGRATION.md` (this file)

## Support

For questions or issues:
1. Check package documentation in `packages/[package-name]/README.md`
2. Review integration examples in utility files
3. Check existing usage in web client (`clients/web/src/utils/`)
