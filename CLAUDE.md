# Interactive Strategist Tool - Development Guide

**Last Updated:** October 14, 2025
**Status:** ✅ Production Ready - Single-tenant Supabase architecture complete
**Primary Maintainer:** Epicosity Team

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

**What's Complete:**
- ✅ Core React application (9 components)
- ✅ Service layer architecture (adapter pattern)
- ✅ Supabase authentication system
- ✅ Single-tenant database schema
- ✅ All CRUD operations working
- ✅ Auto-save functionality (30-second debounce)

**Currently Working On:**
- Nothing - awaiting next feature epic

**Next Milestone:**
- Epic 4: Tag Library & Journey Designer

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
