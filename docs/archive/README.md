# Documentation Archive

**Last Updated:** October 14, 2025

This directory contains historical planning documents that are no longer actively maintained but preserved for reference.

---

## Why These Documents Were Archived

As of October 14, 2025, we consolidated our documentation structure to follow the Compounding Engineering pattern from [banking-journey-framework/CLAUDE.md](../../../banking-journey-framework/CLAUDE.md).

**Problems with Old Structure:**
1. **Redundancy:** Three documents (SUPABASE-MIGRATION-PLAN.md, SERVICE-LAYER-IMPLEMENTATION.md, and parts of IMPLEMENTATION-PLAN.md) all described the same work from different angles
2. **Confusion:** Unclear which document was the source of truth
3. **Maintenance Burden:** Updates needed in multiple places
4. **No Clear Entry Point:** New AI conversations didn't know where to start

**New Structure (October 14, 2025):**
- **[CLAUDE.md](../../CLAUDE.md)** - Primary entry point for all AI conversations
- **[PROJECT-STATUS.md](../../PROJECT-STATUS.md)** - Single source of truth for milestone tracking
- **[ARCHITECTURE.md](../../ARCHITECTURE.md)** - Technical architecture details
- **[IMPLEMENTATION-PLAN.md](../../../IMPLEMENTATION-PLAN.md)** - High-level roadmap (still active)
- **[.github/ISSUE-002](../../../.github/ISSUE-002-supabase-single-tenant-complete.md)** - Historical record of single-tenant migration

---

## Archived Documents

### supabase-migration-phases.md
**Original:** `strategist-tool/SUPABASE-MIGRATION-PLAN.md`
**Date Archived:** October 14, 2025
**Why Archived:** Detailed phase-by-phase migration plan that became obsolete when we pivoted to single-tenant architecture. Most sections (5-11) documented an incremental approach that was never completed.

**What to Use Instead:**
- For current status → [PROJECT-STATUS.md](../../PROJECT-STATUS.md)
- For architecture details → [ARCHITECTURE.md](../../ARCHITECTURE.md)
- For historical context → [ISSUE-002](../../../.github/ISSUE-002-supabase-single-tenant-complete.md)

**Still Useful For:**
- Understanding the original multi-tenant migration plan
- Learning why we pivoted to single-tenant
- Seeing the evolution of our architecture decisions

### service-layer-build.md
**Original:** `strategist-tool/SERVICE-LAYER-IMPLEMENTATION.md`
**Date Archived:** October 14, 2025
**Why Archived:** Implementation summary that duplicated information now consolidated in ARCHITECTURE.md and PROJECT-STATUS.md.

**What to Use Instead:**
- For service layer architecture → [ARCHITECTURE.md](../../ARCHITECTURE.md#service-layer-design)
- For implementation status → [PROJECT-STATUS.md](../../PROJECT-STATUS.md)
- For adapter pattern details → [ARCHITECTURE.md](../../ARCHITECTURE.md#adapter-pattern-architecture)

**Still Useful For:**
- Understanding the service layer build process
- Seeing test coverage evolution
- Learning about adapter pattern implementation

---

## When to Reference These Documents

**Use archived docs when:**
- Researching why certain architectural decisions were made
- Understanding the evolution of the codebase
- Learning from past approaches (both successful and abandoned)
- Comparing planned vs actual implementation

**Don't use archived docs for:**
- Current implementation status (use PROJECT-STATUS.md)
- Architecture reference (use ARCHITECTURE.md)
- Getting started (use CLAUDE.md)
- Daily development (use CLAUDE.md → Common Tasks)

---

## Document Versions

| Document | Original Date | Archive Date | Final Status |
|----------|--------------|--------------|--------------|
| SUPABASE-MIGRATION-PLAN.md | January 2025 | October 14, 2025 | Phase 5 Complete (single-tenant) |
| SERVICE-LAYER-IMPLEMENTATION.md | January 2025 | October 14, 2025 | Production Ready |

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
