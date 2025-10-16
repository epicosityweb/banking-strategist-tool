# Tag CRUD Supabase Schema Validation Analysis

**Date:** October 15, 2025
**Issue:** #20 - Tag CRUD Stability - Supabase Schema Validation
**Priority:** 🔴 P0 (BLOCKER)

## Executive Summary

Analysis of the tag storage architecture reveals that while the TypeScript interfaces and Zod schemas are comprehensive and well-designed, the **SupabaseAdapter projectSchema uses overly permissive validation** (`z.array(z.any())`  for tags) that doesn't enforce the complex tag structure with qualification rules. This creates a risk of data corruption or loss when tags with nested property rules, activity rules, or other complex structures are persisted.

## Current Architecture

### 1. TypeScript Type System (`src/types/tag.ts`, `src/types/project.ts`)

**Tag Structure:**
```typescript
export interface Tag {
  id: string;
  name: string;
  category: 'origin' | 'behavior' | 'opportunity';
  description: string;
  icon: string;
  color: string; // Hex color #RRGGBB
  behavior: 'set_once' | 'dynamic' | 'evolving';
  isPermanent: boolean;
  qualificationRules: QualificationRules;
  dependencies?: string[]; // Tag IDs
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualificationRules {
  ruleType: 'property' | 'activity' | 'association' | 'score';
  logic: 'AND' | 'OR';
  conditions: RuleCondition[]; // Union of 4 condition types
}
```

**TagCollection Structure** (how tags are stored in projects):
```typescript
export interface TagCollection {
  library: Tag[];  // Pre-built tags from library
  custom: Tag[];   // User-created tags
}
```

### 2. Zod Validation Schemas (`src/schemas/tagSchema.ts`)

**Comprehensive tag validation including:**
- Property rule conditions (15 operators: equals, contains, between, etc.)
- Activity rule conditions (occurrence tracking, timeframe, event filters)
- Association rule conditions (has_any, has_none, count with nested filters)
- Score rule conditions (with hysteresis thresholds)
- Recursive validation for nested filters

**Example:**
```typescript
export const propertyRuleConditionSchema = z.object({
  id: z.string().optional(),
  object: z.string().min(1),
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', ... 15 operators]),
  value: z.any().optional(),
});

export const activityRuleConditionSchema = z.object({
  eventType: z.string().min(1),
  occurrence: z.enum(['has_occurred', 'has_not_occurred', 'count']),
  operator: z.enum([...]).optional(),
  value: z.number().optional(),
  timeframe: z.number().positive().optional(),
  filters: z.array(propertyRuleConditionSchema).optional(), // NESTED!
});
```

### 3. **CRITICAL ISSUE: SupabaseAdapter Schema**

**Location:** `src/services/adapters/SupabaseAdapter.js:20-23`

```javascript
const projectSchema = z.object({
  // ... other fields ...
  tags: z.object({
    library: z.array(z.any()),  // ⚠️ TOO PERMISSIVE!
    custom: z.array(z.any()),   // ⚠️ TOO PERMISSIVE!
  }).optional(),
});
```

**Problem:** `z.any()` accepts ANY value and doesn't validate:
- Tag structure (id, name, category, etc.)
- QualificationRules structure
- Nested conditions (property filters, activity filters)
- Data types (color hex format, enum values)

**Risk:** Invalid tag data could be saved to Supabase JSONB column and cause:
1. Runtime errors when loading projects
2. Data loss if required fields are missing
3. Serialization issues with nested structures
4. Breaking changes if tag structure evolves

### 4. Database Storage

**Table:** `implementations`
**Column:** `data` (JSONB type)

**Structure:**
```json
{
  "clientProfile": {...},
  "dataModel": {...},
  "tags": {
    "library": [
      {
        "id": "uuid-here",
        "name": "High-Value Customer",
        "category": "behavior",
        "qualificationRules": {
          "ruleType": "property",
          "logic": "AND",
          "conditions": [
            {
              "object": "Contact",
              "field": "lifetime_value",
              "operator": "greater_than",
              "value": 10000
            }
          ]
        },
        // ... more fields
      }
    ],
    "custom": []
  },
  "journeys": [...]
}
```

## Data Flow Analysis

### Tag Creation Flow

1. **User creates tag in TagModal** (`src/features/tag-library/components/TagModal.tsx`)
   - Form validation using `createTagFormSchema` ✅
   - UUID generation ✅
   - Initial tag object created

2. **ProjectContext-v2 receives tag** (`src/context/ProjectContext-v2.tsx:822`)
   - Optimistic UI update via `ADD_TAG` action ✅
   - Tag added to state.tags.custom array ✅

3. **ProjectContext calls repository.updateProject()** (line 827)
   - Passes full `updatedTags` object to SupabaseAdapter

4. **SupabaseAdapter.updateProject()** (`SupabaseAdapter.js:302`)
   - **VALIDATION POINT:** `projectSchema.partial().safeParse(updates)` (line 305)
   - ⚠️ **Uses `z.array(z.any())` - NO tag structure validation**
   - Saves to `data.tags` JSONB column (line 332)

5. **Supabase stores JSONB** - PostgreSQL accepts any valid JSON
   - No schema enforcement at database level
   - Invalid tag structures could be stored

### Tag Retrieval Flow

1. **SupabaseAdapter.getAllProjects()** (line 166)
   - Fetches from `implementations` table
   - Extracts `row.data?.tags` (line 187)
   - Returns TagCollection structure

2. **ProjectContext loads tags**
   - Assumes tags conform to Tag interface
   - ⚠️ **No runtime validation** - if invalid data exists, errors occur

## Test Plan

### Phase 1: Schema Validation Testing

#### Test 1.1: Create Tag with Simple Property Rule
```javascript
const testTag = {
  id: generateId(),
  name: "Test Tag - Simple Property",
  category: "behavior",
  description: "Test tag with simple property rule",
  icon: "📊",
  color: "#1D4ED8",
  behavior: "dynamic",
  isPermanent: false,
  isCustom: true,
  qualificationRules: {
    ruleType: "property",
    logic: "AND",
    conditions: [
      {
        object: "Contact",
        field: "email",
        operator: "is_known",
      }
    ]
  },
  dependencies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**Expected:** Tag saves successfully
**Verify:**
- Tag appears in UI
- Page reload shows tag
- Supabase JSONB contains correct structure

#### Test 1.2: Create Tag with Complex Nested Rules
```javascript
const complexTag = {
  // ... basic fields ...
  qualificationRules: {
    ruleType: "activity",
    logic: "AND",
    conditions: [
      {
        eventType: "form_submission",
        occurrence: "count",
        operator: "greater_than",
        value: 3,
        timeframe: 30,
        filters: [ // NESTED property filters
          {
            object: "Form",
            field: "form_id",
            operator: "equals",
            value: "contact-form-2024"
          },
          {
            object: "Form",
            field: "fields.industry",
            operator: "in",
            value: ["Finance", "Healthcare"]
          }
        ]
      }
    ]
  }
};
```

**Expected:** Tag with nested filters saves correctly
**Verify:**
- Nested filters array persists
- No data loss in deep nesting
- Correct deserialization on reload

#### Test 1.3: Create Tag with Invalid Data
```javascript
const invalidTag = {
  id: generateId(),
  name: "I", // TOO SHORT (min 2 chars)
  category: "invalid_category", // INVALID ENUM
  description: "Too short", // TOO SHORT (min 10 chars)
  color: "blue", // INVALID (not hex)
  // ... missing required fields
};
```

**Expected:** Validation catches this at form level
**But what if bypassed?** SupabaseAdapter should reject it

### Phase 2: Round-Trip Persistence Testing

#### Test 2.1: Save and Reload Tag
1. Create tag via UI
2. Note tag data structure
3. Reload page (hard refresh)
4. Compare loaded tag with original
5. **Verify:** All 14 tag fields match, including nested qualificationRules

#### Test 2.2: Edit Tag and Verify Changes
1. Create tag with 2 conditions
2. Edit tag: add 3rd condition
3. Save
4. Reload page
5. **Verify:** All 3 conditions persist

#### Test 2.3: Delete Tag and Verify Removal
1. Create tag
2. Confirm persisted (reload)
3. Delete tag
4. Reload page
5. **Verify:** Tag removed from both UI and Supabase

### Phase 3: Data Integrity Testing

#### Test 3.1: Inspect Supabase JSONB Structure
```sql
SELECT
  id,
  name,
  data->'tags'->'custom' as custom_tags,
  data->'tags'->'library' as library_tags
FROM implementations
WHERE id = '<project_id>';
```

**Verify:**
- Tags stored as proper JSON arrays
- Nested objects preserved
- No data corruption

#### Test 3.2: Complex Tag Serialization
Create tag with:
- 5 property conditions (AND logic)
- Nested filters on 2 conditions
- Dependencies array with 2 tag IDs

**Verify:**
- All conditions save
- Dependencies array intact
- Logic field preserved

## Findings

### ✅ What Works Well

1. **TypeScript Type System** - Comprehensive and well-designed
2. **Zod Validation Schemas** - Detailed tag validation with all rule types
3. **ProjectContext State Management** - Optimistic updates with rollback
4. **Tag CRUD Operations** - ADD_TAG, UPDATE_TAG, DELETE_TAG actions work correctly
5. **JSONB Storage** - PostgreSQL handles complex nested structures

### ⚠️ Critical Issues

1. **Supabase Adapter Schema Validation** - Uses `z.any()` instead of `tagSchema`
   - **Location:** `SupabaseAdapter.js:20-23`
   - **Impact:** P0 - Could allow invalid data to be saved
   - **Fix Required:** Import and use `tagSchema` from `src/schemas/tagSchema`

2. **No Runtime Validation on Load** - Tags loaded from Supabase are not validated
   - **Impact:** P1 - Invalid data could cause runtime errors
   - **Fix Required:** Add validation in `getAllProjects()` or ProjectContext

3. **Date Serialization** - Dates stored as strings in JSONB
   - `createdAt` and `updatedAt` are Date objects in TypeScript but strings in storage
   - **Impact:** P2 - Type mismatch but not breaking
   - **Fix Required:** Update schema to use `z.string().datetime()` or transform

## Recommended Fixes

### Fix #1: Update SupabaseAdapter Schema (CRITICAL)

**File:** `src/services/adapters/SupabaseAdapter.js`

```javascript
import { tagSchema } from '../../schemas/tagSchema';

const projectSchema = z.object({
  // ... other fields ...
  tags: z.object({
    library: z.array(tagSchema),  // ✅ Full validation
    custom: z.array(tagSchema),   // ✅ Full validation
  }).optional(),
});
```

**Why:** This ensures invalid tag data is rejected before being saved to Supabase

### Fix #2: Add Runtime Validation on Load (RECOMMENDED)

**File:** `src/services/adapters/SupabaseAdapter.js`

```javascript
async getAllProjects() {
  // ... existing code ...

  // Transform Supabase format to app format
  const projects = data.map((row) => {
    // Validate tags before returning
    const tags = row.data?.tags || { library: [], custom: [] };

    // Validate each tag (optional - could log warnings instead of failing)
    const validatedTags = {
      library: tags.library?.filter(tag => {
        const result = tagSchema.safeParse(tag);
        if (!result.success) {
          console.warn(`Invalid library tag ${tag.id}:`, result.error);
          return false;
        }
        return true;
      }) || [],
      custom: tags.custom?.filter(tag => {
        const result = tagSchema.safeParse(tag);
        if (!result.success) {
          console.warn(`Invalid custom tag ${tag.id}:`, result.error);
          return false;
        }
        return true;
      }) || [],
    };

    return {
      id: row.id,
      name: row.name,
      tags: validatedTags,
      // ... rest of fields
    };
  });
}
```

### Fix #3: Date Handling (OPTIONAL)

**Option A:** Transform dates on save/load
**Option B:** Update schema to accept string dates
**Option C:** Keep current behavior (dates as ISO strings)

**Recommendation:** Option C (current behavior is fine - dates work as ISO strings)

## Next Steps

1. ✅ Complete schema analysis (this document)
2. ⏭️ Run automated tests with Chrome DevTools MCP
3. ⏭️ Implement Fix #1 (SupabaseAdapter schema)
4. ⏭️ Test fix with complex tags
5. ⏭️ Implement Fix #2 (runtime validation) if needed
6. ⏭️ Document final schema structure
7. ⏭️ Create PR with fixes

## Acceptance Criteria

- [ ] SupabaseAdapter uses `tagSchema` for validation
- [ ] Can create tags with property rules (100% success)
- [ ] Can create tags with activity rules + nested filters
- [ ] Can create tags with association rules
- [ ] Can create tags with score rules
- [ ] Tags persist after page reload (all fields intact)
- [ ] Can edit tags and changes persist
- [ ] Can delete tags and removal persists
- [ ] No data loss with complex nested structures
- [ ] No console errors during CRUD operations
- [ ] Invalid tag data is rejected (not silently accepted)

## Conclusion

The tag architecture is well-designed with comprehensive TypeScript types and Zod validation schemas. However, the **SupabaseAdapter uses `z.any()` instead of enforcing the tag schema**, creating a critical data integrity risk. This should be fixed by importing and using `tagSchema` from the tag validation schemas.

The fix is straightforward (1-2 lines of code) but critical for ensuring data integrity when tags with complex qualification rules are persisted to Supabase.
