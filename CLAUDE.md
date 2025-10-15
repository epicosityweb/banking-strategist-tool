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

### Epic Progress

**Epic 4: Tag Library & Journey Designer** - 🏗️ IN PROGRESS (45% Complete)
- ✅ Phase 1: Foundation & Data Model (18 hours)
- ✅ Phase 2: Tag Library Browser (22 hours)
- ✅ Phase 3: Tag Management (30 hours)
- ✅ TypeScript Migration (complete, 0 errors)
- 📋 Phase 4: Property Rule Builder (40 hours) - **READY TO START**
- 📋 Phase 5: Activity, Association & Score Rules (39 hours)
- 📋 Phase 6: Rule Testing & Visualization (30 hours)
- 📋 Phase 7: Journey Designer (25 hours)

**Workflow Phase:** ASSESS → **CODIFY** (TypeScript migration reviewed and merged)

**What's Complete:**
- ✅ Core React application (9+ components)
- ✅ Service layer architecture (adapter pattern)
- ✅ Supabase authentication system
- ✅ Single-tenant database schema
- ✅ All CRUD operations working
- ✅ Auto-save functionality (30-second debounce)
- ✅ Tag library with 30 pre-built banking tags
- ✅ Tag CRUD with validation and dependency checking
- ✅ TypeScript migration (5 components, 940-line context)
- ✅ Code review system (B+ rating, 85/100)

**Currently Working On:**
- Ready to begin Phase 4: Property Rule Builder

**Next Milestone:**
- Phase 4: Property Rule Builder (visual rule builder with operator selection)

**Recommended Next Step:**
Start Phase 4 implementation. The planning is complete in GitHub Issue #3,
so you can use `/workflows/work` to begin systematic implementation.

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

## Recent Work

📋 **For complete implementation details, see:** [.github/ISSUE-002-supabase-single-tenant-complete.md](../.github/ISSUE-002-supabase-single-tenant-complete.md)

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
