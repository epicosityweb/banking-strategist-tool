import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../../components/ui/Card';
import FormField from '../../components/ui/FormField';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const FI_TYPES = [
  { value: 'credit_union', label: 'Credit Union' },
  { value: 'community_bank', label: 'Community Bank' },
  { value: 'regional_bank', label: 'Regional Bank' },
  { value: 'national_bank', label: 'National Bank' },
];

const INSTITUTION_SIZES = [
  { value: 'small', label: 'Small (<10K members)' },
  { value: 'medium', label: 'Medium (10-50K members)' },
  { value: 'large', label: 'Large (50-250K members)' },
  { value: 'enterprise', label: 'Enterprise (>250K members)' },
];

const AGE_RANGES = [
  { value: '18-25', label: '18-25' },
  { value: '26-35', label: '26-35' },
  { value: '36-50', label: '36-50' },
  { value: '51-65', label: '51-65' },
  { value: '65+', label: '65+' },
  { value: 'mixed', label: 'Mixed' },
];

const MEMBER_PROFILES = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'mixed', label: 'Mixed' },
];

const PRODUCT_OFFERINGS = [
  { value: 'checking', label: 'Checking Accounts' },
  { value: 'savings', label: 'Savings Accounts' },
  { value: 'cds', label: 'Certificates of Deposit' },
  { value: 'auto_loans', label: 'Auto Loans' },
  { value: 'personal_loans', label: 'Personal Loans' },
  { value: 'mortgages', label: 'Mortgages' },
  { value: 'heloc', label: 'Home Equity Loans/Lines' },
  { value: 'credit_cards', label: 'Credit Cards' },
  { value: 'business_loans', label: 'Business Loans' },
  { value: 'investment_services', label: 'Investment Services' },
];

const CORE_BANKING_SYSTEMS = [
  { value: 'symitar', label: 'Symitar' },
  { value: 'dna', label: 'DNA' },
  { value: 'corelation', label: 'Corelation' },
  { value: 'fis', label: 'FIS' },
  { value: 'jack_henry', label: 'Jack Henry' },
  { value: 'other', label: 'Other' },
];

const HUBSPOT_TIERS = [
  { value: '', label: 'None' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
];

function BasicInformation() {
  const { state, dispatch } = useProject();
  const [formData, setFormData] = useState({
    institutionName: '',
    fiType: '',
    institutionSize: '',
    primaryLocation: '',
    websiteUrl: '',
    totalMemberCount: '',
    newMembersPerMonth: '',
    averageMemberTenure: '',
    primaryAgeRange: '',
    primaryMemberProfile: '',
    productOfferings: [],
    coreBankingSystem: '',
    currentCRM: '',
    currentWebsitePlatform: '',
    analyticsTools: '',
    hubspotAccountId: '',
    marketingHubTier: '',
    salesHubTier: '',
    serviceHubTier: '',
    operationsHubTier: '',
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // Load existing data
  useEffect(() => {
    if (state.clientProfile?.basicInfo) {
      setFormData({ ...formData, ...state.clientProfile.basicInfo });
    }
  }, [state.clientProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => {
        const offerings = checked
          ? [...prev.productOfferings, value]
          : prev.productOfferings.filter((item) => item !== value);
        return { ...prev, productOfferings: offerings };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSaved(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.fiType) {
      newErrors.fiType = 'FI type is required';
    }

    if (!formData.institutionSize) {
      newErrors.institutionSize = 'Institution size is required';
    }

    if (!formData.totalMemberCount || formData.totalMemberCount < 0) {
      newErrors.totalMemberCount = 'Valid member count is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    dispatch({
      type: 'UPDATE_CLIENT_PROFILE',
      payload: {
        basicInfo: formData,
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card title="FI Details" subtitle="Basic information about the financial institution">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Financial Institution Name"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            error={errors.institutionName}
            required
            placeholder="e.g., First Community Credit Union"
            className="md:col-span-2"
          />

          <FormField
            label="FI Type"
            name="fiType"
            type="select"
            value={formData.fiType}
            onChange={handleChange}
            error={errors.fiType}
            required
            options={FI_TYPES}
          />

          <FormField
            label="Institution Size"
            name="institutionSize"
            type="select"
            value={formData.institutionSize}
            onChange={handleChange}
            error={errors.institutionSize}
            required
            options={INSTITUTION_SIZES}
          />

          <FormField
            label="Primary Location"
            name="primaryLocation"
            value={formData.primaryLocation}
            onChange={handleChange}
            placeholder="City, State"
          />

          <FormField
            label="Website URL"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
      </Card>

      <Card title="Member Demographics" subtitle="Information about your member base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Total Member Count"
            name="totalMemberCount"
            type="number"
            value={formData.totalMemberCount}
            onChange={handleChange}
            error={errors.totalMemberCount}
            required
            placeholder="e.g., 25000"
          />

          <FormField
            label="New Members per Month"
            name="newMembersPerMonth"
            type="number"
            value={formData.newMembersPerMonth}
            onChange={handleChange}
            placeholder="e.g., 150"
          />

          <FormField
            label="Average Member Tenure (months)"
            name="averageMemberTenure"
            type="number"
            value={formData.averageMemberTenure}
            onChange={handleChange}
            placeholder="e.g., 84"
          />

          <FormField
            label="Primary Member Age Range"
            name="primaryAgeRange"
            type="select"
            value={formData.primaryAgeRange}
            onChange={handleChange}
            options={AGE_RANGES}
          />

          <FormField
            label="Primary Member Profile"
            name="primaryMemberProfile"
            type="select"
            value={formData.primaryMemberProfile}
            onChange={handleChange}
            options={MEMBER_PROFILES}
            className="md:col-span-2"
          />
        </div>
      </Card>

      <Card title="Product Offerings" subtitle="Select all products your institution offers">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_OFFERINGS.map((product) => (
            <FormField
              key={product.value}
              name="productOfferings"
              type="checkbox"
              value={product.value}
              onChange={handleChange}
              label={product.label}
            />
          ))}
        </div>
      </Card>

      <Card title="Current Technology Stack" subtitle="Existing systems and platforms">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Core Banking System"
            name="coreBankingSystem"
            type="select"
            value={formData.coreBankingSystem}
            onChange={handleChange}
            options={CORE_BANKING_SYSTEMS}
          />

          <FormField
            label="Current CRM/Marketing Platform"
            name="currentCRM"
            value={formData.currentCRM}
            onChange={handleChange}
            placeholder="e.g., None, Salesforce, etc."
          />

          <FormField
            label="Current Website Platform"
            name="currentWebsitePlatform"
            value={formData.currentWebsitePlatform}
            onChange={handleChange}
            placeholder="e.g., WordPress, Drupal, etc."
          />

          <FormField
            label="Analytics Tools"
            name="analyticsTools"
            value={formData.analyticsTools}
            onChange={handleChange}
            placeholder="e.g., Google Analytics, Adobe Analytics"
          />
        </div>
      </Card>

      <Card title="HubSpot Environment" subtitle="Current HubSpot setup (if applicable)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="HubSpot Account ID"
            name="hubspotAccountId"
            value={formData.hubspotAccountId}
            onChange={handleChange}
            placeholder="Optional"
            helpText="For existing HubSpot clients"
            className="md:col-span-2"
          />

          <FormField
            label="Marketing Hub Tier"
            name="marketingHubTier"
            type="select"
            value={formData.marketingHubTier}
            onChange={handleChange}
            options={HUBSPOT_TIERS}
          />

          <FormField
            label="Sales Hub Tier"
            name="salesHubTier"
            type="select"
            value={formData.salesHubTier}
            onChange={handleChange}
            options={HUBSPOT_TIERS}
          />

          <FormField
            label="Service Hub Tier"
            name="serviceHubTier"
            type="select"
            value={formData.serviceHubTier}
            onChange={handleChange}
            options={HUBSPOT_TIERS}
          />

          <FormField
            label="Operations Hub Tier"
            name="operationsHubTier"
            type="select"
            value={formData.operationsHubTier}
            onChange={handleChange}
            options={HUBSPOT_TIERS}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 text-error-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Please fix the errors above</span>
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-success-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">Saved successfully!</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Save Basic Information
        </button>
      </div>
    </div>
  );
}

export default BasicInformation;
