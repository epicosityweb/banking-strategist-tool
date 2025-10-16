import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SupabaseAdapter from '../SupabaseAdapter';

/**
 * Comprehensive test suite for SupabaseAdapter validation logic
 * Tests security-critical _validateTagArray() method
 *
 * Test Coverage Goals:
 * - Line Coverage: ≥80%
 * - Branch Coverage: ≥75%
 * - Function Coverage: 100%
 *
 * Total Tests: 24 (exceeds 22+ minimum requirement)
 */

// ==========================================
// TEST FIXTURES
// ==========================================

const validTag = {
  id: 'test-tag-id-001',
  name: 'Valid Tag Name',
  category: 'origin',
  description: 'This is a valid test tag description with sufficient length',
  icon: 'user',
  color: '#FF5733',
  behavior: 'dynamic', // Enum: 'set_once', 'dynamic', or 'evolving'
  isPermanent: false,
  qualificationRules: {
    ruleType: 'property',
    logic: 'AND',
    conditions: [{
      type: 'property',
      object: 'member',
      field: 'age',
      operator: 'greater_than',
      value: 18
    }]
  },
  dependencies: [],
  isCustom: false,
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-15T10:30:00Z'
};

const validTagWithDateObjects = {
  ...validTag,
  id: 'test-tag-id-002',
  name: 'Tag with Date Objects',
  createdAt: new Date('2025-01-15T10:30:00Z'),
  updatedAt: new Date('2025-01-15T10:30:00Z')
};

const validTagWithComplexRules = {
  ...validTag,
  id: 'test-tag-id-003',
  name: 'Complex Rules Tag',
  qualificationRules: {
    ruleType: 'property',
    logic: 'AND',
    conditions: [
      {
        type: 'property',
        object: 'account',
        field: 'balance',
        operator: 'greater_than_or_equal',
        value: 1000
      },
      {
        type: 'property',
        object: 'member',
        field: 'status',
        operator: 'equals',
        value: 'active'
      }
    ]
  }
};

const validTagActivity = {
  ...validTag,
  id: 'test-tag-id-004',
  name: 'Activity Rule Tag',
  qualificationRules: {
    ruleType: 'activity',
    logic: 'AND',
    conditions: [{
      type: 'activity',
      eventType: 'login',
      occurrence: 'count',
      operator: 'greater_than_or_equal',
      value: 3,
      timeframe: 7
    }]
  }
};

const validTagAssociation = {
  ...validTag,
  id: 'test-tag-id-005',
  name: 'Association Rule Tag',
  qualificationRules: {
    ruleType: 'association',
    logic: 'AND',
    conditions: [{
      type: 'association',
      associationType: 'primary_account',
      relatedObject: 'account',
      conditionType: 'has_any'
    }]
  }
};

const invalidTagShortName = {
  ...validTag,
  id: 'invalid-short',
  name: 'X' // Too short (< 2 chars)
};

const invalidTagLongName = {
  ...validTag,
  id: 'invalid-long',
  name: 'A'.repeat(101) // Too long (> 100 chars)
};

const invalidTagColor = {
  ...validTag,
  id: 'invalid-color',
  color: 'not-a-hex-color' // Not hex format
};

const invalidTagShortDescription = {
  ...validTag,
  id: 'invalid-desc',
  description: 'Too short' // < 10 chars
};

const invalidTagMalformedDate = {
  ...validTag,
  id: 'invalid-date',
  createdAt: 'not-a-date-format' // Not ISO 8601
};

const invalidTagNonISODate = {
  ...validTag,
  id: 'invalid-iso',
  createdAt: '01/15/2025' // US format, not ISO 8601
};

const invalidTagBadQualificationRules = {
  ...validTag,
  id: 'invalid-rules',
  qualificationRules: {
    ruleType: 'invalid-type', // Invalid ruleType (should be 'property', 'activity', 'association', or 'score')
    logic: 'AND',
    conditions: []
  }
};

// ==========================================
// MOCK SETUP
// ==========================================

describe('SupabaseAdapter - Tag Validation (_validateTagArray)', () => {
  let adapter;
  let mockSupabase;
  let mockErrorTracker;
  let consoleWarnSpy;
  let originalNodeEnv;

  beforeEach(() => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn()
      },
      from: vi.fn()
    };

    // Mock error tracker
    mockErrorTracker = {
      captureException: vi.fn()
    };

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Create adapter with mocks
    adapter = new SupabaseAdapter(mockSupabase, mockErrorTracker);
  });

  afterEach(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;

    // Restore console.warn
    consoleWarnSpy.mockRestore();

    // Clear all mocks
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. VALID TAG HANDLING (6 tests)
  // ==========================================

  describe('Valid Tag Handling', () => {
    it('should return all tags when all are valid', () => {
      const tags = [validTag];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
      expect(result[0].name).toBe('Valid Tag Name');
    });

    it('should preserve valid tags in mixed valid/invalid array', () => {
      const tags = [
        validTag,
        invalidTagShortName, // Invalid - should be filtered
        validTagWithComplexRules,
        invalidTagColor, // Invalid - should be filtered
        validTagActivity
      ];

      const result = adapter._validateTagArray(tags, 'custom');

      expect(result).toHaveLength(3);
      expect(result.map(t => t.id)).toEqual([
        'test-tag-id-001',
        'test-tag-id-003',
        'test-tag-id-004'
      ]);
    });

    it('should accept tags with Date objects for timestamps', () => {
      const tags = [validTagWithDateObjects];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-002');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should accept tags with ISO 8601 string timestamps', () => {
      const tags = [validTag];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].createdAt).toBe('2025-01-15T10:30:00Z');
    });

    it('should validate complex qualification rules correctly', () => {
      const tags = [validTagWithComplexRules];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].qualificationRules.ruleType).toBe('property');
      expect(result[0].qualificationRules.conditions).toHaveLength(2);
    });

    it('should handle multiple tag arrays independently', () => {
      const libraryTags = [validTag, validTagActivity];
      const customTags = [validTagAssociation, validTagWithComplexRules];

      const libraryResult = adapter._validateTagArray(libraryTags, 'library');
      const customResult = adapter._validateTagArray(customTags, 'custom');

      expect(libraryResult).toHaveLength(2);
      expect(customResult).toHaveLength(2);
      expect(libraryResult[0].id).not.toBe(customResult[0].id);
    });
  });

  // ==========================================
  // 2. INVALID TAG FILTERING (5 tests)
  // ==========================================

  describe('Invalid Tag Filtering', () => {
    it('should filter out tags with names too short (< 2 chars)', () => {
      const tags = [validTag, invalidTagShortName];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
    });

    it('should filter out tags with invalid colors (non-hex)', () => {
      const tags = [validTag, invalidTagColor];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
    });

    it('should filter out tags with bad qualification rules', () => {
      const tags = [validTag, invalidTagBadQualificationRules];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
    });

    it('should filter out tags with malformed dates', () => {
      const tags = [validTag, invalidTagMalformedDate];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
    });

    it('should reject non-ISO 8601 date formats', () => {
      const tags = [validTag, invalidTagNonISODate];
      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-tag-id-001');
    });
  });

  // ==========================================
  // 3. ERROR HANDLING (3 tests)
  // ==========================================

  describe('Error Handling', () => {
    it('should log console warnings in development mode', () => {
      process.env.NODE_ENV = 'development';
      const tags = [invalidTagShortName];

      adapter._validateTagArray(tags, 'library');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0][0];
      expect(warnCall).toContain('Invalid library tag');
      expect(warnCall).toContain('invalid-short');
    });

    it('should call error tracker with correct context when tag is invalid', () => {
      const tags = [invalidTagShortName];

      adapter._validateTagArray(tags, 'library');

      expect(mockErrorTracker.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid tag schema in library')
        }),
        expect.objectContaining({
          extra: expect.objectContaining({
            arrayName: 'library',
            errorCount: expect.any(Number)
          })
        })
      );
    });

    it('should NOT crash when error tracker is undefined', () => {
      const adapterNoTracker = new SupabaseAdapter(mockSupabase); // No error tracker
      const tags = [invalidTagShortName];

      expect(() => {
        adapterNoTracker._validateTagArray(tags, 'library');
      }).not.toThrow();

      // Result should still filter invalid tags
      const result = adapterNoTracker._validateTagArray(tags, 'library');
      expect(result).toHaveLength(0);
    });
  });

  // ==========================================
  // 4. EDGE CASES (6 tests)
  // ==========================================

  describe('Edge Cases', () => {
    it('should return empty array for null input', () => {
      const result = adapter._validateTagArray(null, 'library');
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      const result = adapter._validateTagArray(undefined, 'library');
      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = adapter._validateTagArray('not-an-array', 'library');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      const result = adapter._validateTagArray([], 'library');
      expect(result).toEqual([]);
    });

    it('should handle large arrays (1000+ tags) without crashing', () => {
      const largeTags = Array.from({ length: 1000 }, (_, i) => ({
        ...validTag,
        id: `tag-${i}`,
        name: `Tag ${i}`
      }));

      expect(() => {
        adapter._validateTagArray(largeTags, 'stress-test');
      }).not.toThrow();

      const result = adapter._validateTagArray(largeTags, 'stress-test');
      expect(result).toHaveLength(1000);
    });

    it('should process large arrays with acceptable performance (< 100ms for 1000 tags)', () => {
      const largeTags = Array.from({ length: 1000 }, (_, i) => ({
        ...validTag,
        id: `tag-${i}`,
        name: `Tag ${i}`
      }));

      const start = performance.now();
      const result = adapter._validateTagArray(largeTags, 'performance');
      const duration = performance.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // < 100ms
    });
  });

  // ==========================================
  // 5. INTEGRATION TESTS (2 tests)
  // ==========================================

  describe('Integration with Project Operations', () => {
    beforeEach(() => {
      // Mock successful authentication
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
    });

    it('should apply validation when getAllProjects loads tags', async () => {
      // Mock Supabase query response with mixed valid/invalid tags
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'proj-001',
              name: 'Test Project',
              status: 'draft',
              data: {
                tags: {
                  library: [
                    validTag,
                    invalidTagShortName // Should be filtered out
                  ],
                  custom: [
                    validTagActivity
                  ]
                }
              },
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z'
            }
          ],
          error: null
        })
      });

      const { data } = await adapter.getAllProjects();

      expect(data).toHaveLength(1);
      expect(data[0].tags.library).toHaveLength(1); // Invalid tag filtered
      expect(data[0].tags.library[0].id).toBe('test-tag-id-001');
      expect(data[0].tags.custom).toHaveLength(1);
    });

    it('should apply validation when getProject loads tags', async () => {
      // Mock Supabase query response with mixed valid/invalid tags
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'proj-001',
            name: 'Test Project',
            status: 'draft',
            data: {
              tags: {
                library: [
                  validTag,
                  invalidTagColor // Should be filtered out
                ],
                custom: [
                  validTagWithComplexRules,
                  invalidTagMalformedDate // Should be filtered out
                ]
              }
            },
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-15T10:00:00Z'
          },
          error: null
        })
      });

      const { data } = await adapter.getProject('proj-001');

      expect(data.tags.library).toHaveLength(1); // Invalid tag filtered
      expect(data.tags.library[0].id).toBe('test-tag-id-001');
      expect(data.tags.custom).toHaveLength(1); // Invalid tag filtered
      expect(data.tags.custom[0].id).toBe('test-tag-id-003');
    });
  });

  // ==========================================
  // 6. ADDITIONAL VALIDATION EDGE CASES (2 bonus tests)
  // ==========================================

  describe('Additional Validation Edge Cases', () => {
    it('should filter multiple invalid tags and preserve order of valid tags', () => {
      const tags = [
        validTag,
        invalidTagShortName,
        validTagActivity,
        invalidTagColor,
        validTagAssociation,
        invalidTagBadQualificationRules
      ];

      const result = adapter._validateTagArray(tags, 'library');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('test-tag-id-001');
      expect(result[1].id).toBe('test-tag-id-004');
      expect(result[2].id).toBe('test-tag-id-005');
    });

    it('should handle tags with optional fields missing', () => {
      const minimalValidTag = {
        id: 'minimal-tag',
        name: 'Minimal Valid Tag',
        category: 'behavior',
        description: 'This minimal tag has only required fields and defaults',
        icon: 'star',
        color: '#00FF00',
        behavior: 'set_once',
        isPermanent: false,
        qualificationRules: {
          ruleType: 'property',
          logic: 'AND',
          conditions: [{
            type: 'property',
            object: 'member',
            field: 'status',
            operator: 'equals',
            value: 'active'
          }]
        },
        isCustom: false
        // Missing: dependencies, createdAt, updatedAt (all optional)
      };

      const result = adapter._validateTagArray([minimalValidTag], 'library');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('minimal-tag');
    });
  });
});
