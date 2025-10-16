# Interactive Strategist Tool - Development Guide

**Last Updated:** October 16, 2025
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

### Worktree Lifecycle Management

**IMPORTANT:** This project uses git worktrees for feature development and code reviews. You will receive automatic worktree status updates on session start via the `check-worktree-status.sh` hook.

**Worktree States:**

**🟢 ACTIVE** - Keep these worktrees:
- PR is open and under review
- Commits ahead of main, PR not yet created
- Recent activity (< 7 days since last commit)
- **Recommendation:** Continue working

**🟡 STALE** - Clean up these worktrees:
- PR merged to main
- Branch merged to main
- Work is complete
- **Recommendation:** Remove worktree, delete local/remote branches

**🔴 ORPHANED** - Priority cleanup:
- Remote branch deleted
- 14+ days since last commit
- No PR or PR closed without merge
- **Recommendation:** Investigate then remove

**When you see stale worktrees:**
1. Verify PR is indeed merged (check GitHub)
2. Confirm no uncommitted work: `cd .worktrees/[name] && git status`
3. Remove worktree: `git worktree remove .worktrees/[name]`
4. Delete local branch: `git branch -d [branch-name]`
5. Delete remote branch (if exists): `git push origin --delete [branch-name]`

**After Completing Feature Work:**
When you create a PR and it gets merged, remind the user:
```
✅ PR #[number] merged successfully!

Worktree cleanup recommended:
- Remove worktree: git worktree remove .worktrees/[name]
- Delete local branch: git branch -d [branch-name]
- Delete remote branch: git push origin --delete [branch-name]

The worktree status hook will flag this automatically on next session.
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

### GitHub Integration

**Status:** ✅ **Fully Working** (Fixed October 16, 2025)

This project now has **two working methods** for GitHub integration:

#### Method 1: GitHub MCP (Recommended for AI Agents)

**Configuration:** Official Docker-based GitHub MCP server (as of October 16, 2025)

**MCP Tools Available:**
```javascript
// All GitHub MCP tools now work with this private repository:
mcp__github__get_file_contents()        // ✅ Read files from repo
mcp__github__list_commits()             // ✅ View commit history
mcp__github__create_issue()             // ✅ Create issues
mcp__github__create_pull_request()      // ✅ Create PRs
mcp__github__search_repositories()      // ✅ Search GitHub
mcp__github__list_pull_requests()       // ✅ List PRs
// ... and all other GitHub MCP tools
```

**Example Usage:**
```javascript
// Read a file from the repository
mcp__github__get_file_contents({
  owner: "epicosityweb",
  repo: "banking-orchestration-framework-explainer",
  path: "strategist-tool/src/App.jsx"
})

// Create an issue
mcp__github__create_issue({
  owner: "epicosityweb",
  repo: "banking-orchestration-framework-explainer",
  title: "[strategist-tool] Add new feature",
  body: "Detailed description..."
})
```

**What Was Fixed:**
- **October 16, 2025:** Migrated from deprecated `@modelcontextprotocol/server-github` to official `ghcr.io/github/github-mcp-server`
- Old version had known bug preventing access to private Enterprise Internal repositories
- New Docker-based version works perfectly with private repos

#### Method 2: GitHub CLI (`gh`) (Alternative)

The `gh` CLI is also available as a reliable alternative:

```bash
# Create an issue
cd "/Users/Kchris/Documents/Epicosity/Banking Journey Orchestration Framework"
gh issue create \
  --title "[strategist-tool] Issue Title" \
  --body-file /path/to/issue-content.md

# Create a pull request
gh pr create \
  --base main \
  --head feature-branch \
  --title "PR Title" \
  --body "PR description"

# List issues
gh issue list --state open

# View PR status
gh pr status
```

**When to Use Each Method:**

**Use GitHub MCP when:**
- AI agents need programmatic access to repository data
- Automating issue/PR creation from code reviews
- Reading files or searching code during implementation
- Working within Claude Code workflow commands

**Use GitHub CLI when:**
- Quick manual operations from terminal
- Debugging or verifying MCP operations
- User prefers command-line interface
- Need to test authentication/permissions

**Authentication Requirements:**
- Token must have scopes: `repo`, `read:enterprise`, `read:org`, `workflow`
- User must be added as collaborator to repository
- For Enterprise Internal repos, org membership alone is not sufficient

---

## Current Status

📊 **For detailed milestone tracking, see:** [PROJECT-STATUS.md](PROJECT-STATUS.md)

### Current Workflow Phase

**Workflow Cycle Position:** PLAN → DELEGATE → ASSESS → **CODIFY**

**Just Completed:**
- ✅ PR #30: Silent Data Loss Prevention (MERGED October 16, 2025)
  - Issue #29 (P0 blocker): Auto-save amplification data loss PREVENTED
  - Phase 1: Auto-save blocking when corrupt data detected
  - Phase 2: CorruptDataBanner UI component for user notification
  - Manual testing verified via Chrome DevTools MCP
  - Zero breaking changes, safe to deploy immediately
- ✅ PR #28: Security hardening & test coverage (MERGED October 16, 2025)
  - Security hardening (Issue #032): Environment-specific logging, GDPR/CCPA compliant
  - Dependency injection (Issue #033): ErrorTrackingService with testable architecture
  - Test coverage (Issue #034): 24/24 tests passing, ~95% coverage
- ✅ Comprehensive multi-agent code review (8 specialized agents)
- ✅ Live testing in dev environment (all functional, zero console errors)

**Current Work:**
- 📊 Epic 4 continuation ready: Phase 4 - Property Rule Builder (40 hours estimated)

**Next Steps:**
1. Continue Epic 4: Implement Phase 4 (Property Rule Builder) after Priority 0 blockers cleared
2. Phase 3 of Issue #29 (database quarantine + recovery UI) deferred to future enhancement
3. Consider adding unit tests for CorruptDataBanner component (low urgency)

**Key Achievement:** Compounding Workflow demonstrated end-to-end success across 2 complete PRs (PR #28 + PR #30)

---

### Epic Progress

**Epic 4: Tag Library & Journey Designer** - 🏗️ IN PROGRESS (48% Complete)
- ✅ Phase 1: Foundation & Data Model (18 hours)
- ✅ Phase 2: Tag Library Browser (22 hours)
- ✅ Phase 3: Tag Management (30 hours)
- ✅ TypeScript Migration (complete, 0 errors)
- ✅ PR #28: Validation & Security Hardening (MERGED October 16, 2025)
- ✅ PR #30: Data Loss Prevention (MERGED October 16, 2025)
- 📋 Phase 4: Property Rule Builder (40 hours) - **NEXT UP**
- 📋 Phase 5: Activity, Association & Score Rules (39 hours)
- 📋 Phase 6: Rule Testing & Visualization (30 hours)
- 📋 Phase 7: Journey Designer (25 hours)

**What's Complete:**
- ✅ Core React application (10+ components)
- ✅ Service layer architecture (adapter pattern + error tracking)
- ✅ Supabase authentication system
- ✅ Single-tenant database schema
- ✅ All CRUD operations working
- ✅ Auto-save functionality with corruption protection
- ✅ Tag library with 30 pre-built banking tags
- ✅ Tag CRUD with validation and dependency checking
- ✅ TypeScript migration (5 components, 940-line context)
- ✅ Security hardening (environment-specific logging, sanitized Sentry)
- ✅ Comprehensive test coverage (24/24 tests passing)
- ✅ Data loss prevention (auto-save blocking + user notification)
- ✅ CorruptDataBanner UI component

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

## Worktree Management

This project uses git worktrees for isolated development and code reviews. Worktrees are automatically tracked and managed via Claude Hooks.

### Current Worktrees

**Status tracked via SessionStart hook** - Automatically loaded on conversation start

**Worktree Directory Structure:**
```
.worktrees/
├── reviews/                  # Code review worktrees
│   └── pr-[number]/         # Isolated PR review environments
└── [feature-branch-name]/   # Feature development worktrees
```

### Creating Worktrees

**For Feature Development:**
```bash
# Manual creation
git worktree add -b feature-name .worktrees/feature-name

# ⚠️ IMPORTANT: Copy environment variables immediately!
cp strategist-tool/.env.local .worktrees/feature-name/strategist-tool/.env.local

# Via workflow command (recommended)
/workflows/work https://github.com/org/repo/issues/[number]
# Creates worktree automatically
# ⚠️ Still requires manual .env.local copy (see Environment Variables section below)
```

**For Code Reviews:**
```bash
# Via workflow command (recommended)
/workflows/review [PR-number]
# Creates review worktree automatically
# ⚠️ Still requires manual .env.local copy (see Environment Variables section below)
```

### Worktree Lifecycle

```
Creation → Active Development → PR Merged → STALE → Cleanup
    ↓                                           ↓
    └─────────── Hook Detection ───────────────┘
```

**1. Creation (ACTIVE):**
- Worktree created via workflow command or manually
- Branch ahead of main with unmerged commits
- PR open or not yet created
- Hook shows: 🟢 ACTIVE - Keep for ongoing work

**2. Completion (STALE):**
- PR merged to main
- Branch merged to main
- Hook shows: 🟡 STALE - Ready for cleanup
- **Action needed:** Remove worktree

**3. Cleanup:**
```bash
# Recommended cleanup sequence
git worktree remove .worktrees/[name]
git branch -d [branch-name]
git push origin --delete [branch-name]
```

### Automatic Detection

The `check-worktree-status.sh` hook runs on every session start and provides:
- ✅ Real-time worktree status
- ✅ PR merge detection via GitHub CLI
- ✅ Staleness calculation (days since last commit)
- ✅ Specific cleanup commands for each worktree
- ✅ Categorization (ACTIVE/STALE/ORPHANED)

**What gets checked:**
- Branch merge status: `git branch --merged main`
- PR status: `gh pr list --state all`
- Last commit date: `git log -1 --format=%ct`
- Remote branch existence: `git ls-remote --heads origin`

### Environment Variables in Worktrees

**IMPORTANT:** When creating a new worktree, environment variables are NOT automatically copied. You must manually copy the `.env.local` file to the worktree.

**Symptom:**
- Dev server fails to start or loads without Supabase connection
- Authentication errors: "Supabase client configuration missing"
- Console errors: `VITE_SUPABASE_URL is not defined`
- Blank login page or missing data

**Root Cause:**
Git worktrees share the Git repository but have separate working directories. The `.env.local` file (which is gitignored) is not tracked by Git and therefore not present in the worktree.

**Immediate Fix:**
```bash
# After creating a worktree, copy environment variables
cp strategist-tool/.env.local .worktrees/[worktree-name]/strategist-tool/.env.local

# Example:
cp strategist-tool/.env.local .worktrees/issue-29-data-loss-prevention/strategist-tool/.env.local
```

**Automated Solution (Recommended):**
Add to your worktree creation workflow:

```bash
# Create worktree
git worktree add -b feature-name .worktrees/feature-name

# Copy environment variables automatically
if [ -f "strategist-tool/.env.local" ]; then
  cp strategist-tool/.env.local .worktrees/feature-name/strategist-tool/.env.local
  echo "✅ Copied .env.local to worktree"
else
  echo "⚠️  WARNING: strategist-tool/.env.local not found!"
fi
```

**Verification:**
```bash
# Check that .env.local exists in worktree
ls -la .worktrees/[worktree-name]/strategist-tool/.env.local

# Verify variables are loaded
cd .worktrees/[worktree-name]/strategist-tool
npm run dev
# Check console for "Connected to Supabase" message or successful data loading
```

**Best Practice Checklist:**
- [ ] Create worktree
- [ ] Copy `.env.local` to worktree immediately
- [ ] Verify `.env.local` exists in worktree's strategist-tool directory
- [ ] Start dev server and verify Supabase connection
- [ ] Check browser console for successful authentication

**Why This Happens:**
1. `.env.local` is listed in `.gitignore` (correct for security)
2. Git worktrees only contain Git-tracked files
3. Environment files must be manually replicated per worktree
4. Each worktree has its own `node_modules` and `.env.local`

### Best Practices

**✅ DO:**
- Use worktrees for all feature development (keeps main clean)
- Use worktrees for all code reviews (no context switching)
- Clean up worktrees after PR merge
- Check worktree status at session start

**❌ DON'T:**
- Develop features directly in main directory
- Leave stale worktrees after PR merge
- Create worktrees without clear purpose
- Forget to delete remote branches after cleanup

### Troubleshooting

**Worktree removal fails:**
```bash
# If worktree has uncommitted changes
cd .worktrees/[name]
git status  # Check what's uncommitted
git stash   # Save changes if needed

# Remove worktree (force if necessary)
git worktree remove .worktrees/[name] --force
```

**Branch deletion fails:**
```bash
# Local branch not merged
git branch -D [branch]  # Force delete

# Remote branch protection
gh api repos/:owner/:repo/branches/[branch]/protection --method DELETE
```

**See Also:**
- [docs/compounding-engineering-workflow.md](../docs/compounding-engineering-workflow.md#worktree-lifecycle-and-cleanup) - Worktree philosophy
- [.claude/hooks/README.md](../.claude/hooks/README.md) - Hook implementation details

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

### PR #30: Issue #29 Resolved (October 16, 2025)

**Workflow Cycle Demonstrated (PLAN → DELEGATE → ASSESS → CODIFY):**

**PLAN:**
- Issue identified during PR #28 code review (8-agent comprehensive review)
- P0 blocker: Auto-save amplification causing permanent data loss
- Problem: Corrupt tags filtered → auto-save → database permanently loses data
- Created GitHub Issue #29 with detailed specification

**DELEGATE:**
- Used compounding-engineering:work workflow via `/workflows/work`
- Created worktree: `issue-29-silent-data-loss-prevention`
- Implemented Phase 1: Auto-save blocking (2 hours)
  - Modified [ProjectContext-v2.tsx](strategist-tool/src/context/ProjectContext-v2.tsx:366-369) - Check `hasCorruptData` flag before creating interval
  - Updated [types/project.ts](strategist-tool/src/types/project.ts:30) - Added `CorruptDataWarning` interface
- Implemented Phase 2: User notification (3 hours)
  - Created [CorruptDataBanner.tsx](strategist-tool/src/components/ui/CorruptDataBanner.tsx:1) - 123 lines, critical warning UI
  - Modified [SupabaseAdapter.js](strategist-tool/src/services/adapters/SupabaseAdapter.js:196-207) - Emit `data-corruption-detected` events
  - Integrated banner into [App.jsx](strategist-tool/src/App.jsx:14)

**ASSESS (Manual Testing via Chrome DevTools MCP):**
- ✅ Clean data scenario: No banner displays (correct behavior)
- ✅ Corrupt data scenario: Banner appears immediately
- ✅ Auto-save blocking: Console shows `[Data Integrity] Auto-save disabled: Project contains N corrupt data issue(s)`
- ✅ View Details button: Displays corruption information in alert
- ✅ All UI elements styled correctly
- Zero console errors

**CODIFY:**
- Created PR #30 with comprehensive commit message
- TypeScript compilation: 0 errors
- Build successful
- All acceptance criteria met
- PR #30 merged to main (October 16, 2025)
- Issue #29 closed as completed

**Files Modified:**
- [types/project.ts](strategist-tool/src/types/project.ts) (+30 lines)
- [ProjectContext-v2.tsx](strategist-tool/src/context/ProjectContext-v2.tsx) (+50 lines)
- [SupabaseAdapter.js](strategist-tool/src/services/adapters/SupabaseAdapter.js) (+63 lines)
- [CorruptDataBanner.tsx](strategist-tool/src/components/ui/CorruptDataBanner.tsx) (+123 lines, NEW)
- [App.jsx](strategist-tool/src/App.jsx) (+2 lines)

**Compounding Effect:**
1. **Event-Driven Architecture Pattern** - CustomEvent pattern now documented for inter-component communication
2. **Chrome DevTools MCP Testing** - Automated manual testing workflow established
3. **Data Integrity Patterns** - Auto-save safety checks now template for future features
4. **Critical Banner UI** - Reusable component for future critical warnings
5. **Corruption Detection** - Event emission pattern reusable for objects, fields, etc.

**Metrics:**
- **Time Investment:** ~7 hours total (2h Phase 1 + 3h Phase 2 + 2h testing/merge)
- **Code Changes:** +268 additions, 0 deletions (purely additive)
- **Breaking Changes:** Zero (safe to deploy immediately)
- **Data Loss Risk:** ELIMINATED (P0 blocker resolved)
- **User Awareness:** ACHIEVED (critical banner + console warnings)

**Result:** Phase 3 (database quarantine + recovery UI) deferred to future enhancement. Current implementation solves the critical P0 blocker.

**Next Up:** Epic 4 Phase 4 - Property Rule Builder (40 hours estimated)

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

### October 16, 2025: Chrome DevTools MCP for Manual Testing

**Context:** After implementing Issue #29 (data loss prevention), needed to verify the implementation worked correctly with real user interactions.

**Solution:** Used Chrome DevTools MCP server to automate manual testing:

**What Worked:**
1. **Automated Login Testing:** Successfully authenticated using `evaluate_script` to inject test credentials
2. **Navigation Testing:** Used `click` and `wait_for` to navigate through the app
3. **Event Simulation:** Triggered synthetic `data-corruption-detected` events to test UI behavior
4. **Visual Verification:** Captured screenshots at each step to verify UI states
5. **Console Inspection:** Used `list_console_messages` to verify auto-save blocking warnings

**Testing Pattern:**
```javascript
// 1. Navigate to app
mcp__chrome-devtools__navigate_page({ url: 'http://localhost:5175' })

// 2. Take snapshot to get element UIDs
mcp__chrome-devtools__take_snapshot()

// 3. Simulate corruption event
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    window.dispatchEvent(
      new CustomEvent('data-corruption-detected', {
        detail: { type: 'corrupt_tags', count: 3, ... }
      })
    );
    return { success: true };
  }`
})

// 4. Verify UI response
mcp__chrome-devtools__take_screenshot()
mcp__chrome-devtools__list_console_messages()
```

**Key Benefits:**
- **Faster than manual testing:** No human clicking required
- **Repeatable:** Same test sequence every time
- **Evidence capture:** Screenshots + console logs for documentation
- **Real browser environment:** Tests actual DOM interactions, not mocked

**Lesson:** Chrome DevTools MCP is ideal for integration testing React components that rely on browser APIs (events, localStorage, Supabase). It bridges the gap between unit tests and full manual QA.

**When to Use:**
- Testing complex user flows (login → navigate → trigger event)
- Verifying UI responses to system events
- Capturing visual evidence for PR documentation
- Testing browser-specific APIs (CustomEvents, localStorage)

**Issue Reference:** Issue #29 manual testing - October 16, 2025

---

### October 16, 2025: GitHub MCP Configuration - Per-Project Settings

**Context:** GitHub MCP was returning 404 errors when attempting to access the private repository `epicosityweb/banking-orchestration-framework-explainer`, despite the GitHub CLI (`gh`) working perfectly with the same credentials.

**Root Cause Discovery:**

The issue was NOT with the global Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`). The root cause was **per-project MCP configuration** stored in `~/.claude.json`.

**Key Finding:** Claude Code (VS Code extension) maintains separate MCP server configurations for each project, stored in the `projects` object within `~/.claude.json`. These project-specific configs override global settings.

**The Problem:**
```json
// ~/.claude.json (per-project config)
{
  "projects": {
    "/Users/Kchris/Documents/Epicosity/Banking Journey Orchestration Framework": {
      "mcpServers": {
        "github": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-github"],
          // ❌ OLD deprecated version with known private repo bug
        }
      }
    }
  }
}
```

**Diagnostic Process:**

1. **Process Investigation:** Ran `ps aux | grep github` and found old deprecated `@modelcontextprotocol/server-github` processes running alongside Docker processes
2. **Parent Process Analysis:** Traced parent PID to Claude Code extension binary at `/Users/Kchris/.cursor/extensions/anthropic.claude-code-*`
3. **Configuration Hunt:** Searched for MCP config files, discovered `~/.claude.json` (7MB file with project-specific configs)
4. **Config Inspection:** Found project using old deprecated GitHub MCP despite global config being correct

**The Solution:**
```json
// Updated ~/.claude.json (per-project config)
{
  "projects": {
    "/Users/Kchris/Documents/Epicosity/Banking Journey Orchestration Framework": {
      "mcpServers": {
        "github": {
          "type": "stdio",
          "command": "docker",
          "args": [
            "run", "-i", "--rm", "-e",
            "GITHUB_PERSONAL_ACCESS_TOKEN",
            "ghcr.io/github/github-mcp-server"
          ],
          "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
          }
          // ✅ NEW official Docker-based GitHub MCP
        }
      }
    }
  }
}
```

**Cleanup Steps Performed:**
1. Killed all old deprecated GitHub MCP processes (3 instances)
2. Killed competing Docker GitHub MCP processes (2 instances)
3. Removed npx cache directory `/Users/Kchris/.npm/_npx/3dfbf5a9eea4a1b3/`
4. Killed all GitHub MCP Docker containers
5. Updated per-project config in `~/.claude.json` via Python script
6. Restarted Cursor/Claude Code

**Results:**
✅ **COMPLETE SUCCESS** - All GitHub MCP tools now work with private repositories:
- `mcp__github__get_file_contents()` - Successfully listed repository files
- `mcp__github__list_commits()` - Can view commit history
- `mcp__github__create_issue()` - Can create issues
- All other GitHub MCP tools functional

**Lessons Learned:**

1. **Check per-project configs first** - When debugging MCP issues in Claude Code, check `~/.claude.json` for project-specific overrides before assuming global config is the source
2. **Process lineage reveals config source** - Using `ps` with parent PID tracing (`ps -p <pid> -o ppid=`) can reveal which config file spawned a process
3. **Multiple config layers exist** - Claude Code has at least 3 config layers:
   - Global: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Per-project: `~/.claude.json` (projects object)
   - Cursor-specific: `~/.cursor/mcp.json`
4. **Old MCP versions have known bugs** - The deprecated `@modelcontextprotocol/server-github` has a known bug preventing access to private Enterprise Internal repositories
5. **Docker-based MCP is production-ready** - The official `ghcr.io/github/github-mcp-server` works perfectly with private repos

**Configuration Files to Check (in order):**
```bash
# 1. Per-project config (MOST LIKELY SOURCE)
~/.claude.json

# 2. Global Claude Desktop config
~/Library/Application Support/Claude/claude_desktop_config.json

# 3. Cursor/Cline config (if using those editors)
~/.cursor/mcp.json
```

**Diagnostic Commands:**
```bash
# Find which GitHub MCP processes are running
ps aux | grep -E "(github|docker.*github-mcp)" | grep -v grep

# Trace process parent to find config source
ps -p <PID> -o ppid= | xargs ps -p

# Check per-project MCP config
grep -B 5 -A 50 '"$(pwd)"' ~/.claude.json | grep -A 30 mcpServers

# Verify Docker-based MCP is running
docker ps | grep github-mcp-server
```

**Red Flags That Indicate Per-Project Config Issue:**
- ❌ Global config is correct but MCP still fails
- ❌ Old deprecated processes spawn after restart despite config changes
- ❌ `npx` processes running when config specifies Docker
- ❌ Multiple competing MCP implementations running simultaneously

**Takeaways:**
- **ALWAYS check `~/.claude.json` for per-project overrides** when debugging Claude Code MCP issues
- Use process investigation (ps + parent PID) to trace config source
- Keep npx cache clean when switching MCP versions
- Official Docker-based GitHub MCP is the recommended approach for private repositories
- Document project-specific MCP configs in CLAUDE.md for future maintainers

**Issue Reference:** GitHub MCP 404 errors with private Enterprise Internal repositories - Fixed October 16, 2025

---

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
