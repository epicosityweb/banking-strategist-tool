# Service Layer Migration Guide

This guide explains how to migrate from the old `ProjectContext.jsx` to the new service layer architecture with `ProjectContext-v2.jsx`.

## Overview of Changes

### What's New
- ✅ **Service Layer Pattern**: All data operations now go through `ProjectRepository`
- ✅ **Validation Enforcement**: Zod schemas are enforced before saves
- ✅ **Async Operations**: Proper async/await pattern for future Supabase migration
- ✅ **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Loading States**: Built-in loading indicators for async operations
- ✅ **Type Safety Ready**: Service layer is ready for TypeScript conversion

### Architecture Before
```
Component → Context/Reducer → localStorage
```

### Architecture After
```
Component → Context (async actions) → Repository → Adapter → Storage
                                                      ↓
                                            Validation Service
```

## Migration Steps

### Step 1: Update Imports

**Before:**
```javascript
import { useProject } from '../context/ProjectContext';
```

**After:**
```javascript
import { useProject } from '../context/ProjectContext-v2';
```

### Step 2: Update Component Usage

The new context provides async action functions instead of requiring dispatch calls.

#### Adding a Custom Object

**Before:**
```javascript
const { dispatch } = useProject();

dispatch({
  type: 'ADD_OBJECT',
  payload: newObject,
});
```

**After:**
```javascript
const { addCustomObject, state } = useProject();

const handleAddObject = async () => {
  const { data, error } = await addCustomObject(newObject);

  if (error) {
    // Show error to user
    console.error('Failed to add object:', error);
    return;
  }

  // Success! Object was added
  console.log('Object added:', data);
};
```

#### Updating a Custom Object

**Before:**
```javascript
dispatch({
  type: 'UPDATE_OBJECT',
  payload: updatedObject,
});
```

**After:**
```javascript
const { updateCustomObject } = useProject();

const handleUpdateObject = async (objectId, updates) => {
  const { data, error, validationErrors } = await updateCustomObject(objectId, updates);

  if (error) {
    // Show validation errors to user
    if (validationErrors && validationErrors.length > 0) {
      setFormErrors(validationErrors);
    }
    return;
  }

  // Success!
};
```

#### Deleting a Custom Object

**Before:**
```javascript
dispatch({
  type: 'DELETE_OBJECT',
  payload: { objectId, cascade: true },
});
```

**After:**
```javascript
const { deleteCustomObject } = useProject();

const handleDeleteObject = async (objectId) => {
  if (confirm('Are you sure you want to delete this object?')) {
    const { data, error } = await deleteCustomObject(objectId);

    if (error) {
      alert('Failed to delete object: ' + error);
      return;
    }

    // Object deleted successfully
    onClose();
  }
};
```

#### Adding a Field

**Before:**
```javascript
dispatch({
  type: 'ADD_FIELD',
  payload: { objectId, field: newField },
});
```

**After:**
```javascript
const { addField } = useProject();

const handleAddField = async (objectId, fieldData) => {
  const { data, error, validationErrors } = await addField(objectId, fieldData);

  if (error) {
    setErrors(validationErrors || [{ message: error }]);
    return;
  }

  // Field added successfully
  closeModal();
};
```

#### Updating a Field

**Before:**
```javascript
dispatch({
  type: 'UPDATE_FIELD',
  payload: { objectId, field: updatedField },
});
```

**After:**
```javascript
const { updateField } = useProject();

const handleUpdateField = async (objectId, fieldId, updates) => {
  const { data, error } = await updateField(objectId, fieldId, updates);

  if (error) {
    showNotification('Error updating field: ' + error, 'error');
    return;
  }

  showNotification('Field updated successfully', 'success');
};
```

#### Deleting a Field

**Before:**
```javascript
dispatch({
  type: 'DELETE_FIELD',
  payload: { objectId, fieldId },
});
```

**After:**
```javascript
const { deleteField } = useProject();

const handleDeleteField = async (objectId, fieldId) => {
  const { data, error } = await deleteField(objectId, fieldId);

  if (error) {
    alert('Failed to delete field: ' + error);
    return;
  }

  // Field deleted
};
```

#### Duplicating an Object

**Before:**
```javascript
dispatch({
  type: 'DUPLICATE_OBJECT',
  payload: objectId,
});
```

**After:**
```javascript
const { duplicateCustomObject } = useProject();

const handleDuplicate = async (objectId) => {
  const { data, error } = await duplicateCustomObject(objectId);

  if (error) {
    showError('Failed to duplicate object: ' + error);
    return;
  }

  showSuccess(`Object duplicated: ${data.label}`);
};
```

### Step 3: Handle Loading States

The new context provides loading states for better UX:

```javascript
const { state } = useProject();

if (state.loading) {
  return <LoadingSpinner />;
}

if (state.error) {
  return (
    <ErrorMessage>
      {state.error}
      {state.validationErrors.length > 0 && (
        <ul>
          {state.validationErrors.map((err, i) => (
            <li key={i}>{err.field}: {err.message}</li>
          ))}
        </ul>
      )}
    </ErrorMessage>
  );
}
```

### Step 4: Update Auto-Save Logic

Auto-save is now built into the context:

**Before:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    dispatch({ type: 'SAVE_PROJECT' });
  }, 30000);
  return () => clearInterval(interval);
}, [state.currentProject]);
```

**After:**
```javascript
// Auto-save is automatic! No need to implement it in components.
// The context handles it automatically every 30 seconds.

// If you need manual save:
const { saveProject } = useProject();

const handleManualSave = async () => {
  const { data, error } = await saveProject();

  if (error) {
    showNotification('Save failed: ' + error, 'error');
  } else {
    showNotification('Saved successfully!', 'success');
  }
};
```

## Component-by-Component Migration

### DataModel.jsx

**Changes needed:**
1. Update imports to use `ProjectContext-v2`
2. No changes to modal management (that stays the same)
3. Update handlers to use async actions

**Example:**
```javascript
// Before
const handleDuplicateObject = (object) => {
  dispatch({
    type: 'DUPLICATE_OBJECT',
    payload: object.id,
  });
};

// After
const handleDuplicateObject = async (object) => {
  const { data, error } = await duplicateCustomObject(object.id);
  if (error) {
    // Show error toast/notification
    console.error('Duplicate failed:', error);
  }
};
```

### ObjectModal.jsx

**Changes needed:**
1. Make submit handlers async
2. Handle validation errors from service layer
3. Show loading state during save

**Example:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  if (isEditing) {
    const { data, error, validationErrors } = await updateCustomObject(
      object.id,
      formData
    );

    if (error) {
      setErrors(validationErrors || []);
      setSubmitting(false);
      return;
    }
  } else {
    const { data, error, validationErrors } = await addCustomObject(formData);

    if (error) {
      setErrors(validationErrors || []);
      setSubmitting(false);
      return;
    }
  }

  setSubmitting(false);
  onClose();
};
```

### FieldModal.jsx

**Changes needed:**
1. Update field operations to async
2. Handle validation errors
3. Show loading spinner during save

**Example:**
```javascript
const handleSave = async (fieldData) => {
  if (selectedField) {
    const { error } = await updateField(objectId, selectedField.id, fieldData);
    if (error) {
      showError(error);
      return;
    }
  } else {
    const { error } = await addField(objectId, fieldData);
    if (error) {
      showError(error);
      return;
    }
  }

  onClose();
};
```

### ObjectDetailModal.jsx

**Changes needed:**
1. Update field delete to async with confirmation
2. Handle errors gracefully

**Example:**
```javascript
const handleDeleteField = async (field) => {
  if (!confirm(`Delete field "${field.label}"?`)) return;

  const { error } = await deleteField(object.id, field.id);
  if (error) {
    alert('Failed to delete field: ' + error);
  }
};
```

## Testing the Migration

### Manual Testing Checklist

- [ ] Create a new custom object
- [ ] Edit an existing object
- [ ] Duplicate an object
- [ ] Delete an object
- [ ] Add a field to an object
- [ ] Edit a field
- [ ] Delete a field
- [ ] Verify validation errors are shown
- [ ] Verify auto-save works every 30 seconds
- [ ] Verify optimistic updates (instant UI feedback)
- [ ] Verify rollback on errors
- [ ] Test with network throttling (simulate slow Supabase)

### Error Scenarios to Test

1. **Duplicate names**: Try creating object/field with existing name
2. **Invalid data**: Try saving invalid data (should show validation errors)
3. **Missing required fields**: Leave required fields empty
4. **Corrupt localStorage**: Clear localStorage mid-operation

## Rollback Plan

If you need to rollback to the old system:

1. Change imports back to `ProjectContext.jsx`
2. Revert component changes (use git)
3. The localStorage format is compatible, so no data migration needed

## Performance Considerations

### Before Migration
- Synchronous operations blocked UI thread
- No validation = corrupt data possible
- No error handling = silent failures

### After Migration
- Async operations don't block UI
- Validation prevents corrupt data
- Comprehensive error handling
- Optimistic updates = better perceived performance

## Next Steps: Supabase Migration

Once all components are migrated to the new context, the Supabase migration is straightforward:

```javascript
// In main.jsx or App.jsx

import { createClient } from '@supabase/supabase-js';
import SupabaseAdapter from './services/adapters/SupabaseAdapter';
import { projectRepository } from './services/ProjectRepository';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Switch to Supabase adapter
projectRepository.setAdapter(new SupabaseAdapter(supabase));

// That's it! No component changes needed.
```

## FAQs

**Q: Do I need to change localStorage data format?**
A: No, the new system maintains backward compatibility.

**Q: What happens if validation fails?**
A: The operation is rejected before reaching storage, and validationErrors array is returned.

**Q: How do I show loading spinners?**
A: Use `state.loading` from the context.

**Q: Are optimistic updates safe?**
A: Yes, they automatically rollback if the server operation fails.

**Q: Can I still use dispatch?**
A: Yes, for simple state updates (like client profile), but use async actions for data model operations.

## Support

If you encounter issues during migration:
1. Check the browser console for errors
2. Verify all imports are updated to `ProjectContext-v2`
3. Ensure all handlers are marked `async`
4. Check that you're handling errors properly
