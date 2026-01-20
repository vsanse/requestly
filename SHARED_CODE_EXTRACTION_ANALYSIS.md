# Shared Code Extraction Analysis for Requestly Monorepo

This document identifies common utilities, helpers, and patterns across clients that should be extracted into shared packages (`@requestly/core`, `@requestly/shared`, `@requestly/utils`) to support future clients like CLI, VS Code extension, etc.

## 📊 Current Package Structure

### Existing Packages
- **@requestly/core** - Rule processing logic
- **@requestly/shared** - Shared types, helpers, modules
- **@requestly/utils** - Utilities, logger, analytics-vendors
- **@requestly/constants** - Constants
- **@requestly/analytics-vendors** - Analytics integration

### Current Clients
- **@requestly/web** - Web application (React)
- **@requestly/extension-common** - Browser extension common code
- **@requestly/extension-mv3** - Manifest V3 extension

---

## 🎯 Categories for Extraction

### 1. **String & Data Formatting Utilities** 
**Priority: HIGH** | **Package: @requestly/utils**

These are pure functions with zero dependencies on client-specific code, making them ideal for extraction.

#### From `clients/web/src/utils/FormattingHelper.js`:
- ✅ `generateObjectId()` - Generate random IDs
- ✅ `generateSharedListId()` - Generate timestamp-based IDs
- ✅ `getPrettyString(string)` - Convert camelCase/snake_case to readable format
- ✅ `isValidUrl(string)` - URL validation
- ✅ `isValidRQUrl(url)` - Requestly-specific URL validation
- ✅ `getDomainFromEmail(email)` - Extract domain from email
- ✅ `getCompanyNameFromEmail(email)` - Extract company name
- ✅ `getByteSize(inputString)` - Calculate byte size
- ✅ `filterUniqueObjects(myArr)` - Remove duplicate objects
- ✅ `removeTrailingSlash(url)` - URL normalization
- ✅ `isEmailValid(email)` - Email validation
- ✅ `rulesFlatObjectToObjectIdArray(inputArray)` - Data transformation

**Impact**: Used in web, likely needed in CLI for data validation, formatting outputs

---

### 2. **Date & Time Utilities**
**Priority: HIGH** | **Package: @requestly/utils**

Date manipulation is universal across all clients.

#### From `clients/web/src/utils/DateTimeUtils.js`:
- ✅ `dateStringFromTimestamp(timestamp)` - Convert timestamp to date string
- ✅ `getFormattedDate(format, timestamp)` - Format dates with moment.js
- ✅ `getOldestDate(arrayOfDates)` - Find oldest date in array
- ✅ `standardizeDateFormat(date)` - Convert to YYYY-MM-DD
- ✅ `getDateAfterAddingSomeDaysInUserSignupDate(signupDate, numDaysToAdd)` - Date calculations
- ✅ `getDaysCount(startDate, endDate)` - Calculate days between dates
- ✅ `getTimeDifferenceFromTimestampInMs(timestamp)` - Time difference calculations

**Impact**: CLI will need date formatting for logs, reports; VS Code extension for file timestamps

---

### 3. **URL & Path Utilities**
**Priority: HIGH** | **Package: @requestly/utils**

Essential for any client dealing with URLs or file paths.

#### From `clients/web/src/utils/URLUtils.js`:
- ✅ `getQueryParamsAsMap()` - Parse query parameters
- ✅ `getRouteFromCurrentPath(path)` - Extract route from path
- ✅ `prefixUrlWithHttps(url)` - Add HTTPS prefix
- ✅ `getDomainFromURL(url)` - Extract domain
- ✅ `addUrlSchemeIfMissing(url)` - URL normalization

#### From `clients/web/src/utils/PathUtils.js`:
- ✅ Path manipulation utilities

**Impact**: CLI needs URL parsing for commands; VS Code extension for workspace paths

---

### 4. **Environment & Configuration Utilities**
**Priority: HIGH** | **Package: @requestly/utils**

Multi-environment support is critical for all clients.

#### From `clients/web/src/utils/EnvUtils.ts`:
- ✅ `isBackendEnvEmulator()` - Check if running in emulator
- ✅ `isBackendEnvBeta()` - Check if beta environment
- ✅ `isNodeEnvDev()` - Check if development mode
- ✅ `isEnvAutomation()` - Check if automation environment
- ✅ Environment detection utilities

**Impact**: CLI needs env detection for different execution contexts; VS Code extension for workspace configs

---

### 5. **Error Handling & Result Pattern**
**Priority: HIGH** | **Package: @requestly/utils**

Standardized error handling across all clients.

#### From `clients/web/src/utils/try.ts`:
- ✅ `Try<R, E>()` - Functional error handling wrapper
- ✅ `Ok<T>` class - Success result
- ✅ `Err<T>` class - Error result
- ✅ Result pattern implementation

**Impact**: Essential for CLI error handling, VS Code extension error reporting

---

### 6. **Storage Abstractions**
**Priority: HIGH** | **Package: @requestly/utils**

Storage layer abstraction for different environments.

#### From `clients/web/src/utils/`:
- ✅ `localStorage.ts` - Local storage wrapper
- ✅ `sessionStorage.ts` - Session storage wrapper
- ✅ `StorageServiceWrapper.js` - Unified storage interface

**New Package**: `@requestly/storage`
- Interface: `IStorageService`
- Implementations:
  - `LocalStorageService` (browser)
  - `FileStorageService` (Node.js/CLI)
  - `VSCodeStorageService` (VS Code extension)

**Impact**: Critical for CLI (file-based storage) and VS Code extension (workspace storage)

---

### 7. **Authentication & User Utilities**
**Priority: MEDIUM** | **Package: @requestly/shared**

Auth logic that can be shared across clients.

#### From `clients/web/src/utils/AuthUtils.js`:
- ✅ Token validation
- ✅ User session management
- ✅ Auth state handling

#### From `clients/web/src/backend/auth/`:
- ✅ Authentication API calls
- ✅ Token refresh logic

**Note**: Separate UI logic from business logic. Extract pure auth functions only.

**Impact**: CLI needs auth for API access; VS Code extension for user authentication

---

### 8. **Backend API Utilities**
**Priority: HIGH** | **Package: @requestly/api-client** (NEW)

Create a new package for API communication.

#### From `clients/web/src/backend/`:
- ✅ `utils.ts` - `getOwnerId`, `isTeamOwner`, `getTeamFromOwnerId`
- ✅ API endpoint definitions
- ✅ Request/response types
- ✅ Error handling

#### Create: `@requestly/api-client`
```typescript
// Core HTTP client
interface ApiClientConfig {
  baseURL: string;
  auth?: AuthConfig;
  timeout?: number;
}

class RequestlyApiClient {
  constructor(config: ApiClientConfig);
  
  // Methods
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>;
  put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}

// Specialized clients
class RulesApiClient extends RequestlyApiClient { }
class WorkspaceApiClient extends RequestlyApiClient { }
class BillingApiClient extends RequestlyApiClient { }
```

**Impact**: CLI needs API client for all operations; VS Code extension for sync

---

### 9. **Data Compression & Encoding**
**Priority: MEDIUM** | **Package: @requestly/utils**

#### From `clients/web/src/utils/Compression.js`:
- ✅ Data compression utilities
- ✅ Base64 encoding/decoding
- ✅ String compression for storage

**Impact**: CLI for compressing large rule sets; VS Code extension for efficient storage

---

### 10. **OS & Platform Detection**
**Priority: HIGH** | **Package: @requestly/utils**

Platform-specific behavior across clients.

#### From `clients/web/src/utils/osUtils.{js,ts}`:
- ✅ `getUserOS()` - Detect user's operating system
- ✅ Platform-specific path separators
- ✅ OS-specific configurations

**Impact**: CLI needs OS detection for platform-specific commands; VS Code extension for shortcuts

---

### 11. **Rules Processing Utilities**
**Priority: HIGH** | **Package: @requestly/core** (enhancement)

Core rule processing logic.

#### From `clients/web/src/utils/rules/`:
- ✅ Rule validation
- ✅ Rule transformation
- ✅ Rule matching algorithms
- ✅ Rule priority handling

**Current State**: Already in `@requestly/core`, but needs to extract web-specific utils

**Impact**: CLI needs rule processing for validation; VS Code extension for rule editing

---

### 12. **File Handling Utilities**
**Priority: MEDIUM** | **Package: @requestly/utils**

#### From `clients/web/src/utils/files/`:
- ✅ File type detection
- ✅ File size utilities
- ✅ File validation
- ✅ MIME type handling

**Impact**: CLI for file operations; VS Code extension for workspace files

---

### 13. **Pricing & Premium Utilities**
**Priority: LOW** | **Package: @requestly/shared**

Business logic for pricing (less relevant for CLI/VS Code initially).

#### From `clients/web/src/utils/PricingUtils.js`:
- ✅ `getDurationTitleFromDays(days)` - Convert days to duration title
- ✅ `getCurrencySymbol(country, currency)` - Get currency symbol
- ✅ `getPlanCategory(mode)` - Get plan category

**Impact**: May be needed if CLI has premium features

---

### 14. **Analytics & Tracking**
**Priority: MEDIUM** | **Package: @requestly/analytics** (NEW)

Unified analytics across all clients.

#### Current State:
- `@requestly/analytics-vendors` exists
- Web client has AnalyticsUtils.js

#### Proposed: `@requestly/analytics`
```typescript
interface AnalyticsAdapter {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name: string, properties?: Record<string, any>): void;
}

class RequestlyAnalytics {
  constructor(adapters: AnalyticsAdapter[]);
  
  track(event: string, properties?: Record<string, any>): void;
  // ... other methods
}
```

**Impact**: CLI needs analytics for usage tracking; VS Code extension for telemetry

---

### 15. **Database Utilities**
**Priority: MEDIUM** | **Package: @requestly/db-client** (NEW)

Abstract database operations for different clients.

#### From `clients/web/src/utils/db/`:
- ✅ Database queries
- ✅ Data transformation
- ✅ Indexing utilities

#### Proposed: `@requestly/db-client`
```typescript
interface DbAdapter {
  get<T>(path: string): Promise<T>;
  set<T>(path: string, data: T): Promise<void>;
  update<T>(path: string, data: Partial<T>): Promise<void>;
  delete(path: string): Promise<void>;
  query<T>(collection: string, filters: Filter[]): Promise<T[]>;
}

// Implementations:
// - FirebaseAdapter (web)
// - SQLiteAdapter (CLI)
// - FileSystemAdapter (VS Code)
```

**Impact**: CLI needs local DB for offline mode; VS Code extension for workspace data

---

### 16. **Validation Utilities**
**Priority: HIGH** | **Package: @requestly/validators** (NEW)

Centralized validation logic.

#### Current scattered validation:
- Email validation
- URL validation  
- Rule validation
- Input sanitization

#### Proposed: `@requestly/validators`
```typescript
export const validators = {
  email: (email: string) => ValidationResult,
  url: (url: string) => ValidationResult,
  rule: (rule: Rule) => ValidationResult,
  domain: (domain: string) => ValidationResult,
  // ... more validators
};

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}
```

**Impact**: Essential for CLI input validation; VS Code extension for form validation

---

### 17. **Geo & Location Utilities**
**Priority: LOW** | **Package: @requestly/utils**

#### From `clients/web/src/utils/geoUtils.js`:
- ✅ Country code detection
- ✅ Location-based configurations

**Impact**: May be useful for CLI region selection

---

### 18. **Function Utilities**
**Priority: HIGH** | **Package: @requestly/utils**

#### From `clients/web/src/utils/FunctionUtils.ts`:
- ✅ `retryOrFailSilently(fn, maxRetries)` - Retry with exponential backoff
- ✅ `detectUnsettledPromise(promise, timeout)` - Promise timeout detection
- ✅ Debounce/throttle utilities

**Impact**: CLI needs retry logic for API calls; VS Code extension for async operations

---

### 19. **Team & Workspace Utilities**
**Priority: MEDIUM** | **Package: @requestly/shared**

#### From `clients/web/src/utils/teams/`:
- ✅ Team management utilities
- ✅ Workspace utilities
- ✅ Member role handling

**Impact**: CLI for team operations; VS Code extension for team sync

---

### 20. **Extension Communication Bridge**
**Priority: MEDIUM** | **Package: @requestly/bridge** (NEW)

Communication between different clients.

#### From `clients/web/src/utils/ExtensionHelper.js`:
- ✅ Extension detection
- ✅ Message passing
- ✅ Event communication

#### Proposed: `@requestly/bridge`
- Web ↔ Extension communication
- CLI ↔ Extension communication
- VS Code Extension ↔ Browser Extension

**Impact**: Critical for CLI/VS Code integration with browser extension

---

## 📦 New Package Proposals

### 1. `@requestly/api-client`
**Purpose**: Unified API client for all Requestly services

**Contents**:
- HTTP client abstraction
- Request/response interceptors
- Authentication handling
- Error handling
- Retry logic
- Specialized API clients (Rules, Workspace, Billing, etc.)

**Usage**:
```typescript
import { RequestlyApiClient, RulesApiClient } from '@requestly/api-client';

const apiClient = new RequestlyApiClient({ 
  baseURL: 'https://api.requestly.io',
  auth: { token: 'xxx' }
});

const rulesClient = new RulesApiClient(apiClient);
await rulesClient.getRules();
```

---

### 2. `@requestly/storage`
**Purpose**: Cross-platform storage abstraction

**Contents**:
- Storage interface
- Browser LocalStorage adapter
- Node.js FileSystem adapter  
- VS Code workspace storage adapter
- IndexedDB adapter (for large data)

**Usage**:
```typescript
import { createStorage } from '@requestly/storage';

// Auto-detects environment
const storage = createStorage();

await storage.set('rules', rulesData);
const rules = await storage.get('rules');
```

---

### 3. `@requestly/validators`
**Purpose**: Centralized validation logic

**Contents**:
- Email, URL, domain validators
- Rule validation
- Input sanitization
- Schema validation

**Usage**:
```typescript
import { validators } from '@requestly/validators';

const result = validators.email('user@example.com');
if (!result.valid) {
  console.error(result.errors);
}
```

---

### 4. `@requestly/analytics`
**Purpose**: Unified analytics across all clients

**Contents**:
- Analytics interface
- Multiple provider support (Segment, Mixpanel, GA)
- Event definitions
- User identification

**Usage**:
```typescript
import { RequestlyAnalytics } from '@requestly/analytics';

const analytics = new RequestlyAnalytics({
  providers: ['segment', 'mixpanel'],
  apiKey: 'xxx'
});

analytics.track('rule_created', { ruleType: 'redirect' });
```

---

### 5. `@requestly/db-client`
**Purpose**: Database abstraction for offline/online modes

**Contents**:
- Database interface
- Firebase adapter (web)
- SQLite adapter (CLI)
- FileSystem adapter (simple storage)

**Usage**:
```typescript
import { createDbClient } from '@requestly/db-client';

const db = createDbClient({ 
  type: 'firebase',
  config: {...}
});

await db.set('users/123', userData);
```

---

### 6. `@requestly/bridge`
**Purpose**: Inter-client communication

**Contents**:
- Message passing protocols
- Event bus
- Client detection
- State synchronization

**Usage**:
```typescript
import { Bridge } from '@requestly/bridge';

const bridge = new Bridge();
bridge.on('rule_updated', (rule) => {
  // Handle rule update from extension
});

bridge.send('extension', 'get_rules');
```

---

## 🚀 Migration Priority

### Phase 1: Foundation (High Priority)
1. **@requestly/utils** enhancements
   - String/Data formatting
   - Date/Time utilities
   - URL/Path utilities
   - Environment utilities
   - Error handling (Try/Result pattern)
   - Function utilities (retry, debounce)
   - OS detection

2. **@requestly/validators** (NEW)
   - All validation logic from web client

3. **@requestly/storage** (NEW)
   - Storage abstractions for all platforms

### Phase 2: API & Communication (High Priority)
4. **@requestly/api-client** (NEW)
   - Unified API client
   - All backend API calls extracted

5. **@requestly/bridge** (NEW)
   - Inter-client communication

### Phase 3: Business Logic (Medium Priority)
6. **@requestly/core** enhancements
   - Extract rule processing utilities from web

7. **@requestly/shared** enhancements
   - Team/workspace utilities
   - Auth utilities (non-UI)
   - Pricing utilities

### Phase 4: Optional (Low Priority)
8. **@requestly/analytics** (NEW)
   - Unified analytics

9. **@requestly/db-client** (NEW)
   - Database abstraction

---

## 📋 Extraction Checklist

For each utility/function being extracted:

- [ ] **Zero UI Dependencies** - No React, DOM, or browser-specific code
- [ ] **Pure or Side-Effect Controlled** - Pure functions or clearly documented side effects
- [ ] **Fully Typed** - TypeScript types/interfaces defined
- [ ] **Unit Tested** - Comprehensive test coverage
- [ ] **Documented** - JSDoc comments for public APIs
- [ ] **Platform Agnostic** - Works in Node.js, browser, and other environments (or clearly marked)
- [ ] **Versioned** - Follows semantic versioning
- [ ] **Dependency Check** - Minimal external dependencies

---

## 🔍 Usage Patterns by Client Type

### CLI Client Needs:
- ✅ All validation utilities
- ✅ File system storage
- ✅ API client for backend communication
- ✅ Rule processing/validation
- ✅ Date/time formatting for logs
- ✅ Error handling (Try/Result pattern)
- ✅ Environment detection
- ✅ OS-specific behaviors

### VS Code Extension Needs:
- ✅ Workspace storage adapter
- ✅ API client for sync
- ✅ Rule validation
- ✅ Bridge communication with browser extension
- ✅ Date/time utilities
- ✅ Error handling
- ✅ File utilities

### Browser Extension Needs (already partially done):
- ✅ Storage abstractions (chrome.storage)
- ✅ Rule processing (already in @requestly/core)
- ✅ Message passing
- ✅ URL utilities

---

## 📊 Estimated Impact

### High Impact (Phase 1-2)
- **Development Speed**: 3-5x faster when building new clients
- **Code Reusability**: ~60-70% code reuse across clients
- **Maintenance**: Single source of truth for business logic
- **Testing**: Write tests once, benefit everywhere

### Medium Impact (Phase 3)
- **Consistency**: Same validation/formatting across all clients
- **Bug Fixes**: Fix once, applies everywhere

### Low Impact (Phase 4)
- **Analytics**: Unified tracking
- **Database**: Flexible storage options

---

## 🎯 Success Metrics

1. **Code Reduction**: Measure LOC reduction in new clients vs web client
2. **Time to Market**: Track time to build new client (target: 50% reduction)
3. **Bug Density**: Track bugs in shared packages vs client-specific code
4. **Developer Satisfaction**: Survey developers on ease of use
5. **Test Coverage**: Aim for 90%+ coverage in shared packages

---

## 🔗 Dependencies Map

```
@requestly/constants (base)
    ↓
@requestly/utils (formatters, validators, storage)
    ↓
@requestly/core (rule processing)
    ↓
@requestly/shared (types, helpers)
    ↓
@requestly/api-client (API communication)
@requestly/analytics (tracking)
@requestly/bridge (inter-client)
@requestly/storage (platform storage)
@requestly/validators (validation)
@requestly/db-client (database)
    ↓
Client Applications (web, extension, CLI, VS Code)
```

---

## 📝 Next Steps

1. **Review & Approve**: Team review of this analysis
2. **Create Issues**: GitHub issues for each package/phase
3. **Set Milestones**: Define timeline for each phase
4. **Start Phase 1**: Begin with high-priority utilities extraction
5. **Document**: Create detailed migration guides
6. **Test**: Comprehensive testing strategy
7. **Monitor**: Track metrics and adjust plan

---

## 🤝 Contributing Guidelines

When extracting code to shared packages:

1. **Extract, Don't Rewrite**: Keep existing logic, just move it
2. **Maintain Backward Compatibility**: Don't break existing clients
3. **Add Tests**: Every exported function needs tests
4. **Document**: Add JSDoc and README
5. **TypeScript First**: All new code should be TypeScript
6. **Review**: Peer review before merging

---

*Generated: January 2026*
*Version: 1.0*
*Status: Draft for Team Review*
