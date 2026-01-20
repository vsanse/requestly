# MV3 Extension - Package Integration

## Overview

The MV3 extension now uses shared packages from the monorepo for common functionality. This document explains what packages are integrated and how they're being used.

---

## Integrated Packages

### 1. ✅ @requestly/utils
**Location**: Integrated in `src/utils.ts`  
**Status**: ACTIVELY USED

**What's Using It**:
- `formatDate` - Replaced local implementation with shared utility
- `debounce` - Replaced local implementation with shared utility

**Functions Re-exported**:
```typescript
import { debounce, formatDate } from '@requestly/utils';

export const formatDate = utilsFormatDate;
export const debounce = utilsDebounce;
```

**Impact**: All files importing `debounce` and `formatDate` from `src/utils.ts` now use the shared package.

**Files Affected** (20+ files):
- `src/service-worker/services/rulesManager.ts`
- `src/service-worker/services/extensionIconManager.ts`
- `src/service-worker/services/clientHandler.ts`
- ...and 17+ more files

---

### 2. 📘 @requestly/validators
**Location**: Example utilities in `src/packageIntegration.ts`  
**Status**: READY TO USE

**Available Functions**:
```typescript
import { validateRuleSource, validateRequestMethod, isValidEmail } from './packageIntegration';

// Validate rule source URL
const validation = validateRuleSource('https://example.com');
if (!validation.valid) {
  console.error(validation.error);
}

// Validate HTTP method
const isValid = validateRequestMethod('POST'); // true

// Validate email
const emailValid = isValidEmail('user@example.com'); // true
```

**Use Cases**:
- Validate rule source URLs before saving
- Validate destination URLs for redirect rules
- Validate HTTP methods for header modifications
- Validate email addresses for team invites

---

### 3. 💾 @requestly/storage
**Location**: Example utilities in `src/packageIntegration.ts`  
**Status**: READY TO USE

**Available Functions**:
```typescript
import { 
  saveDraftRule, 
  getDraftRule, 
  saveUserPreference, 
  getUserPreference 
} from './packageIntegration';

// Save rule draft
await saveDraftRule('rule-123', ruleData);

// Get rule draft
const draft = await getDraftRule('rule-123');

// Save user preference
await saveUserPreference('theme', 'dark');

// Get user preference
const theme = await getUserPreference('theme', 'light');
```

**Use Cases**:
- Save rule drafts before syncing to server
- Store user preferences (theme, notification settings)
- Cache frequently accessed data
- Manage temporary session state

---

### 4. 🌉 @requestly/bridge
**Location**: Example utilities in `src/packageIntegration.ts`  
**Status**: READY TO USE

**Available Functions**:
```typescript
import { 
  sendToBackground, 
  broadcastToAllTabs, 
  publishEvent, 
  subscribeToEvent 
} from './packageIntegration';

// Send message to background
const response = await sendToBackground('GET_RULES');

// Broadcast to all tabs
await broadcastToAllTabs('RULES_UPDATED', { count: 10 });

// Event-driven communication
publishEvent('rule:saved', { ruleId: 'rule-123' });

const unsubscribe = subscribeToEvent('rule:changed', (rule) => {
  console.log('Rule changed:', rule);
});
```

**Use Cases**:
- Communication between service worker and content scripts
- Broadcasting updates to all tabs
- Event-driven architecture for rule changes
- Decoupled component communication

---

### 5. 🌐 @requestly/api-client
**Location**: Should be integrated in `src/service-worker/services/apiClient/index.ts`  
**Status**: NOT YET MIGRATED (Opportunity for improvement)

**Current Implementation**: Custom fetch-based API client (158 lines)  
**Potential Migration**: Replace with shared API client for consistency

**Example Usage** (reference only):
```typescript
import { createApiClient } from '@requestly/api-client';

const apiClient = createApiClient('https://api2.requestly.io');
apiClient.rules.setAuthToken('api-key');

const rules = await apiClient.rules.getRules();
const newRule = await apiClient.rules.createRule(ruleData);
```

---

## Current Integration Status

### ✅ Active Usage

| Package | Status | Files Using It | Impact |
|---------|--------|----------------|--------|
| @requestly/utils | ✅ ACTIVE | 20+ files | All debounce/formatDate calls |
| @requestly/validators | 📘 READY | 0 files | Available via packageIntegration |
| @requestly/storage | 💾 READY | 0 files | Available via packageIntegration |
| @requestly/bridge | 🌉 READY | 0 files | Available via packageIntegration |
| @requestly/api-client | ⏳ PENDING | 0 files | Migration opportunity |

---

## How to Use Packages in Your Code

### Option 1: Import from utils.ts (for utils package)
```typescript
// This already uses @requestly/utils internally
import { debounce, formatDate } from '../../utils';

const debouncedHandler = debounce(() => {
  console.log('Debounced!');
}, 300);
```

### Option 2: Import from packageIntegration.ts
```typescript
import { 
  validateRuleSource,
  saveDraftRule,
  sendToBackground,
  publishEvent
} from '../../packageIntegration';

// Validate before saving
const validation = validateRuleSource(rule.source);
if (validation.valid) {
  await saveDraftRule(rule.id, rule);
  publishEvent('rule:saved', { ruleId: rule.id });
}
```

### Option 3: Direct import (for advanced usage)
```typescript
import { validateEmail, validateUrl } from '@requestly/validators';
import { createMessageBus } from '@requestly/bridge';

const emailValid = validateEmail('test@example.com');
const messageBus = createMessageBus();
```

---

## Integration Examples

### Example 1: Validate Rule Before Saving
```typescript
import { validateAndSaveRule } from './packageIntegration';

async function saveRule(rule: any) {
  const success = await validateAndSaveRule(rule);
  if (success) {
    console.log('Rule saved successfully');
  } else {
    console.error('Rule validation failed');
  }
}
```

### Example 2: Debounced Search with Validation
```typescript
import { createDebouncedSearch } from './packageIntegration';

const performSearch = (query: string) => {
  // Search logic here
  console.log('Searching for:', query);
};

const debouncedSearch = createDebouncedSearch(performSearch);

// Use in your component
debouncedSearch('https://example.com'); // Validates URL, then searches
```

### Example 3: Duplicate Rule with New ID
```typescript
import { duplicateRule } from './packageIntegration';

async function cloneExistingRule(rule: any) {
  const newRule = await duplicateRule(rule);
  console.log('Duplicated rule:', newRule);
  return newRule;
}
```

### Example 4: User Theme Management
```typescript
import { getUserTheme, setUserTheme } from './packageIntegration';

async function toggleTheme() {
  const currentTheme = await getUserTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  await setUserTheme(newTheme);
}
```

---

## Next Steps for Deeper Integration

### High Priority
1. **Migrate API Client** - Replace `src/service-worker/services/apiClient/index.ts` with @requestly/api-client
2. **Add Validation to Forms** - Use validators in rule creation/modification flows
3. **Replace chrome.storage** - Migrate more storage operations to use @requestly/storage adapter

### Medium Priority
4. **Event-Driven Architecture** - Use bridge package for decoupled communication
5. **User Preferences** - Centralize all preference management using storage utilities
6. **Error Handling** - Use utils package for consistent error handling

### Low Priority
7. **Performance** - Use throttle/debounce from utils for performance optimization
8. **Testing** - Add tests for integration utilities
9. **Documentation** - Add JSDoc comments to packageIntegration.ts

---

## Build & Test

### Build Extension
```bash
cd clients/extension/mv3
pnpm build
```

### Test Integration
```bash
# All packages should resolve without errors
pnpm build

# Check dist files are created
ls -la dist/
```

---

## Benefits of Package Integration

### ✅ Code Reusability
- Shared utilities across web and extension
- No code duplication
- Single source of truth

### ✅ Consistency
- Same validation logic everywhere
- Unified API client behavior
- Consistent storage patterns

### ✅ Maintainability
- Fix bugs in one place
- Update behavior globally
- Easier refactoring

### ✅ Type Safety
- Shared TypeScript definitions
- Better IntelliSense support
- Fewer runtime errors

---

## Summary

**Current State**: 
- ✅ @requestly/utils is actively used (20+ files)
- 📘 Other packages are integrated and ready to use
- ⏳ More migration opportunities available

**Impact**:
- Eliminated duplicate formatDate/debounce implementations
- Created reusable utilities for validation, storage, and messaging
- Laid foundation for deeper integration

**Next Action**: Start using the utilities in `packageIntegration.ts` in your feature development!
