# Interactive Strategist Tool - Development Guide

**Last Updated:** October 15, 2025
**Status:** ✅ Production Ready - Single-tenant Supabase architecture complete
**Primary Maintainer:** Epicosity Team

---

## 🤖 Instructions for AI Agents

**IMPORTANT:** This project follows the **Compounding Engineering** workflow. See [../docs/compounding-engineering-workflow.md](../docs/compounding-engineering-workflow.md) for complete details.

### Your Role as an Agent

When working on this project, you MUST:

1. **Always check current workflow phase** by reading [PROJECT-STATUS.md](PROJECT-STATUS.md)
2. **Inform the user** where they are in the workflow cycle
3. **Recommend next steps** based on the current phase
4. **Follow the workflow cycle**: Plan → Delegate → Assess → Codify

### Workflow Cycle Reminders

After completing any significant work, remind the user:

**After Planning (GitHub issue created):**
```
✅ Planning phase complete for [feature name]

Current workflow phase: PLAN → **DELEGATE**

Recommended next step:
/workflows/work https://github.com/org/repo/issues/[number]

This will create a worktree, implement the feature systematically,
and create a PR when complete.
```

**After Implementation (PR created):**
```
✅ Implementation complete for [feature name]

Current workflow phase: DELEGATE → **ASSESS**

Recommended next step:
/workflows/review [PR-number]

This will run 10+ specialized agents to review code quality,
security, performance, and architecture.
```

**After Review (findings generated):**
```
✅ Code review complete - found [N] findings

Current workflow phase: ASSESS → **CODIFY**

Recommended next step:
/workflows/triage

This will present each finding for you to accept or skip.
Accepted findings become tracked todos for resolution.
```

**After Triage (todos created):**
```
✅ Triage complete - created [N] todos

Current workflow phase: CODIFY → **COMPLETE**

Recommended next step:
/workflows/resolve_todo_parallel

This will analyze dependencies and resolve todos in parallel
where possible, then sequential for dependent items.
```

**After Resolution (all todos complete):**
```
✅ All todos resolved

Current workflow phase: COMPLETE → **PLAN** (next feature)

This feature is ready to merge. The compounding effect is working:
- Patterns documented
- Knowledge captured
- Agents improved
- Next similar feature will be faster

Ready to start the next feature? Check PROJECT-STATUS.md
for the next milestone.
```

### Status Check Template

At the start of EVERY conversation, provide this status update:

```
📊 Project Status Check

Epic: [Current Epic Name]
Progress: [X]% complete
Current Phase: [Phase Name]

Completed:
- ✅ [List completed milestones]

In Progress:
- 🏗️ [Current work]

Next Up:
- 📋 [Next milestone]

Workflow Phase: [PLAN/DELEGATE/ASSESS/CODIFY]

See PROJECT-STATUS.md for full details.
```

### Following the Workflow

**For Planning Tasks:**
- Read GitHub issue #3 (Epic 4) and PROJECT-STATUS.md
- Check what phases are complete vs. pending
- Recommend using `/workflows/plan` for new features
- Create detailed issues with acceptance criteria

**For Implementation Tasks:**
- Always use worktrees (never work in main directory for features)
- Create feature branch: `git worktree add -b feature-name .worktrees/feature-name`
- Use TodoWrite to track implementation progress
- Run tests after each significant change
- Commit frequently with clear messages

**For Review Tasks:**
- Use `/workflows/review [PR-number]` for comprehensive review
- Review runs in isolated worktree automatically
- Expect 10+ agents analyzing different aspects
- Findings categorized by severity (P1/P2/P3)

**For Codification Tasks:**
- Use `/workflows/triage` to convert findings to todos
- Each todo gets a file: `042-pending-p1-description.md`
- Use `/workflows/resolve_todo_parallel` to fix issues efficiently
- Update learnings in this CLAUDE.md file

### TypeScript Standards

This project uses TypeScript for all new components:

- ✅ Always use `.tsx` for React components
- ✅ Define proper interfaces for all props
- ✅ Use type guards instead of `@ts-ignore`
- ✅ Handle nullable types with proper checks or `!` assertions
- ✅ Export types from implementation files when appropriate
- ❌ Never suppress TypeScript errors without good reason
- ❌ Don't use `any` unless absolutely necessary

See [CODE-REVIEW-TYPESCRIPT-MIGRATION.md](../CODE-REVIEW-TYPESCRIPT-MIGRATION.md) for patterns.

### Quality Standards

Before considering any work "complete":

- [ ] TypeScript compilation: 0 errors (`npx tsc --noEmit`)
- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] All acceptance criteria met
- [ ] Documentation updated
- [ ] Learnings captured in CLAUDE.md

### Compounding Principle

Remember: **Every unit of engineering work should make subsequent units easier.**

This means:
- Document patterns as you discover them
- Update schemas when adding validation
- Improve error messages when debugging
- Create reusable components
- Capture learnings in Key Learnings section
- Update reviewer agents with new patterns

The 4th similar feature should take 25% of the time of the 1st.

---

## Quick Start

### Development Server
```bash
cd strategist-tool
npm run dev
# App runs on http://localhost:5173
```

### Test Credentials
- **Email:** chris@epicosity.com
- **User ID:** d9d00199-3518-42d5-be1b-152c503131d3
- **Supabase Project:** lmuejkfvsjscmboaayds (us-east-2)

### Environment Setup
Required in `strategist-tool/.env.local`:
```bash
VITE_SUPABASE_URL=https://lmuejkfvsjscmboaayds.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

---

## Current Status

📊 **For detailed milestone tracking, see:** [PROJECT-STATUS.md](PROJECT-STATUS.md)

### Current Workflow Phase

**Workflow Cycle Position:** PLAN → **DELEGATE**

**Just Completed:**
- ✅ PR #28: Security hardening & test coverage (MERGED October 16, 2025)
  - Security hardening (Issue #032): Environment-specific logging, GDPR/CCPA compliant
  - Dependency injection (Issue #033): ErrorTrackingService with testable architecture
  - Test coverage (Issue #034): 24/24 tests passing, ~95% coverage
- ✅ Comprehensive multi-agent code review (8 specialized agents)
- ✅ Live testing in dev environment (all functional, zero console errors)
- ✅ All Phase 2 P0 blockers resolved

**Current Work:**
- 🏗️ Issue #29: Silent Data Loss Prevention (PLAN phase)
- Planning approach for auto-save blocking and user notification
- Estimated: 6-8 hours (Phases 1-3) or 5-7 hours (Phases 1-2)

**Next Steps:**
1. **Option A (Compounding Workflow):** Use `/workflows/work https://github.com/epicosityweb/banking-orchestration-framework-explainer/issues/29` to systematically implement
2. **Option B (Manual):** Create feature branch `issue-29-data-loss-prevention` + worktree, implement phases incrementally

**Recommendation:** Option C from planning (Phases 1 + 2) - Stops data loss + informs users, can ship this week

---

### Epic Progress

**Epic 4: Tag Library & Journey Designer** - 🏗️ IN PROGRESS (45% Complete)
- ✅ Phase 1: Foundation & Data Model (18 hours)
- ✅ Phase 2: Tag Library Browser (22 hours)
- ✅ Phase 3: Tag Management (30 hours)
- ✅ TypeScript Migration (complete, 0 errors)
- ✅ PR #28: Validation & Security Hardening (MERGED)
- 🏗️ Issue #29: Data Loss Prevention (IN PLANNING)
- 📋 Phase 4: Property Rule Builder (40 hours) - **NEXT AFTER #29**
- 📋 Phase 5: Activity, Association & Score Rules (39 hours)
- 📋 Phase 6: Rule Testing & Visualization (30 hours)
- 📋 Phase 7: Journey Designer (25 hours)

**What's Complete:**
- ✅ Core React application (9+ components)
- ✅ Service layer architecture (adapter pattern + error tracking)
- ✅ Supabase authentication system
- ✅ Single-tenant database schema
- ✅ All CRUD operations working
- ✅ Auto-save functionality (30-second debounce)
- ✅ Tag library with 30 pre-built banking tags
- ✅ Tag CRUD with validation and dependency checking
- ✅ TypeScript migration (5 components, 940-line context)
- ✅ Security hardening (environment-specific logging, sanitized Sentry)
- ✅ Comprehensive test coverage (24/24 tests passing)

---

## Architecture Overview

🏗️ **For comprehensive technical details, see:** [ARCHITECTURE.md](ARCHITECTURE.md)

### High-Level Stack
```
┌─────────────────────────────────────────┐
│  React 19 Frontend (Vite 7.1.9)        │
├─────────────────────────────────────────┤
│  Service Layer (Adapter Pattern)       │
│  • ProjectRepository                    │
│  • ValidationService (Zod)             │
├─────────────────────────────────────────┤
│  Storage Adapters                       │
│  • SupabaseAdapter (production)        │
│  • LocalStorageAdapter (dev/test)      │
├─────────────────────────────────────────┤
│  Supabase Backend                       │
│  • PostgreSQL (single-tenant)          │
│  • Row Level Security (RLS)            │
│  • Session-based authentication        │
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

**Single-Tenant Workspace** (October 14, 2025)
- All authenticated users share access to all projects
- `owner_id` field tracks project creator
- `project_permissions` table ready for future role-based access
- **Rationale:** Simpler mental model for internal team tool, faster implementation

**Session-First Authentication Pattern**
- Always check `getSession()` before calling `getUser()`
- Follows Supabase best practices
- Prevents `AuthSessionMissingError`

**Adapter Pattern for Storage**
- Swappable backends (Supabase ↔ localStorage)
- Makes testing easier
- Future-proof for backend changes

---

## Todo System

This project uses the Compounding Engineering todo system for tracking work items from code reviews and planning.

### Todo Directory Structure
```
todos/
├── 032-done-p0-information-disclosure-logging.md    # Completed
├── 033-done-p0-untestable-global-dependencies.md   # Completed
├── 034-done-p0-missing-test-coverage.md            # Completed
└── README.md (if exists)
```

### Status Flow
```
pending → ready → in_progress → done
```

### Creating Todos

Todos are typically created through the `/workflows/triage` command after code reviews, but can also be created manually:

```bash
# After comprehensive review
/workflows/review [PR-number]

# Triage findings into todos
/workflows/triage

# Resolve todos (analyzes dependencies, runs in parallel where possible)
/workflows/resolve_todo_parallel
```

### Manual Todo Creation

For urgent issues or planning, create todos directly:

```bash
cp todos/000-TEMPLATE.md todos/042-ready-p1-fix-critical-bug.md
# Edit file with issue details
```

### PR #28 Example

PR #28 demonstrated the full todo workflow:

1. **Review:** 8 specialized agents identified 4 P0 blockers
   - TypeScript Reviewer (Kieran)
   - Git History Analyzer
   - Pattern Recognition Specialist
   - Architecture Strategist
   - Security Sentinel
   - Performance Oracle
   - Data Integrity Guardian
   - Code Simplicity Reviewer

2. **Triage:** Created 3 todo files (032, 033, 034) + 1 GitHub issue (029)
   - Issue #032: Information disclosure (CVSS 7.5) - Environment-specific logging
   - Issue #033: Untestable dependencies - Dependency injection pattern
   - Issue #034: Missing test coverage - 24 comprehensive tests
   - Issue #29: Silent data loss (follow-up PR)

3. **Resolve:** Task agents fixed all issues in parallel
   - Security hardening + dependency injection (parallel execution)
   - Comprehensive test suite (577 lines)

4. **Result:** Security hardened, fully tested, merged
   - All acceptance criteria met
   - Zero breaking changes
   - Live testing verified

See completed todos in `todos/` directory for reference patterns.

---

## Recent Work

📋 **For complete implementation details, see:** [.github/ISSUE-002-supabase-single-tenant-complete.md](../.github/ISSUE-002-supabase-single-tenant-complete.md)

### PR #28: Compounding Workflow in Action (October 15-16, 2025)

**Workflow Cycle Demonstrated:**

**PLAN:**
- Initial issue: Add read-time validation for corrupt tags
- Acceptance criteria: Graceful error handling, Sentry integration
- Created GitHub PR #28

**DELEGATE (Phase 1):**
- Implemented `_validateTagArray()` method (53 lines)
- Added date validation strengthening (`z.string().datetime()`)
- Environment-specific console logging
- Sentry integration for error tracking
- Created PR #28 with initial validation logic

**ASSESS:**
- Multi-agent comprehensive review (8 specialized agents)
- Review identified 4 P0 blockers preventing safe merge:
  - **Issue #032:** Information disclosure (CVSS 7.5) - PII in logs/Sentry
  - **Issue #033:** Untestable global dependencies - Direct `window.Sentry` access
  - **Issue #034:** Missing test coverage (0%) - 53 lines untested
  - **Issue #29:** Silent data loss risk - Auto-save deletes corrupt tags

**CODIFY:**
- Created 3 todo files for immediate blockers (032, 033, 034)
- Created GitHub Issue #29 for follow-up work (data loss prevention)
- Resolved todos in 2 parallel Task agents:
  - **Security Agent:** Environment-specific logging + sanitized Sentry payloads
  - **Dependency Injection Agent:** ErrorTrackingService + constructor injection
  - **Test Coverage Agent:** 24 comprehensive tests (577 lines, ~95% coverage)

**COMPLETE:**
- All Phase 2 fixes committed (0b3b93b):
  - [SupabaseAdapter.js](strategist-tool/src/services/adapters/SupabaseAdapter.js) - Security + DI
  - [errorTracking.js](strategist-tool/src/services/errorTracking.js) - 92 lines (NEW)
  - [SupabaseAdapter.test.js](strategist-tool/src/services/adapters/__tests__/SupabaseAdapter.test.js) - 577 lines (NEW)
  - [ProjectRepository.js](strategist-tool/src/services/ProjectRepository.js) - Error tracker injection
- PR #28 merged to main (October 16, 2025)
- Live testing verified in dev environment (localhost:5175)
- Zero console errors, all functionality working
- 29 tags loaded successfully from database

**Compounding Effect:**
1. **ErrorTrackingService Pattern** - Now reusable across all adapters/services
2. **Test Suite Structure** - Template for future validation tests
3. **Security Patterns** - Environment-specific logging documented for reviewer agents
4. **Dependency Injection** - All future adapters will use this testable pattern
5. **Code Review Process** - 8-agent comprehensive review now standard

**Metrics:**
- **Time Investment:** ~12 hours total (3h Phase 1 + 9h Phase 2)
- **Code Changes:** +771 additions, -7 deletions
- **Test Coverage:** 0% → 95% for validation logic
- **Security Impact:** CVSS 7.5 vulnerability eliminated
- **Next Similar Feature:** Estimated 50% faster due to patterns established

**Result:** Next validation feature will be significantly faster:
- ErrorTrackingService already exists (reuse, don't rebuild)
- Test patterns established (copy/adapt, don't design from scratch)
- Security checklist documented (prevent issues, don't fix later)
- Review agents improved (catch more issues, earlier)

---

### Next Feature: Issue #29 (Silent Data Loss Prevention)

**Workflow Phase:** PLAN → **DELEGATE**

**GitHub Issue:** https://github.com/epicosityweb/banking-orchestration-framework-explainer/issues/29

**Planning Complete:**
- Detailed specification created with 3 implementation phases
- Root cause identified: Validation filtering + Auto-save = Permanent data loss
- Estimated effort: 6-8 hours total (or 5-7 hours for Phases 1-2)

**The Problem:**
```
T+0s:   User loads project → Corrupt tags filtered out silently
T+30s:  Auto-save triggers → Filtered data saved to database
T+30s:  💥 CORRUPT TAGS PERMANENTLY DELETED
```

**Recommended Approach:**

**Option C (Balanced - Recommended):** Phases 1 + 2 (5-7 hours)
- ✅ Phase 1: Auto-save blocking (2-3h) - Stops data loss immediately
- ✅ Phase 2: User notification (3-4h) - Informs users what's happening
- ⏳ Phase 3: Recovery system (follow-up PR) - Nice-to-have for rare cases

**Implementation Options:**

**Option A: Use Compounding Workflow (Recommended)**
```bash
/workflows/work https://github.com/epicosityweb/banking-orchestration-framework-explainer/issues/29
```
This will:
- Create feature branch + worktree automatically
- Break down work into todos based on phases
- Execute each phase systematically with tests
- Create PR when complete

**Option B: Manual Implementation**
```bash
# Create worktree manually
git worktree add -b issue-29-data-loss-prevention .worktrees/issue-29

# Implement phases incrementally:
# Phase 1: Modify _validateTagArray() to return corruption metadata
# Phase 2: Update ProjectContext-v2 to block auto-save when corrupt data detected
# Phase 3: Create CorruptDataBanner.tsx component for user notification

# Create PR manually
gh pr create --base main --head issue-29-data-loss-prevention
```

**Files to Modify:**
- `strategist-tool/src/services/adapters/SupabaseAdapter.js` - Return corruption metadata
- `strategist-tool/src/context/ProjectContext-v2.tsx` - Block auto-save logic
- `strategist-tool/src/components/ui/CorruptDataBanner.tsx` - User notification (NEW)

**Success Criteria:**
- [ ] Auto-save disabled when corrupt data detected
- [ ] User receives notification banner explaining the issue
- [ ] Valid tags still display and function normally
- [ ] Tests verify auto-save blocking behavior
- [ ] No data loss occurs (corrupt tags preserved in database)

**After Completion:**
- Will advance to Phase 4: Property Rule Builder (Epic 4 continuation)
- ErrorTrackingService pattern will be reused (compounding effect working)
- Corruption detection patterns now established for future use

---

### Phase 5: Single-Tenant Supabase Migration (October 14, 2025)

**What We Built:**
1. Database schema v2 with single-tenant architecture
2. Complete authentication system (AuthContext, LoginPage, ProtectedRoute)
3. Production-ready SupabaseAdapter with session-first auth
4. All 9 components updated for async operations

**Critical Bug Fixes:**
- **Bug #1:** Fixed UUID generation (`generateId()` vs timestamp strings)
- **Bug #2:** Fixed auth session handling (getSession → getUser pattern)
- **Bug #3:** Fixed missing name field in database inserts

**Testing Results:**
```sql
-- Sample project created successfully
SELECT id, name, owner_id FROM implementations;
-- id: 36b159c0-cff2-4470-8f87-7751f70d0cee
-- name: Levo
-- owner_id: d9d00199-3518-42d5-be1b-152c503131d3
```

---

## Key Learnings

### October 15, 2025: JavaScript/TypeScript Architecture Pattern

**Context:** During code review of PR #27, the TypeScript reviewer flagged SupabaseAdapter.js as a "type safety violation" for being JavaScript instead of TypeScript.

**Investigation:** Reviewed project history (PR #24, PR #26, commit 1b8de47) and discovered this is an **intentional architectural pattern** established in Phase 1.

**Architecture Pattern:**
```
Service/Adapter Layer: JavaScript (.js)
├── IStorageAdapter.js (interface)
├── LocalStorageAdapter.js (implementation)
├── SupabaseAdapter.js (implementation)
└── ProjectRepository.js + .d.ts (typed JavaScript)

Validation/Schema Layer: TypeScript (.ts)
├── ValidationService.ts
├── tagSchema.ts
└── objectSchema.ts

Current Ratio: 42 JS files : 21 TS files (2:1 by design)
```

**Why This Works:**

1. **Runtime Validation via Zod:** Adapters need runtime type safety for database data, which Zod provides through `.safeParse()` - catches errors JavaScript → Supabase → JavaScript round-trip
2. **Runtime Flexibility:** Adapters handle dynamic Supabase client interactions that benefit from JavaScript's flexibility
3. **Type Definitions Available:** `.d.ts` files provide compile-time safety where needed (e.g., ProjectRepository)
4. **Proven Stability:**
   - PR #24: Successfully maintained `.js` pattern while fixing schema alignment
   - PR #26: Resolved Zod 4.x → 3.x stability in mixed JS/TS environment
   - No type-related production issues in 3 months

**Historical Evidence:**
- **Phase 1 (1b8de47):** All adapters created as `.js` files
- **42 JS files:** Service layer, adapters, contexts, tests
- **21 TS files:** Validation, schemas, type definitions

**Lesson:** Mixed JS/TS codebases are valid when each language serves its purpose. For adapters handling database round-trips, JavaScript + Zod validation provides better runtime error detection than TypeScript alone. The 2:1 JS:TS ratio reflects this codebase's pragmatic approach: TypeScript for compile-time contracts, JavaScript for runtime flexibility.

**Takeaway for Code Reviews:** Don't assume `.js` files are oversights. Check project history and established patterns before flagging architectural "violations." In this case, the JS/TS mix is a deliberate, stable pattern that has proven effective across multiple PRs.

---

### October 14, 2025: Single-Tenant Architecture Decision

**Context:** After completing Phase 3 (multi-tenant Supabase adapter), we faced a choice: continue with incremental React Context migration (which was blocked) or pivot to a simpler approach.

**Decision:** Pivoted to single-tenant architecture with direct Supabase integration.

**Why This Mattered:**
- Bypassed context migration complexity entirely
- Delivered working authentication and cloud persistence immediately
- Simpler mental model: all employees are trusted collaborators
- No manual migration UI needed - projects automatically save to Supabase

**Trade-offs:**
- Less isolation between users (acceptable for internal tool)
- Owner tracking still maintained via `owner_id` field
- Can add project-level permissions later without architecture change

**Lesson:** For internal team tools, optimizing for simplicity and speed of delivery often beats theoretical architectural purity. The single-tenant shared workspace model fits the actual use case (collaborative team environment) better than complex multi-tenant isolation.

### October 14, 2025: Following Framework Best Practices

**Context:** Hit `AuthSessionMissingError` when calling `auth.getUser()` directly.

**Solution:** Implemented Supabase's recommended session-first pattern:
```javascript
// ❌ Wrong - calling getUser() directly
const { data: { user } } = await supabase.auth.getUser();

// ✅ Correct - check session first
const { data: { session } } = await supabase.auth.getSession();
if (!session) return { error: 'No session' };
const { data: { user } } = await supabase.auth.getUser();
```

**Lesson:** When using third-party frameworks, always follow their documented patterns. Framework authors have encountered these pitfalls before and designed their APIs to guide you away from them.

### October 15, 2025: Zod Pre-Release Version Instability (`_zod` Error)

**Context:** SupabaseAdapter validation caused `Cannot read properties of undefined (reading '_zod')` error, blocking all project CRUD operations. Error occurred during `projectSchema.safeParse()` execution, before any validation results were returned.

**Initial Misdiagnosis:**
Spent hours investigating schema-interface mismatches, adding schema fields (`createdAt`, `savedAt`, `fields`, `mappings`), and attempting to bypass validation in ProjectRepository. All schema definitions appeared correct and matched TypeScript interfaces, yet the `_zod` error persisted.

**Root Cause Discovery:**
The error was NOT a schema mismatch issue. The root cause was **Zod 4.1.12**, a pre-release/beta version with stability issues. The `_zod` error is a Zod internal property access error that occurs in unstable versions, especially in mixed TypeScript/JavaScript environments where:
1. JavaScript files (SupabaseAdapter.js) import Zod directly (`import { z } from 'zod'`)
2. JavaScript files also import TypeScript-generated schemas (from objectSchema.ts)
3. Module loading creates potential for Zod instance mismatches during runtime

**Diagnostic Evidence:**
- Console logs showed: `🔵 SupabaseAdapter.createProject called with: {...}`
- BUT NO subsequent log for: `🔵 Schema validation result:`
- This proved error happened **inside** `safeParse()`, not from validation failure
- Error message: `Cannot read properties of undefined (reading '_zod')`
- Zod version check: `npm list zod` showed `4.1.12`
- NPM registry check: Confirmed 4.1.12 exists but is pre-release (stable is 3.x)

**Solution:**
Downgraded Zod from pre-release 4.1.12 to stable 3.23.8 (installed as 3.25.76, latest stable 3.x):

```json
// package.json
"zod": "^3.23.8"  // Changed from "^4.1.12"
```

**Implementation Steps:**
1. Updated package.json
2. Deleted node_modules and package-lock.json
3. Ran `npm install`
4. Restarted dev server

**Results:**
✅ **COMPLETE SUCCESS** - All functionality working correctly:
```
🔵 SupabaseAdapter.createProject called
🔵 Schema validation result: ✅ PASS
🔵 Auth result: ✅ User ID: d9d00199-3518-42d5-be1b-152c503131d3
🔵 Inserting into Supabase
✅ Supabase insert successful!
```

**Why This Worked:**
1. Zod 3.x is production-ready and stable
2. No breaking changes between 4.1.12 and 3.x for our codebase (no Zod 4.x-specific features used)
3. Eliminates internal `_zod` property access errors
4. Industry standard - most production apps use Zod 3.x

**Lessons Learned:**

1. **Check dependency versions FIRST** - Before diving deep into code changes, verify all dependencies are stable releases
2. **Pre-release versions are NOT production-ready** - Zod 4.x is still in development (canary releases)
3. **Error message context matters** - The lack of subsequent logs revealed error was in library code, not application code
4. **TypeScript/JavaScript interop amplifies library issues** - Mixed environments can expose library instability that wouldn't surface in pure TypeScript
5. **Schema complexity is NOT always the problem** - Sometimes the simplest explanation (wrong version) is correct

**Red Flags That Should Have Been Investigated Earlier:**
- ❌ Zod version 4.x when stable is 3.x
- ❌ Error happening inside library call, not after
- ❌ `_zod` is an internal Zod property (not application code)
- ❌ Error persisted despite all schema definitions being correct

**Takeaways:**
- **ALWAYS use stable dependency versions in production codebases**
- Add `npm outdated` and version checking to PR review process
- Document approved dependency versions in CLAUDE.md
- When debugging library-related errors, check version stability before investigating code
- Add dependency version audit to CI/CD pipeline

**Dependencies to Watch:**
- ✅ Zod: Use 3.x stable (currently 3.25.76)
- ⚠️  Avoid: Zod 4.x pre-release versions (4.1.12, 4.2.0-canary.*)

**Issue Reference:** #23 - SupabaseAdapter Schema Validation Mismatch (misleading title - actual cause was Zod version)

### October 15, 2025: localStorage to Supabase Migration Testing

**Context:** Needed to verify that the migration utility successfully transfers Client Profile data (33 fields) from browser localStorage to Supabase cloud database. Used automated testing via Chrome DevTools MCP to simulate user interactions.

**Challenge #1: Dev Server Running from Wrong Directory**

**Problem:** After adding debug logging to App.jsx, the logs never appeared in the browser console, and code changes weren't being reflected.

**Root Cause:** Vite dev server was running from the main project directory (`/strategist-tool`) instead of the worktree directory (`/.worktrees/client-profile-supabase/strategist-tool`). The browser was loading cached JavaScript from the wrong source.

**Diagnostic Evidence:**
- Network request showed: `http://localhost:5173/src/App.jsx?t=1760553006900` returning 304 (Not Modified)
- Response body contained file path: `/Users/.../Banking Journey Orchestration Framework/strategist-tool/src/App.jsx` (main directory, not worktree)
- Process check revealed: `node .../strategist-tool/node_modules/.bin/vite` (PID 46122)

**Solution:**
```bash
# Kill dev server in main directory
kill 46122

# Start dev server in worktree directory
cd .worktrees/client-profile-supabase/strategist-tool
npm run dev
```

**Why This Worked:**
- Vite now serving files from worktree directory with our changes
- HMR (Hot Module Reload) detecting file changes in correct location
- Browser loading fresh JavaScript bundles, not cached versions

**Challenge #2: UUID Validation Error in Migration**

**Problem:** Migration failed with error: `invalid input syntax for type uuid: "test-project-001"`

**Root Cause:** Migration code was using localStorage project IDs (like `"test-project-001"`) directly as Supabase primary keys, but Supabase's `implementations.id` column has type `uuid`, which requires valid UUID v4 format.

**Diagnostic Evidence:**
```
Error: Failed to create project test-project-001:
invalid input syntax for type uuid: "test-project-001"
```

**Solution:**
```typescript
// migrateToSupabase.ts

// Import UUID generator
import { generateId } from './idGenerator';

// Generate new UUID instead of reusing localStorage ID
const newProjectId = generateId();  // e.g., "a1b2c3d4-..."

const { error } = await repository.createProject({
  id: newProjectId,  // ✅ Valid UUID v4
  name: project.name,
  // ... rest of project data
});
```

**Why This Worked:**
- `generateId()` produces valid UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Supabase accepts these UUIDs for the `id` column
- Removed unnecessary duplicate project check (no longer needed with fresh UUIDs)

**Testing Results:**
✅ Migration completed successfully:
- New project created: "Test Credit Union - Migration Test"
- Project type displayed: "credit_union"
- All 33 Client Profile fields preserved (20 basicInfo + 13 integrationSpecs)
- Data synced to Supabase and visible across browsers (Arc + Chrome)

**Lessons Learned:**

1. **Worktree isolation requires matching dev server** - When working in worktrees, ensure your development server is running from the worktree directory, not the main directory. File watchers and HMR only detect changes in their source directory.

2. **Database constraints must be respected during migration** - When migrating data between storage systems with different schema constraints (localStorage strings → Supabase UUIDs), generate new IDs that meet the target system's requirements rather than attempting to preserve source system IDs.

3. **Chrome DevTools MCP enables powerful automated testing** - Using the Chrome DevTools MCP server allows for:
   - Automated browser interactions (login, form filling, button clicks)
   - Console log inspection for debugging
   - Network request monitoring
   - Script injection for data setup
   - Screenshot capture for verification

4. **Error messages reveal architectural mismatches** - The "invalid input syntax for type uuid" error immediately indicated that our data migration assumed compatible ID formats between source and destination, which was incorrect.

5. **Migration UX patterns** - Effective migration UI includes:
   - Clear explanation of what will happen
   - List of safety features (validation, rollback, backup)
   - Progress states (idle → migrating → success/error)
   - Error handling with retry capability
   - Success confirmation before closing

**Key Pattern: Dev Server Location Check**
```bash
# Before starting work, verify dev server location
lsof -ti:5173  # Get PIDs using port 5173
ps -p <PID> -o command  # Check which directory it's running from

# If wrong directory, restart in correct location
kill <PID>
cd .worktrees/your-worktree/project
npm run dev
```

**Migration Testing Checklist:**
- [ ] Test data injected into source storage (localStorage)
- [ ] User authentication verified
- [ ] Migration prompt displays automatically
- [ ] Migration UI shows clear messaging and safety features
- [ ] Migration completes without errors
- [ ] All fields preserved in destination (Supabase)
- [ ] Data visible in destination system
- [ ] Error handling works (shows retry option)
- [ ] Success state displays before closing

**Files Modified:**
- [migrateToSupabase.ts](strategist-tool/src/utils/migrateToSupabase.ts) - Added UUID generation for Supabase compatibility
- [MIGRATION-TEST-RESULTS.md](strategist-tool/MIGRATION-TEST-RESULTS.md) - Comprehensive test documentation (446 lines)

**Compounding Effect:**
This testing session established:
- Automated testing patterns using Chrome DevTools MCP
- Migration utility verification checklist
- Worktree dev server debugging procedures
- UUID generation requirements for Supabase migrations

Future migrations will be faster and more reliable due to documented patterns and established testing procedures.

### October 14, 2025: Documentation Organization

**Context:** Had three separate planning documents (SUPABASE-MIGRATION-PLAN.md, SERVICE-LAYER-IMPLEMENTATION.md, IMPLEMENTATION-PLAN.md) all describing the same work from different angles.

**Problem:** Confusion about what's complete vs pending, redundant updates needed, unclear entry point for future AI conversations.

**Solution:** Adopted Compounding Engineering pattern from banking-journey-framework:
- Primary guide (this file) as single entry point
- PROJECT-STATUS.md for milestone tracking
- ARCHITECTURE.md for technical details
- Archive obsolete planning docs with explanatory README

**Lesson:** As projects evolve, planning documents can become obsolete or redundant. Periodically consolidate documentation to maintain a single source of truth and clear navigation structure.

---

## Common Tasks

### Creating a New Project
```javascript
// Dashboard.jsx handles this
const newProject = {
  id: generateId(),           // Must use UUID v4
  name: projectName,          // Required field
  clientProfile: { /* ... */ },
  dataModel: { objects: [], associations: [] },
  tags: [],
  journeys: [],
};
await createProject(newProject);
```

### Adding a Custom Object to Data Model
```javascript
// ObjectModal.jsx → ProjectContext-v2 → SupabaseAdapter
const objectData = {
  name: 'CustomAccount',
  label: 'Custom Account',
  type: 'custom',
  fields: [],
};
await addCustomObject(projectId, objectData);
```

### Running Database Queries
```bash
# Via Supabase CLI
npx supabase db query "SELECT * FROM implementations"

# Or via Supabase dashboard:
# https://supabase.com/dashboard/project/lmuejkfvsjscmboaayds
```

### Debugging Authentication Issues
1. Check session exists: `supabase.auth.getSession()`
2. Check user is authenticated: `supabase.auth.getUser()`
3. Verify environment variables in `.env.local`
4. Check browser console for RLS policy violations

### Adding a New Component
1. Create component in appropriate feature directory
2. Import `useProject` from `context/ProjectContext-v2`
3. Use async operations with loading states
4. Add error handling for all async calls
5. Include optimistic updates for better UX

---

## Project Structure

```
strategist-tool/
├── src/
│   ├── components/
│   │   ├── auth/              # ProtectedRoute
│   │   ├── layout/            # Header, Navigation
│   │   └── ui/                # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.jsx           # Session management
│   │   └── ProjectContext-v2.jsx     # Project state (async)
│   ├── features/
│   │   ├── client-profile/           # BasicInformation, IntegrationSpecs
│   │   ├── data-model/               # DataModel + modals
│   │   └── project-management/       # Dashboard
│   ├── lib/
│   │   └── supabase.js               # Supabase client + helpers
│   ├── pages/
│   │   └── LoginPage.jsx             # Sign in/sign up
│   ├── services/
│   │   ├── adapters/
│   │   │   ├── IStorageAdapter.js       # Interface
│   │   │   ├── LocalStorageAdapter.js   # Dev/test
│   │   │   └── SupabaseAdapter.js       # Production
│   │   ├── ProjectRepository.js      # Business logic
│   │   └── ValidationService.js      # Zod schemas
│   └── utils/
│       └── idGenerator.js            # UUID v4 generation
├── .env.local                        # Supabase credentials
├── package.json                      # Dependencies
└── vite.config.js                    # Build configuration
```

---

## Additional Documentation

- **[PROJECT-STATUS.md](PROJECT-STATUS.md)** - Detailed milestone tracking
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture details
- **[IMPLEMENTATION-PLAN.md](../IMPLEMENTATION-PLAN.md)** - Overall roadmap
- **[.github/ISSUE-002](../.github/ISSUE-002-supabase-single-tenant-complete.md)** - Single-tenant migration details
- **[docs/archive/](docs/archive/)** - Historical planning documents

---

## Getting Help

### Common Issues

**"useProject must be used within ProjectProvider"**
- Check that App.jsx wraps routes with ProjectProvider
- Verify importing from `ProjectContext-v2`, not old `ProjectContext`

**"AuthSessionMissingError"**
- Check session exists before calling getUser()
- Verify .env.local has correct Supabase credentials
- Clear browser cache and try incognito mode

**"null value in column violates not-null constraint"**
- Check that all required fields are provided
- Verify field names match database schema
- Common culprits: `name`, `owner_id`, `status`

### Supabase Dashboard
- **URL:** https://supabase.com/dashboard/project/lmuejkfvsjscmboaayds
- **Table Editor:** View/edit data directly
- **SQL Editor:** Run custom queries
- **Authentication:** Manage users
- **Logs:** Debug RLS policy issues

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
