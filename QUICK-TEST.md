# Quick Migration Test

## Step 1: Copy This Command

**Paste this in your browser console (F12 → Console tab):**

```javascript
localStorage.setItem("strategist-projects", JSON.stringify([{
  "id": "test-project-001",
  "name": "Test Credit Union - Migration Test",
  "status": "active",
  "clientProfile": {
    "basicInfo": {
      "institutionName": "Test Credit Union",
      "fiType": "credit_union",
      "institutionSize": "medium",
      "primaryLocation": "California",
      "websiteUrl": "https://testcu.example.com",
      "totalMemberCount": "50000",
      "newMembersPerMonth": "500",
      "averageMemberTenure": "8",
      "primaryAgeRange": "35-54",
      "primaryMemberProfile": "Working professionals",
      "productOfferings": ["Checking", "Savings", "Loans", "Credit Cards"],
      "coreBankingSystem": "FIS",
      "currentCRM": "Salesforce",
      "currentWebsitePlatform": "WordPress",
      "analyticsTools": "Google Analytics",
      "hubspotAccountId": "12345678",
      "marketingHubTier": "Professional",
      "salesHubTier": "Professional",
      "serviceHubTier": "Starter",
      "operationsHubTier": "Starter"
    },
    "integrationSpecs": {
      "exportMethod": "API",
      "exportFormat": "JSON",
      "exportFrequency": "daily",
      "exportTime": "02:00",
      "fileStorageLocation": "Secure SFTP",
      "ssnHandling": "encrypted",
      "accountNumberHandling": "masked",
      "pciCompliance": true,
      "glbaCompliance": true,
      "dataRetentionDays": "2555",
      "integrationPlatform": "HubSpot",
      "apiRateLimitsKnown": true,
      "realtimeWebhooksAvailable": true
    }
  },
  "dataModel": { "objects": [], "fields": [], "mappings": [], "associations": [] },
  "tags": { "library": [], "custom": [] },
  "journeys": []
}]));

console.log("✅ Test data loaded! Now refresh the page or log in.");
```

## Step 2: Refresh the Page

After pasting the command above, either:
- Refresh the page (F5), OR
- If you're not logged in, log in now

## Step 3: See the Migration Prompt

You should see a beautiful modal that says:
**"🔷 Migrate to Cloud Storage"**

## Step 4: Click "Migrate Now"

Watch the progress:
- ⏱️ Spinning loader appears
- ✅ Success message with green checkmark
- 📊 "1 project migrated to cloud storage"
- ♻️ Page auto-reloads

## Step 5: Verify in Supabase

1. Go to https://supabase.com
2. Open project: **Banking Journey Strategist**
3. Click **Table Editor** → **implementations** table
4. Find the row where `id = 'test-project-001'`
5. Click on the row to see data
6. Check the **data** column (JSONB)
7. Expand `data.clientProfile.basicInfo` - should see all 20 fields
8. Expand `data.clientProfile.integrationSpecs` - should see all 13 fields

## Clean Up

After testing, remove the test data:

**In browser console:**
```javascript
localStorage.removeItem("strategist-projects");
console.log("✅ Test data removed from localStorage");
```

**In Supabase:**
- Go to Table Editor → implementations
- Find row with `id = 'test-project-001'`
- Click trash icon to delete

---

## Troubleshooting

**Problem:** Migration prompt doesn't appear
- **Solution:** Make sure you're logged in. Log out and back in after setting localStorage.

**Problem:** "Authentication check failed"
- **Solution:** You need to be logged in. The prompt only shows for authenticated users.

**Problem:** Can't find project in Supabase
- **Solution:** Check if migration succeeded. Look for the success message with green checkmark.

---

## What This Tests

✅ Authentication verification (Issue #2)
✅ Data validation with Zod (Issue #3)
✅ Successful migration to Supabase (Issues #1-10)
✅ UI feedback and user experience
✅ All 33 Client Profile fields preserved

The data goes **FROM localStorage TO Supabase cloud database**! 🚀
