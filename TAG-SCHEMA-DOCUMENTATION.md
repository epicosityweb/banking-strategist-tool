# Tag Schema Documentation

**Last Updated:** October 15, 2025
**Issue:** #20 - Tag CRUD Supabase Schema Validation

## Overview

This document provides comprehensive documentation of the tag schema structure used throughout the Banking Journey Orchestration Framework's Strategist Tool. Tags are a fundamental component of journey orchestration, enabling intelligent member qualification based on properties, activities, associations, and scores.

## Tag Structure

### TypeScript Interface

**Location:** `src/types/tag.ts`

```typescript
export interface Tag {
  id: string;                     // Unique identifier (UUID)
  name: string;                   // 2-100 characters, must match TAG_NAME_PATTERN
  category: TagCategory;          // 'origin' | 'behavior' | 'opportunity'
  description: string;            // 10-500 characters
  icon: string;                   // Emoji or icon identifier
  color: string;                  // Hex color code #RRGGBB
  behavior: TagBehavior;          // 'set_once' | 'dynamic' | 'evolving'
  isPermanent: boolean;           // If true, tag cannot be removed once assigned
  qualificationRules: QualificationRules;  // Complex nested structure
  dependencies?: string[];        // Array of tag IDs this tag depends on
  isCustom: boolean;              // true = user-created, false = library tag
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last modification timestamp
}
```

### Tag Categories

```typescript
export type TagCategory = 'origin' | 'behavior' | 'opportunity';
```

- **origin**: Tags describing how a contact entered the system (e.g., "Webinar Attendee", "Referral")
- **behavior**: Tags based on user actions and engagement (e.g., "High Engagement", "Inactive")
- **opportunity**: Tags indicating sales potential (e.g., "Ready to Buy", "Upsell Candidate")

### Tag Behaviors

```typescript
export type TagBehavior = 'set_once' | 'dynamic' | 'evolving';
```

- **set_once**: Assigned once and never removed (e.g., "First Purchase")
- **dynamic**: Can be added and removed based on current state (e.g., "Active Subscriber")
- **evolving**: Changes over time based on cumulative behaviors (e.g., "VIP Customer")

## Qualification Rules

Tags can qualify members using four rule types: property, activity, association, and score.

### Property Rules

Match based on object field values.

```typescript
export interface PropertyRuleCondition {
  id?: string;                    // Optional ID for React keys
  object: string;                 // Object name (e.g., "Contact", "Company")
  field: string;                  // Field name (e.g., "email", "industry")
  operator: PropertyOperator;     // See operators below
  value?: any;                    // Value to compare against
}

type PropertyOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'between'
  | 'is_known'
  | 'is_unknown';
```

**Example:**
```json
{
  "object": "Contact",
  "field": "lifetime_value",
  "operator": "greater_than",
  "value": 10000
}
```

### Activity Rules

Match based on event occurrences.

```typescript
export interface ActivityRuleCondition {
  eventType: string;              // Event identifier (e.g., "form_submission")
  occurrence: 'has_occurred' | 'has_not_occurred' | 'count';
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal';
  value?: number;                 // Count value (required if occurrence = 'count')
  timeframe?: number;             // Days to look back
  filters?: PropertyRuleCondition[];  // Additional filters on event properties
}
```

**Example:**
```json
{
  "eventType": "form_submission",
  "occurrence": "count",
  "operator": "greater_than",
  "value": 3,
  "timeframe": 30,
  "filters": [
    {
      "object": "Form",
      "field": "form_id",
      "operator": "equals",
      "value": "contact-form-2024"
    }
  ]
}
```

### Association Rules

Match based on related objects.

```typescript
export interface AssociationRuleCondition {
  associationType: string;        // Type of association
  relatedObject: string;          // Related object type
  conditionType: 'has_any' | 'has_none' | 'count';
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal';
  value?: number;                 // Count value (if conditionType = 'count')
  nestedFilters?: PropertyRuleCondition[];  // Filters on related object properties
}
```

**Example:**
```json
{
  "associationType": "contact_to_deal",
  "relatedObject": "Deal",
  "conditionType": "count",
  "operator": "greater_than_or_equal",
  "value": 2,
  "nestedFilters": [
    {
      "object": "Deal",
      "field": "stage",
      "operator": "equals",
      "value": "closed_won"
    }
  ]
}
```

### Score Rules

Match based on numeric scores with optional hysteresis.

```typescript
export interface ScoreRuleCondition {
  scoreField: string;             // Field containing the score
  operator: 'equals' | 'not_equals' | 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal' | 'between';
  threshold?: number;             // Single threshold value
  value?: number | [number, number];  // Single value or array for 'between'
  hysteresis?: {
    addThreshold: number;         // Score to add tag
    removeThreshold: number;      // Score to remove tag
  };
}
```

**Example with Hysteresis:**
```json
{
  "scoreField": "engagement_score",
  "operator": "between",
  "hysteresis": {
    "addThreshold": 75,
    "removeThreshold": 60
  }
}
```

### Qualification Rules Schema

```typescript
export interface QualificationRules {
  ruleType: 'property' | 'activity' | 'association' | 'score';
  logic: 'AND' | 'OR';            // How to combine multiple conditions
  conditions: RuleCondition[];    // Array of 1+ conditions
}

type RuleCondition =
  | PropertyRuleCondition
  | ActivityRuleCondition
  | AssociationRuleCondition
  | ScoreRuleCondition;
```

## Storage Format

### Supabase Database Structure

**Table:** `implementations`
**Column:** `data` (JSONB)

Tags are stored within the `data.tags` object:

```json
{
  "tags": {
    "library": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "High-Value Customer",
        "category": "behavior",
        "description": "Customer with lifetime value > $10,000",
        "icon": "💎",
        "color": "#1D4ED8",
        "behavior": "dynamic",
        "isPermanent": false,
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
        "dependencies": [],
        "isCustom": false,
        "createdAt": "2025-10-15T00:00:00.000Z",
        "updatedAt": "2025-10-15T00:00:00.000Z"
      }
    ],
    "custom": []
  }
}
```

### Storage Schema Validation

**Location:** `src/services/adapters/SupabaseAdapter.js`

```javascript
// Storage-compatible tag schema (dates as ISO strings)
const storageTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(100),
  category: tagCategorySchema,
  description: z.string().min(10).max(500),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  behavior: tagBehaviorSchema,
  isPermanent: z.boolean(),
  qualificationRules: qualificationRulesSchema,
  dependencies: z.array(z.string()).optional().default([]),
  isCustom: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
```

**Key Differences from Runtime Schema:**
- Dates stored as ISO 8601 strings (not Date objects)
- Schema accepts both Date and string for compatibility

## Tag Collection Structure

Tags are organized into two categories:

```typescript
export interface TagCollection {
  library: Tag[];   // Pre-built tags from tag library
  custom: Tag[];    // User-created tags
}
```

### Project Integration

Tags are stored within the Project data structure:

```typescript
export interface Project {
  id: string;
  name: string;
  // ... other fields ...
  tags?: TagCollection;
  // ... other fields ...
}
```

## Validation Rules

### Name Validation

- Minimum length: 2 characters
- Maximum length: 100 characters
- Must match TAG_NAME_PATTERN (defined in `src/utils/validationPatterns.ts`)
- Must be unique within the project (case-insensitive)

### Description Validation

- Minimum length: 10 characters
- Maximum length: 500 characters

### Color Validation

- Must be valid hex color code: `#RRGGBB`
- Regex pattern: `/^#[0-9A-Fa-f]{6}$/`

### Qualification Rules Validation

- At least 1 condition required
- Property rules must reference existing objects/fields in data model
- Circular dependencies not allowed

## Complex Example

Here's a complete tag with nested activity rules:

```json
{
  "id": "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
  "name": "Engaged Prospect - Healthcare",
  "category": "opportunity",
  "description": "Healthcare prospects who have engaged with 3+ content pieces in the last 30 days and attended a webinar",
  "icon": "🏥",
  "color": "#10B981",
  "behavior": "dynamic",
  "isPermanent": false,
  "isCustom": true,
  "qualificationRules": {
    "ruleType": "activity",
    "logic": "AND",
    "conditions": [
      {
        "eventType": "content_view",
        "occurrence": "count",
        "operator": "greater_than_or_equal",
        "value": 3,
        "timeframe": 30,
        "filters": [
          {
            "object": "Content",
            "field": "type",
            "operator": "in",
            "value": ["whitepaper", "case_study", "blog_post"]
          }
        ]
      },
      {
        "eventType": "webinar_attendance",
        "occurrence": "has_occurred",
        "timeframe": 90
      }
    ]
  },
  "dependencies": [],
  "createdAt": "2025-10-15T12:00:00.000Z",
  "updatedAt": "2025-10-15T12:00:00.000Z"
}
```

## Migration Notes

### Date Handling

When migrating data or transforming between storage and runtime formats:

1. **Storage → Runtime:** Convert ISO strings to Date objects if needed
2. **Runtime → Storage:** Convert Date objects to ISO strings (handled automatically by JSON.stringify)

### Backward Compatibility

The schema uses `.optional()` and `.default()` for several fields to maintain backward compatibility:
- `dependencies` defaults to `[]`
- `isCustom` defaults to `false`
- Dates are optional (added in later versions)

## Best Practices

1. **Use Zod schemas for validation** - Always validate tag data before storage
2. **Preserve nested structures** - Ensure filters arrays are maintained
3. **Handle dates consistently** - Use ISO 8601 strings in storage
4. **Validate dependencies** - Check for circular dependencies before saving
5. **Test complex rules** - Verify nested filters persist correctly

## Related Files

- `src/types/tag.ts` - TypeScript type definitions
- `src/schemas/tagSchema.ts` - Zod validation schemas
- `src/services/adapters/SupabaseAdapter.js` - Storage validation
- `src/features/tag-library/components/TagModal.tsx` - Tag creation UI
- `src/features/tag-library/components/RuleBuilder.tsx` - Rule builder UI
- `src/context/ProjectContext-v2.tsx` - Tag state management

## Changelog

- **October 15, 2025**: Updated SupabaseAdapter to use `storageTagSchema` instead of `z.array(z.any())` for proper validation
- **October 15, 2025**: Created comprehensive schema documentation
