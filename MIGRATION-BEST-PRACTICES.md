# Migration Best Practices Research Report

**Compiled:** 2025-10-14
**Topics:** React Context Migration, Storage Adapters, Incremental Migration, Validation & Error Handling

---

## Table of Contents

1. [React Context Migration: Async Patterns](#react-context-migration-async-patterns)
2. [Storage Adapter Pattern Implementation](#storage-adapter-pattern-implementation)
3. [Incremental Migration Strategies](#incremental-migration-strategies)
4. [Validation & Error Handling](#validation--error-handling)
5. [Implementation Checklist](#implementation-checklist)
6. [Additional Resources](#additional-resources)

---

## React Context Migration: Async Patterns

### Overview

Migrating from synchronous to async Context patterns requires careful consideration of timing, error handling, and status tracking. The traditional state management patterns need enhancement to handle the inherent unpredictability of network requests and side effects.

### Best Practices for Async Context (2024-2025)

#### 1. **Avoid Single Monolithic Context**

**Problem:** A single Context for your entire application leads to performance issues like unwanted re-rendering.

**Solution:** Create multiple focused contexts and use context composition.

```javascript
// ❌ Bad: Single monolithic context
const AppContext = createContext({
  user: null,
  theme: 'light',
  projects: [],
  notifications: [],
  // ... many more
});

// ✅ Good: Separate focused contexts
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const ProjectContext = createContext([]);
```

#### 2. **Optimize Context Performance**

**Use `useMemo` and `useCallback` to prevent unnecessary re-renders:**

```javascript
import { useCallback, useMemo, useState } from 'react';

function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Memoize async functions
  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.fetchData(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Memoize context value to prevent re-renders
  const contextValue = useMemo(() => ({
    data,
    loading,
    error,
    fetchData
  }), [data, loading, error, fetchData]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}
```

**Source:** [React Official Docs - useContext Optimization](https://react.dev/reference/react/useContext)

#### 3. **Handle Async Operations Properly**

**Instead of scattering async logic across components, centralize it in the context module:**

```javascript
// ✅ Good: Centralized async helper in context module
export function useAuthContext() {
  const context = useContext(AuthContext);

  // Helper function that accepts dispatch and handles async flow
  const login = async (credentials) => {
    context.dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authAPI.login(credentials);
      context.dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (error) {
      context.dispatch({ type: 'LOGIN_ERROR', payload: error });
      throw error;
    }
  };

  return { ...context, login };
}
```

**Source:** [Kent C. Dodds - How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

#### 4. **React 19's `use()` Hook for Async**

React 19.2 introduces the `use()` hook for reading Promises or Context, simplifying data fetching patterns:

```javascript
import { use } from 'react';

function MessageComponent({ messagePromise }) {
  // ✅ New React 19 pattern
  const message = use(messagePromise);
  const theme = use(ThemeContext);

  return <div className={theme}>{message}</div>;
}

// Can even be used conditionally (unlike other hooks!)
function ConditionalData({ shouldFetch, dataPromise }) {
  if (shouldFetch) {
    const data = use(dataPromise);
    return <div>{data}</div>;
  }
  return null;
}
```

**Benefits:**
- Reduces boilerplate compared to `useEffect` patterns
- Can be called conditionally (unlike other hooks)
- Better integration with React Suspense

**Source:** [React 19.2 Features](https://react.dev/reference/react/use)

#### 5. **Prevent Race Conditions**

**Critical pattern for data fetching in Context:**

```javascript
function DataProvider({ children }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false; // ✅ Race condition prevention flag

    async function fetchData() {
      try {
        const result = await api.fetchData(userId);
        if (!ignore) { // ✅ Only update if this is still the current request
          setData(result);
        }
      } catch (error) {
        if (!ignore) {
          setError(error);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true; // ✅ Cleanup: mark stale requests
    };
  }, [userId]);

  // ... rest of provider
}
```

**Source:** [React Docs - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

### Hot Module Replacement (HMR) Considerations

#### Key Concerns for Context Providers

1. **State Preservation**: HMR tries to preserve browser state across updates. For Context providers, this means:
   - State in `useState` hooks is typically preserved
   - Context values may need reinitialization

2. **Hook Limitations**:
   - React Fast Refresh cannot track changes when hooks are added/removed
   - Destructuring hook return values can break state preservation if keys are renamed

```javascript
// ❌ Problematic for HMR
const { userName, userEmail } = useUser(); // If keys change, state is lost

// ✅ Better for HMR
const user = useUser();
// Access user.userName, user.userEmail
```

3. **Best Practices**:
   - Keep hook structure stable during development
   - Use consistent return patterns
   - Test HMR by making small changes to Context providers

**Sources:**
- [React Fast Refresh Deep Dive](https://leapcell.medium.com/beyond-hmr-understanding-reacts-fast-refresh-d6d80ef0fe4e)
- [Webpack HMR Guide](https://webpack.js.org/guides/hot-module-replacement/)

### Migration Path: Synchronous → Async Context

**Step-by-step approach:**

```javascript
// Phase 1: Current synchronous context
const ProjectContext = createContext({
  projects: [],
  addProject: () => {},
});

// Phase 2: Add async capabilities alongside sync
const ProjectContext = createContext({
  projects: [],
  loading: false,
  error: null,
  addProject: () => {}, // Keep sync for now
  addProjectAsync: async () => {}, // New async method
});

// Phase 3: Fully async context
const ProjectContext = createContext({
  projects: [],
  loading: false,
  error: null,
  addProject: async () => {}, // Now fully async
});
```

**Use feature flags to control the transition** (see Incremental Migration section).

---

## Storage Adapter Pattern Implementation

### Overview

The Adapter Pattern provides an abstraction layer over different storage mechanisms, allowing you to switch between localStorage, IndexedDB, or external databases without rewriting application code.

### Core Pattern: Repository Pattern + Adapter

**The Repository Pattern acts as a universal adapter between your application and data storage.**

#### Benefits:
- Decouples data access logic from business logic
- Centralizes data access functionality
- Improves maintainability and testability
- Easy to swap storage implementations

**Source:** [Repository Pattern with TypeScript and Node](https://blog.logrocket.com/exploring-repository-pattern-typescript-node/)

### Implementation Structure

```typescript
// 1. Define storage interface
interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 2. Implement LocalStorage adapter
class LocalStorageAdapter implements IStorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

// 3. Implement IndexedDB adapter
class IndexedDBAdapter implements IStorageAdapter {
  private dbName: string;
  private storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ... other methods
}

// 4. Create a repository that uses the adapter
class ProjectRepository {
  constructor(private storage: IStorageAdapter) {}

  async getProject(id: string): Promise<Project | null> {
    return this.storage.get<Project>(`project:${id}`);
  }

  async saveProject(project: Project): Promise<void> {
    await this.storage.set(`project:${project.id}`, project);
  }

  async deleteProject(id: string): Promise<void> {
    await this.storage.remove(`project:${id}`);
  }
}

// 5. Use in application with dependency injection
// Easy to swap adapters!
const storage = USE_INDEXEDDB
  ? new IndexedDBAdapter('mydb', 'projects')
  : new LocalStorageAdapter();

const projectRepo = new ProjectRepository(storage);
```

### Real-World Storage Adapter Libraries

#### 1. **localForage** (Recommended)
- **GitHub:** Mozilla's localForage
- **Description:** Automatically selects the best storage (IndexedDB, WebSQL, localStorage)
- **Usage:**

```javascript
import localforage from 'localforage';

// Configure
localforage.config({
  name: 'myApp',
  storeName: 'projects'
});

// Use with Promise API (same interface as our adapter!)
await localforage.setItem('project:123', projectData);
const project = await localforage.getItem('project:123');
```

#### 2. **Storagefy**
- **GitHub:** [arthurgermano/storagefy](https://github.com/arthurgermano/storagefy)
- **Description:** Framework-agnostic adapter for syncing state libraries (Zustand, Redux, Pinia) with browser storage
- **Features:** Supports localStorage, sessionStorage, IndexedDB

#### 3. **Keyv Browser**
- **GitHub:** [zaaack/keyv-browser](https://github.com/zaaack/keyv-browser)
- **Description:** Browser storage adapter for Keyv (unified storage interface)

### Migration Strategy: localStorage → Database

**Phased approach with backward compatibility:**

```javascript
// Phase 1: Create migration adapter (reads old, writes new)
class MigrationAdapter implements IStorageAdapter {
  constructor(
    private oldStorage: LocalStorageAdapter,
    private newStorage: IndexedDBAdapter
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Try new storage first
    let value = await this.newStorage.get<T>(key);

    if (value === null) {
      // Fallback to old storage
      value = await this.oldStorage.get<T>(key);

      if (value !== null) {
        // Migrate data to new storage
        await this.newStorage.set(key, value);
        await this.oldStorage.remove(key); // Optional: cleanup
      }
    }

    return value;
  }

  async set<T>(key: string, value: T): Promise<void> {
    // Always write to new storage
    await this.newStorage.set(key, value);
  }

  // ... other methods
}

// Phase 2: Use migration adapter during transition
const migrationStorage = new MigrationAdapter(
  new LocalStorageAdapter(),
  new IndexedDBAdapter('mydb', 'store')
);

// Phase 3: Eventually switch to only new storage
const storage = new IndexedDBAdapter('mydb', 'store');
```

### Data Migration Tools

#### NPM: migrate-local-storage
- **Package:** `migrate-local-storage`
- **Features:** Apply migrations to localStorage using version tracking
- **Pattern:**

```javascript
import MigrateLocalStorage from 'migrate-local-storage';

const migrations = [
  {
    version: 1,
    up: () => {
      // Migration logic
      const oldData = localStorage.getItem('old-key');
      if (oldData) {
        localStorage.setItem('new-key', oldData);
        localStorage.removeItem('old-key');
      }
    }
  },
  {
    version: 2,
    up: async () => {
      // Can be async!
      const data = localStorage.getItem('projects');
      await migrateToIndexedDB(data);
    }
  }
];

const migrator = new MigrateLocalStorage(migrations);
migrator.migrate();
```

**Source:** [NPM - migrate-local-storage](https://www.npmjs.com/package/migrate-local-storage)

#### RxDB Migration Plugin
- **Use case:** Migrating between different RxStorage implementations
- **Method:** `migrateStorage()`

```javascript
import { migrateStorage } from 'rxdb/plugins/migration-storage';

await migrateStorage({
  database: myDatabase,
  oldStorage: getRxStorageMemory(),
  newStorage: getRxStorageIndexedDB(),
  batchSize: 100
});
```

**Source:** [RxDB Migration Storage](https://rxdb.info/migration-storage.html)

---

## Incremental Migration Strategies

### Overview

**Progressive Delivery** is the modern approach to migrations: roll out changes gradually, monitor impact, and minimize risks using feature flags, canary deployments, and A/B testing.

### Feature Flag Patterns

#### 1. **Basic Feature Flag Implementation**

```javascript
// Simple custom implementation
const FeatureFlags = {
  USE_NEW_CONTEXT: false,
  USE_INDEXEDDB: false,
  USE_ASYNC_OPERATIONS: false
};

// In your code
function ProjectProvider({ children }) {
  if (FeatureFlags.USE_NEW_CONTEXT) {
    return <NewProjectProvider>{children}</NewProjectProvider>;
  }
  return <LegacyProjectProvider>{children}</LegacyProjectProvider>;
}
```

#### 2. **Percentage-Based Rollout**

```javascript
// Gradually enable for users
function isFeatureEnabled(flagName, userId) {
  const percentage = ROLLOUT_PERCENTAGES[flagName] || 0;
  const hash = simpleHash(userId + flagName);
  return (hash % 100) < percentage;
}

const ROLLOUT_PERCENTAGES = {
  USE_NEW_CONTEXT: 10, // 10% of users
  USE_INDEXEDDB: 5      // 5% of users
};
```

#### 3. **User Segment Targeting**

```javascript
function isFeatureEnabled(flagName, user) {
  const config = FEATURE_FLAGS[flagName];

  // Internal users get it first
  if (user.email.endsWith('@company.com')) {
    return true;
  }

  // Then beta users
  if (config.betaUsers && user.isBetaUser) {
    return true;
  }

  // Then percentage rollout
  return isInRolloutPercentage(user.id, config.percentage);
}
```

### Cloud-Based Feature Flag Services

**Popular services for React applications:**

1. **LaunchDarkly**
   - Most comprehensive
   - Real-time flag updates
   - A/B testing support
   - React SDK available

2. **Split.io**
   - Built for feature flags + experimentation
   - Strong analytics

3. **Flagsmith**
   - Open source option
   - Self-hostable

4. **Unleash**
   - Open source
   - Enterprise ready

5. **ConfigCat**
   - Simple, affordable
   - 10-minute setup

**Example with LaunchDarkly:**

```javascript
import { withLDProvider } from 'launchdarkly-react-client-sdk';

function App() {
  const flags = useLDClient();

  const useNewContext = flags.variation('use-new-context', false);

  if (useNewContext) {
    return <NewProjectProvider>...</NewProjectProvider>;
  }
  return <LegacyProjectProvider>...</LegacyProjectProvider>;
}

export default withLDProvider({
  clientSideID: 'your-client-id',
  user: {
    key: userId,
    email: userEmail
  }
})(App);
```

**Sources:**
- [Implementing Feature Flags in React](https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3)
- [Feature Flags with React - Prefab](https://prefab.cloud/blog/frontend-feature-flags-using-react/)

### Canary Deployment Strategy

**Canary releases test changes with a small subset of users before full rollout.**

#### Key Differences: Canary vs Feature Flags

| Aspect | Canary Deployment | Feature Flags |
|--------|-------------------|---------------|
| **Layer** | Infrastructure/networking | Application code |
| **Control** | DevOps/SRE teams | Product/Engineering teams |
| **Scope** | Entire deployment | Individual features |
| **Rollback** | Infrastructure level | Code level (instant) |

#### Combined Strategy (Recommended)

**Best approach: Use BOTH for maximum safety**

```
1. Deploy as canary (10% of servers) with ALL feature flags OFF
   ↓
2. Monitor infrastructure metrics (errors, latency, CPU)
   ↓
3. If stable, deploy to 100% of servers
   ↓
4. Begin feature flag rollout (5% → 25% → 50% → 100% of users)
   ↓
5. Monitor feature-specific metrics
   ↓
6. Complete rollout or rollback via flags
```

**Sources:**
- [Canary Releases with Feature Flags - Harness](https://www.harness.io/blog/canary-release-feature-flags)
- [Canary Deployment Guide - Unleash](https://www.getunleash.io/blog/canary-deployment-what-is-it)

### Testing Strategies During Migration

#### Phase 1: Internal Testing (Day 1-3)
```javascript
// Enable only for your own email
if (user.email === 'your-email@company.com') {
  enableFeature('new-context');
}
```

**Checklist:**
- ✅ Feature works as expected
- ✅ No console errors
- ✅ State persists correctly
- ✅ Performance is acceptable

#### Phase 2: Team Testing (Day 4-7)
```javascript
// Enable for entire company domain
if (user.email.endsWith('@company.com')) {
  enableFeature('new-context');
}
```

**Checklist:**
- ✅ Team feedback collected
- ✅ Edge cases identified
- ✅ Documentation updated
- ✅ Rollback plan tested

#### Phase 3: Beta Users (Week 2)
```javascript
// Enable for opted-in beta users
if (user.isBetaUser) {
  enableFeature('new-context');
}
```

**Checklist:**
- ✅ Monitor error rates
- ✅ Collect user feedback
- ✅ Performance metrics baseline established

#### Phase 4: Gradual Rollout (Week 3-4)
```
Day 1: 5% of users
Day 3: 10% of users
Day 5: 25% of users
Day 7: 50% of users
Day 10: 100% of users
```

**Checklist:**
- ✅ Monitor metrics at each stage
- ✅ Compare with control group
- ✅ User satisfaction surveys
- ✅ Support ticket volume

**Source:** [Canary Release Tutorial - PostHog](https://posthog.com/tutorials/canary-release)

### Rollback Mechanisms

#### 1. **Instant Feature Flag Rollback**

```javascript
// In production dashboard (or via API)
setFeatureFlag('use-new-context', false); // ← Instant rollback!

// Changes propagate to all users immediately
// No code deploy needed
```

**Key benefit:** Roll back without redeploying code.

#### 2. **Automatic Circuit Breaker**

```javascript
// Automatically disable feature if error rate spikes
class FeatureFlagCircuitBreaker {
  constructor(flagName, errorThreshold = 0.05) {
    this.flagName = flagName;
    this.errorThreshold = errorThreshold;
    this.errorCount = 0;
    this.requestCount = 0;
  }

  async executeWithProtection(fn) {
    this.requestCount++;
    try {
      const result = await fn();
      return result;
    } catch (error) {
      this.errorCount++;

      // If error rate exceeds threshold, disable feature
      if (this.errorCount / this.requestCount > this.errorThreshold) {
        console.error(`Circuit breaker tripped for ${this.flagName}`);
        setFeatureFlag(this.flagName, false);
      }

      throw error;
    }
  }
}
```

#### 3. **Graceful Degradation**

```javascript
function ProjectProvider({ children }) {
  const useNewContext = useFeatureFlag('use-new-context');
  const [error, setError] = useState(null);

  // If new context fails, automatically fall back to old one
  if (error) {
    console.warn('New context failed, falling back to legacy', error);
    return <LegacyProjectProvider>{children}</LegacyProjectProvider>;
  }

  if (useNewContext) {
    return (
      <ErrorBoundary onError={setError}>
        <NewProjectProvider>{children}</NewProjectProvider>
      </ErrorBoundary>
    );
  }

  return <LegacyProjectProvider>{children}</LegacyProjectProvider>;
}
```

### User Impact Mitigation

#### 1. **Transparent Migration**

```javascript
// Show loading state during data migration
function ProjectProvider({ children }) {
  const [migrationStatus, setMigrationStatus] = useState('pending');

  useEffect(() => {
    async function migrateData() {
      setMigrationStatus('migrating');
      try {
        await migrateFromLocalStorageToIndexedDB();
        setMigrationStatus('complete');
      } catch (error) {
        setMigrationStatus('error');
      }
    }

    if (needsMigration()) {
      migrateData();
    } else {
      setMigrationStatus('complete');
    }
  }, []);

  if (migrationStatus === 'migrating') {
    return <MigrationSplashScreen />;
  }

  if (migrationStatus === 'error') {
    return <MigrationErrorScreen />;
  }

  return <ProjectContext.Provider ...>{children}</ProjectContext.Provider>;
}
```

#### 2. **Background Migration**

```javascript
// Migrate data in the background without blocking users
useEffect(() => {
  async function backgroundMigration() {
    const items = await getItemsFromLocalStorage();

    for (const item of items) {
      // Migrate one item at a time
      await migrateItemToIndexedDB(item);

      // Use requestIdleCallback to avoid blocking UI
      await new Promise(resolve => {
        requestIdleCallback(resolve);
      });
    }
  }

  backgroundMigration();
}, []);
```

#### 3. **Communication Strategy**

```javascript
// Show in-app notification about upcoming changes
function MigrationNotification() {
  const [dismissed, setDismissed] = useLocalStorage('migration-notice-dismissed', false);

  if (dismissed) return null;

  return (
    <Banner type="info">
      We're improving our app! Your data is being upgraded to a faster storage system.
      <Button onClick={() => setDismissed(true)}>Got it</Button>
    </Banner>
  );
}
```

**Sources:**
- [Progressive Delivery Guide](https://medium.com/@priyanshu011109/progressive-delivery-canary-deployments-feature-flags-a-b-testing-320d1337b3ce)
- [Deployment Strategies - Flagsmith](https://www.flagsmith.com/blog/deployment-strategies)

---

## Validation & Error Handling

### Zod Schema Validation Best Practices

#### 1. **Safe Parsing (Never Throw)**

```typescript
import { z } from 'zod';

const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  createdAt: z.string().datetime()
});

// ❌ Bad: Throws errors
function saveProject(data: unknown) {
  const project = ProjectSchema.parse(data); // Throws!
  // ...
}

// ✅ Good: Returns result object
function saveProject(data: unknown) {
  const result = ProjectSchema.safeParse(data);

  if (!result.success) {
    // Handle errors gracefully
    return { success: false, error: result.error };
  }

  // Type-safe data access
  const project = result.data;
  return { success: true, data: project };
}
```

**Source:** [Zod Docs - Safe Parse](https://github.com/colinhacks/zod)

#### 2. **Structured Error Handling**

```typescript
// Get detailed error information
const result = ProjectSchema.safeParse(invalidData);

if (!result.success) {
  // Access structured errors
  result.error.issues;
  /* [
    {
      code: "invalid_type",
      expected: "string",
      received: "number",
      path: ["name"],
      message: "Expected string, received number"
    }
  ] */
}
```

#### 3. **Flattened Errors for Forms**

```typescript
const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older")
});

const result = FormSchema.safeParse(formData);

if (!result.success) {
  // ✅ Get flat structure perfect for displaying in forms
  const errors = result.error.flatten();
  /*
  {
    formErrors: [],
    fieldErrors: {
      name: ["Name is required"],
      email: ["Invalid email"],
      age: ["Must be 18 or older"]
    }
  }
  */

  // Easy to display next to each field
  return (
    <form>
      <input name="name" />
      {errors.fieldErrors.name?.[0] && (
        <ErrorMessage>{errors.fieldErrors.name[0]}</ErrorMessage>
      )}
    </form>
  );
}
```

#### 4. **Custom Error Messages**

```typescript
const ProjectSchema = z.object({
  name: z.string().min(5, {
    message: "Project name must be at least 5 characters"
  }),
  budget: z.number().positive({
    message: "Budget must be a positive number"
  }),
  email: z.string().email({
    message: "Please enter a valid email address"
  })
});
```

#### 5. **Type-Safe Error Handling with TypeScript**

```typescript
import { z } from 'zod';

const Schema = z.object({
  // ... schema definition
});

// Infer error types
type FormattedErrors = z.inferFormattedError<typeof Schema>;
type FlattenedErrors = z.inferFlattenedErrors<typeof Schema>;

// Type-safe error handling
function displayErrors(errors: FlattenedErrors) {
  // TypeScript knows the structure!
  errors.fieldErrors.name; // string[] | undefined
}
```

**Source:** [Zod Error Handling Docs](https://github.com/colinhacks/zod/blob/main/packages/docs-v3/ERROR_HANDLING.md)

### Optimistic UI Updates with Rollback

#### 1. **React 19's useOptimistic Hook**

```javascript
import { useOptimistic } from 'react';

function ProjectList({ projects }) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    projects,
    (state, newProject) => [...state, newProject]
  );

  async function handleAddProject(projectData) {
    // Immediately show in UI (optimistic)
    addOptimisticProject({
      ...projectData,
      id: 'temp-' + Date.now(),
      isPending: true
    });

    try {
      // Make actual API call
      const savedProject = await api.saveProject(projectData);
      // Success! React will automatically replace optimistic update
      // with real data when parent re-renders
    } catch (error) {
      // Failure! React automatically rolls back optimistic update
      showErrorToast('Failed to save project');
    }
  }

  return (
    <ul>
      {optimisticProjects.map(project => (
        <li key={project.id} className={project.isPending ? 'pending' : ''}>
          {project.name}
        </li>
      ))}
    </ul>
  );
}
```

**Benefits:**
- Automatic rollback on failure
- Smooth UX with instant feedback
- Built-in state management

**Source:** [React useOptimistic Docs](https://react.dev/reference/react/useOptimistic)

#### 2. **TanStack Query (React Query) Pattern**

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useAddProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject) => api.saveProject(newProject),

    // Optimistic update
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically update
      queryClient.setQueryData(['projects'], (old) => [...old, newProject]);

      // Return context with snapshot
      return { previousProjects };
    },

    // Rollback on error
    onError: (err, newProject, context) => {
      queryClient.setQueryData(['projects'], context.previousProjects);
      showErrorToast('Failed to add project');
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}
```

**Source:** [TanStack Query - Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates)

#### 3. **Manual Optimistic Update Pattern**

```javascript
function useOptimisticMutation(mutationFn) {
  const [state, setState] = useState({
    data: null,
    isOptimistic: false,
    error: null
  });

  const mutate = async (optimisticData) => {
    // Store current state for rollback
    const previousState = state.data;

    // Apply optimistic update
    setState({
      data: optimisticData,
      isOptimistic: true,
      error: null
    });

    try {
      // Execute actual mutation
      const result = await mutationFn(optimisticData);

      // Success: apply real data
      setState({
        data: result,
        isOptimistic: false,
        error: null
      });
    } catch (error) {
      // Rollback to previous state
      setState({
        data: previousState,
        isOptimistic: false,
        error
      });
      throw error;
    }
  };

  return [state, mutate];
}

// Usage
function ProjectForm() {
  const [project, saveProject] = useOptimisticMutation(api.saveProject);

  const handleSubmit = async (data) => {
    try {
      await saveProject(data);
      showSuccessToast('Project saved!');
    } catch (error) {
      showErrorToast('Failed to save project');
    }
  };

  return (
    <div>
      {project.isOptimistic && <Badge>Saving...</Badge>}
      {/* form fields */}
    </div>
  );
}
```

**Sources:**
- [Optimistic UI Guide - CodingEasyPeasy](https://www.codingeasypeasy.com/blog/optimistic-ui-updates-with-rollback-a-comprehensive-guide-with-code-examples)
- [Optimistic Updates Deep Dive](https://medium.com/@ignatovich.dm/implementing-optimistic-ui-updates-in-react-a-deep-dive-2f4d91e2b1a4)

### User-Friendly Error Messaging

#### 1. **Progressive Error Detail**

```javascript
function ErrorDisplay({ error }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="error-container">
      {/* User-friendly message */}
      <h3>Something went wrong</h3>
      <p>We couldn't save your project. Please try again.</p>

      {/* Action buttons */}
      <Button onClick={retry}>Try Again</Button>
      <Button variant="secondary" onClick={cancel}>Cancel</Button>

      {/* Technical details (collapsible) */}
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide' : 'Show'} technical details
      </button>

      {showDetails && (
        <pre className="error-details">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

#### 2. **Contextual Error Messages**

```javascript
function getErrorMessage(error, context) {
  // Network errors
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  // Validation errors
  if (error instanceof z.ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const fields = Object.keys(fieldErrors);
    return `Please fix the following fields: ${fields.join(', ')}`;
  }

  // Permission errors
  if (error.status === 403) {
    return "You don't have permission to perform this action.";
  }

  // Generic fallback
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}
```

#### 3. **Error Recovery Suggestions**

```javascript
function ErrorMessage({ error, onRetry }) {
  const suggestions = getRecoverySuggestions(error);

  return (
    <div className="error-banner">
      <AlertIcon />
      <div>
        <strong>{error.title}</strong>
        <p>{error.message}</p>

        {suggestions.length > 0 && (
          <div className="suggestions">
            <p>Try these steps:</p>
            <ul>
              {suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
}

function getRecoverySuggestions(error) {
  if (error.type === 'network') {
    return [
      'Check your internet connection',
      'Disable any VPN or proxy',
      'Try refreshing the page'
    ];
  }

  if (error.type === 'storage') {
    return [
      'Clear your browser cache',
      'Ensure you have enough storage space',
      'Try using a different browser'
    ];
  }

  return [
    'Refresh the page and try again',
    'Log out and log back in',
    'Contact support if the problem persists'
  ];
}
```

#### 4. **Toast Notifications for Non-Critical Errors**

```javascript
import { toast } from 'react-hot-toast';

// Success
toast.success('Project saved successfully!');

// Error with action
toast.error('Failed to save project', {
  duration: 5000,
  action: {
    label: 'Retry',
    onClick: () => retrySave()
  }
});

// Info
toast('Your changes are being saved...', {
  icon: '💾'
});

// Custom with rollback
toast.error(
  (t) => (
    <div>
      <p>Failed to delete project</p>
      <button onClick={() => {
        undoDelete();
        toast.dismiss(t.id);
      }}>
        Undo
      </button>
    </div>
  ),
  { duration: 8000 }
);
```

---

## Implementation Checklist

### Phase 1: Planning & Setup (Week 1)

- [ ] **Research & Documentation**
  - [ ] Review all best practices in this document
  - [ ] Identify specific patterns applicable to your project
  - [ ] Document current architecture
  - [ ] Create migration specification document

- [ ] **Feature Flag Setup**
  - [ ] Choose feature flag solution (custom vs. service)
  - [ ] Set up feature flag configuration
  - [ ] Create flags for each migration component
  - [ ] Test flag toggling in dev environment

- [ ] **Storage Adapter Design**
  - [ ] Define storage interface
  - [ ] Implement localStorage adapter
  - [ ] Implement IndexedDB/database adapter
  - [ ] Create migration adapter for transition period

- [ ] **Testing Strategy**
  - [ ] Set up test environment
  - [ ] Create test data sets
  - [ ] Define success metrics
  - [ ] Set up monitoring/logging

### Phase 2: Context Migration (Week 2-3)

- [ ] **Create Async Context**
  - [ ] Implement new async context with loading/error states
  - [ ] Add useCallback/useMemo optimizations
  - [ ] Implement race condition prevention
  - [ ] Add error boundaries

- [ ] **Side-by-Side Implementation**
  - [ ] Keep legacy context running
  - [ ] Implement new context in parallel
  - [ ] Add feature flag to switch between them
  - [ ] Test both implementations

- [ ] **Validation Layer**
  - [ ] Define Zod schemas for all data types
  - [ ] Implement safeParse patterns
  - [ ] Add custom error messages
  - [ ] Create error display components

### Phase 3: Internal Testing (Week 3)

- [ ] **Developer Testing**
  - [ ] Enable for your own account
  - [ ] Test all user flows
  - [ ] Verify data persistence
  - [ ] Check console for errors
  - [ ] Test HMR behavior

- [ ] **Team Testing**
  - [ ] Enable for company domain
  - [ ] Collect team feedback
  - [ ] Fix discovered issues
  - [ ] Update documentation

- [ ] **Performance Testing**
  - [ ] Benchmark load times
  - [ ] Test with large datasets
  - [ ] Profile memory usage
  - [ ] Compare with legacy implementation

### Phase 4: Rollout (Week 4-5)

- [ ] **Beta Rollout**
  - [ ] Enable for beta users (5%)
  - [ ] Monitor error rates
  - [ ] Collect user feedback
  - [ ] Verify metrics

- [ ] **Gradual Rollout**
  - [ ] Day 1: 10% of users
  - [ ] Day 3: 25% of users
  - [ ] Day 5: 50% of users
  - [ ] Day 7: 100% of users

- [ ] **Monitoring**
  - [ ] Set up error tracking (Sentry, etc.)
  - [ ] Monitor performance metrics
  - [ ] Track user engagement
  - [ ] Watch support tickets

### Phase 5: Cleanup (Week 6)

- [ ] **Remove Legacy Code**
  - [ ] Remove feature flags
  - [ ] Delete old context implementation
  - [ ] Clean up migration adapters
  - [ ] Remove old storage code

- [ ] **Documentation**
  - [ ] Update architecture docs
  - [ ] Create developer guide
  - [ ] Document lessons learned
  - [ ] Update onboarding materials

---

## Additional Resources

### Official Documentation

- **React Docs - useContext:** https://react.dev/reference/react/useContext
- **React Docs - useOptimistic:** https://react.dev/reference/react/useOptimistic
- **React Docs - use() Hook:** https://react.dev/reference/react/use
- **Zod Documentation:** https://zod.dev/
- **TanStack Query:** https://tanstack.com/query/latest

### Articles & Guides

**React Context & Async Patterns:**
- Kent C. Dodds - How to use React Context effectively: https://kentcdodds.com/blog/how-to-use-react-context-effectively
- React Design Patterns 2025: https://www.telerik.com/blogs/react-design-patterns-best-practices
- Advanced React Context Patterns: https://mernstackdev.com/react-context-api-patterns/

**Storage Adapters & Migrations:**
- Repository Pattern with TypeScript: https://blog.logrocket.com/exploring-repository-pattern-typescript-node/
- RxDB Migration Storage: https://rxdb.info/migration-storage.html
- Replacing localStorage with IndexedDB: https://xon5.medium.com/replacing-localstorage-with-indexeddb-2e11a759ff0c

**Feature Flags & Progressive Delivery:**
- Implementing Feature Flags in React: https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3
- Canary Releases with Feature Flags: https://www.harness.io/blog/canary-release-feature-flags
- Progressive Delivery Guide: https://medium.com/@priyanshu011109/progressive-delivery-canary-deployments-feature-flags-a-b-testing-320d1337b3ce

**Optimistic UI & Error Handling:**
- Optimistic UI with Rollback Guide: https://www.codingeasypeasy.com/blog/optimistic-ui-updates-with-rollback-a-comprehensive-guide-with-code-examples
- Understanding useOptimistic: https://blog.logrocket.com/understanding-optimistic-ui-react-useoptimistic-hook/
- Zod Error Handling: https://github.com/colinhacks/zod/blob/main/packages/docs-v3/ERROR_HANDLING.md

### GitHub Repositories

**Storage Adapters:**
- storagefy: https://github.com/arthurgermano/storagefy
- keyv-browser: https://github.com/zaaack/keyv-browser
- feathersjs-offline/localforage: https://github.com/feathersjs-offline/localforage

**React Context Examples:**
- react-async-context: https://github.com/maxgfr/react-async-context
- react-context-saga: https://github.com/DKbyo/react-context-saga
- react-async: https://github.com/async-library/react-async
- Context + useReducer + async: https://gist.github.com/velopert/d418517581e580c5191f385cf8f2f3b0

**Feature Flag Tools:**
- LaunchDarkly React SDK: https://github.com/launchdarkly/react-client-sdk
- Unleash: https://github.com/Unleash/unleash
- Flagsmith: https://github.com/Flagsmith/flagsmith

### Tools & Libraries

**State Management:**
- TanStack Query (React Query): Best for server state
- Zustand: Minimal state management
- Jotai: Atomic state management

**Storage:**
- localForage: Mozilla's storage library
- idb: IndexedDB wrapper
- Dexie.js: IndexedDB wrapper with migrations

**Error Tracking:**
- Sentry
- LogRocket
- Datadog RUM

**Feature Flags:**
- LaunchDarkly
- Split.io
- ConfigCat
- Unleash
- Flagsmith

---

**Document Version:** 1.0
**Last Updated:** 2025-10-14
**Compiled for:** Banking Journey Orchestration Framework - Interactive Strategist Tool Migration
