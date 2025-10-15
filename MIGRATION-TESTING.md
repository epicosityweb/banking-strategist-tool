# Migration Utility Testing Guide

This guide walks through comprehensive testing of the `migrateToSupabase.ts` utility to verify all 10 critical issues have been resolved.

## Prerequisites

- ✅ Dev server running: `npm run dev` (port 5173)
- ✅ Supabase project configured
- ✅ `.env.local` with `VITE_STORAGE_ADAPTER=supabase`
- ✅ User authenticated in the app

## Quick Start

1. **Generate test data:**
   ```bash
   node test-migration.js
   ```

2. **Copy the localStorage command** from output and paste into browser console (F12)

3. **Open the app** at http://localhost:5173

4. **Log in** (if not already logged in)

5. **Migration prompt appears automatically!**
   - Beautiful modal UI with progress indicators
   - Click "Migrate Now" to start
   - Watch real-time migration progress
   - See success/error results in the UI
   - Automatic page reload on success

**No more manual console imports** - the app now detects localStorage projects and handles migration through a user-friendly interface! 🎉

## Test Suite

### 🎨 New UI-Based Testing

All tests now use the **Migration Prompt UI** component instead of manual console commands. The app automatically:
- Detects localStorage projects on startup
- Shows a modal prompt when user is authenticated
- Provides visual feedback during migration
- Displays clear success/error messages
- Handles all 10 critical issues through the UI

### Test 1: Authentication Verification ✅ (Issue #2)

**Purpose:** Verify migration doesn't show for unauthenticated users

**Steps:**
1. Set up test data in localStorage (from test-migration.js output)
2. Make sure you're **logged out**
3. Open the app at http://localhost:5173
4. Verify **no migration prompt** appears
5. Now log in
6. Verify migration prompt **now appears**

**Expected Result:**
- When logged out: No prompt visible
- When logged in: Migration prompt appears with "Migrate to Cloud Storage" title

**Pass Criteria:** Migration prompt only appears after authentication

---

### Test 2: Data Validation with Valid Data ✅ (Issue #3)

**Purpose:** Verify Zod schemas validate correct data structure

**Steps:**
1. Set up test data (run `node test-migration.js` and paste command in console)
2. Log in to the application
3. Migration prompt appears automatically
4. Click "Migrate Now" button
5. Watch the progress spinner
6. Verify success message appears

**Expected Result:**
- ✅ Green checkmark icon appears
- ✅ "Migration Successful!" message shown
- ✅ Shows "1 project migrated to cloud storage"
- ✅ Page automatically reloads after 2 seconds

**Pass Criteria:**
- Migration succeeds with UI feedback
- All 33 fields validated correctly
- Success state displayed properly

---

### Test 3: Data Validation with Invalid Data ✅ (Issue #3 & #4)

**Purpose:** Verify migration fails fast on invalid data

**Steps:**
1. Set invalid data in localStorage (F12 console):
   ```javascript
   localStorage.setItem('strategist-projects', JSON.stringify([
     {
       id: 'invalid-test',
       name: '', // Empty name should fail
       status: 'invalid-status', // Invalid enum
       clientProfile: {}
     }
   ]));
   ```

2. Refresh the page (or log out and back in)
3. Migration prompt appears
4. Click "Migrate Now"
5. Watch for error state

**Expected Result:**
- ❌ Red X icon appears
- ❌ "Migration Failed" message shown
- ❌ Error box displays: "Validation failed for 1 projects. Migration aborted to prevent data corruption."
- ❌ "Try Again" and "Cancel" buttons available

**Pass Criteria:**
- Migration aborts before touching database
- Clear error UI with validation message
- No partial data created in Supabase
- User can retry or cancel

---

### Test 4: Performance with Batching ✅ (Issue #5)

**Purpose:** Verify parallel batch processing improves performance

**Steps:**
1. Create multiple test projects:
   ```javascript
   const projects = [];
   for (let i = 0; i < 50; i++) {
     projects.push({
       id: `test-project-${i}`,
       name: `Test Project ${i}`,
       status: 'active',
       clientProfile: {
         basicInfo: { institutionName: `Institution ${i}` },
         integrationSpecs: { exportMethod: 'API' }
       },
       dataModel: { objects: [], fields: [], mappings: [], associations: [] },
       tags: { library: [], custom: [] },
       journeys: []
     });
   }
   localStorage.setItem('strategist-projects', JSON.stringify(projects));
   ```

2. Run migration and time it:
   ```javascript
   console.time('Migration');
   const result = await migrateLocalStorageToSupabase(projectRepository);
   console.timeEnd('Migration');
   console.log(result);
   ```

**Expected Result:**
- 50 projects migrate in <5 seconds
- All 50 projects show `success: true`
- `migratedCount: 50`

**Pass Criteria:**
- Migration completes in under 10 seconds for 50 projects
- All projects successfully migrated
- No timeout errors

---

### Test 5: Rollback on Failure ✅ (Issue #6)

**Purpose:** Verify complete rollback deletes Supabase projects on error

**Setup:**
1. Create projects with one invalid entry in the middle:
   ```javascript
   localStorage.setItem('strategist-projects', JSON.stringify([
     { id: 'valid-1', name: 'Valid 1', status: 'active', /* ... */ },
     { id: 'invalid', name: '', status: 'bad' }, // This will fail
     { id: 'valid-2', name: 'Valid 2', status: 'active', /* ... */ }
   ]));
   ```

2. Run migration
3. Check Supabase for orphaned projects

**Expected Result:**
- Migration fails with validation error
- No projects exist in Supabase with IDs: `valid-1`, `invalid`, `valid-2`
- Complete rollback executed

**Pass Criteria:**
- All created projects are deleted
- No orphaned data in database
- Clear error message about validation failure

---

### Test 6: Service Layer Usage ✅ (Issue #7)

**Purpose:** Verify migration uses ProjectRepository

**Steps:**
1. Add console log to ProjectRepository.createProject():
   ```javascript
   // In ProjectRepository.js, line ~60
   async createProject(projectData) {
     console.log('[ProjectRepository] createProject called:', projectData.id);
     return await this.adapter.createProject(projectData);
   }
   ```

2. Run migration
3. Check console logs

**Expected Result:**
- See `[ProjectRepository] createProject called:` for each project
- No direct adapter calls from migration

**Pass Criteria:**
- All creates go through ProjectRepository
- Proper separation of concerns maintained

---

### Test 7: JSON Parse Safety ✅ (Issue #8)

**Purpose:** Verify graceful handling of corrupted localStorage

**Steps:**
1. Set corrupted JSON in localStorage:
   ```javascript
   localStorage.setItem('strategist-projects', '{invalid json syntax}');
   ```

2. Run migration
3. Check error handling

**Expected Result:**
```javascript
{
  success: false,
  migratedCount: 0,
  failedCount: 0,
  error: "Failed to parse localStorage data - corrupted JSON"
}
```

**Pass Criteria:**
- No crash or exception
- Clear error message
- Migration aborts gracefully

---

### Test 8: No Console Logs in Production ✅ (Issue #9)

**Purpose:** Verify no console.log statements

**Steps:**
1. Open browser console
2. Clear console
3. Run migration with valid data
4. Check console output

**Expected Result:**
- Only the result object logged (from your test code)
- No internal logging from migration utility

**Pass Criteria:**
- Zero console.log calls from `migrateToSupabase.ts`
- Clean console output

---

### Test 9: Code Simplicity ✅ (Issue #10)

**Purpose:** Verify removal of over-engineered backup/restore

**Steps:**
1. Check localStorage before migration:
   ```javascript
   console.log('Backup key exists:', localStorage.getItem('strategist-projects-backup'));
   console.log('Migration status key:', localStorage.getItem('strategist-migration-status'));
   ```

2. Run migration
3. Check localStorage after:
   ```javascript
   console.log('Backup key exists:', localStorage.getItem('strategist-projects-backup'));
   console.log('Migration status key:', localStorage.getItem('strategist-migration-status'));
   ```

**Expected Result:**
- No backup created in localStorage
- No migration status tracking keys
- Simple, clean implementation

**Pass Criteria:**
- No extra localStorage keys created
- Migration relies on Supabase transactions only

---

### Test 10: Data Integrity Verification

**Purpose:** Verify migrated data matches source data

**Steps:**
1. Set test data with all 37 Client Profile fields
2. Run migration
3. Query Supabase to verify data:
   ```javascript
   const { data } = await projectRepository.getProject('test-project-001');
   console.log('Basic Info:', data.clientProfile.basicInfo);
   console.log('Integration Specs:', data.clientProfile.integrationSpecs);
   ```

4. Compare with localStorage original

**Expected Result:**
- All 23 basicInfo fields match
- All 14 integrationSpecs fields match
- Data types preserved (boolean, string, array)

**Pass Criteria:**
- 100% data accuracy
- No field loss or corruption
- Proper JSONB structure in Supabase

---

## Cleanup After Testing

```javascript
// Clear localStorage
localStorage.removeItem('strategist-projects');

// Delete test projects from Supabase
const testIds = ['test-project-001', 'test-project-002', /* ... */];
for (const id of testIds) {
  await projectRepository.deleteProject(id);
}
```

---

## Test Results Template

Copy this template to document your test results:

```markdown
# Migration Testing Results

**Date:** [Date]
**Tester:** [Name]
**Branch:** feature/client-profile-supabase-persistence
**Commit:** 99b8ee6

## Test Results

| Test | Issue # | Status | Notes |
|------|---------|--------|-------|
| Authentication Check | #2 | ⬜ Pass / ❌ Fail | |
| Valid Data Validation | #3 | ⬜ Pass / ❌ Fail | |
| Invalid Data Validation | #3, #4 | ⬜ Pass / ❌ Fail | |
| Performance/Batching | #5 | ⬜ Pass / ❌ Fail | Time: ____ seconds |
| Rollback on Failure | #6 | ⬜ Pass / ❌ Fail | |
| Service Layer Usage | #7 | ⬜ Pass / ❌ Fail | |
| JSON Parse Safety | #8 | ⬜ Pass / ❌ Fail | |
| No Console Logs | #9 | ⬜ Pass / ❌ Fail | |
| Code Simplicity | #10 | ⬜ Pass / ❌ Fail | |
| Data Integrity | All | ⬜ Pass / ❌ Fail | |

## Overall Result

- [ ] All tests passed ✅
- [ ] Some tests failed ❌ (see notes above)
- [ ] Ready for merge
- [ ] Needs additional fixes

## Additional Notes

[Any observations, issues, or suggestions]
```

---

## Troubleshooting

### Issue: "Module not found" error
**Solution:** Make sure you're running the code in the browser console, not Node.js

### Issue: Migration hangs
**Solution:** Check network tab for failed Supabase requests, verify authentication

### Issue: "No projects to migrate"
**Solution:** Verify localStorage has the correct key: `strategist-projects`

### Issue: TypeScript errors in browser
**Solution:** The app should be built with `npm run build` or dev mode should transpile TS files

---

## Success Criteria Summary

✅ All 10 tests pass
✅ No crashes or exceptions
✅ Data integrity verified
✅ Performance meets targets (<10s for 100 projects)
✅ Error messages are clear and actionable
✅ Code is production-ready

Once all tests pass, the migration utility is ready for production deployment! 🚀
