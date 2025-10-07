import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import Card from '../../components/ui/Card';
import FormField from '../../components/ui/FormField';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

const EXPORT_METHODS = [
  { value: 'scheduled_file', label: 'Scheduled File Export' },
  { value: 'api', label: 'API' },
  { value: 'manual', label: 'Manual' },
  { value: 'unknown', label: 'Unknown' },
];

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xml', label: 'XML' },
  { value: 'json', label: 'JSON' },
  { value: 'fixed_width', label: 'Fixed-Width' },
  { value: 'other', label: 'Other' },
];

const EXPORT_FREQUENCIES = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'on_demand', label: 'On-Demand' },
];

const STORAGE_LOCATIONS = [
  { value: 'sftp', label: 'SFTP' },
  { value: 'aws_s3', label: 'AWS S3' },
  { value: 'azure_blob', label: 'Azure Blob Storage' },
  { value: 'google_cloud', label: 'Google Cloud Storage' },
  { value: 'other', label: 'Other' },
];

const DATA_HANDLING_OPTIONS = [
  { value: 'not_exported', label: 'Not Exported' },
  { value: 'hashed', label: 'Hashed at Source' },
  { value: 'encrypted', label: 'Encrypted at Source' },
  { value: 'plain_text', label: 'Plain Text (requires encryption)' },
];

const ACCOUNT_HANDLING = [
  { value: 'masked', label: 'Masked' },
  { value: 'encrypted', label: 'Encrypted' },
  { value: 'plain_text', label: 'Plain Text' },
];

const INTEGRATION_PLATFORMS = [
  { value: 'prismatic', label: 'Prismatic' },
  { value: 'zapier', label: 'Zapier' },
  { value: 'make', label: 'Make' },
  { value: 'workato', label: 'Workato' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'None' },
];

function IntegrationSpecifications() {
  const { state, dispatch } = useProject();
  const [formData, setFormData] = useState({
    exportMethod: '',
    exportFormat: '',
    exportFrequency: '',
    exportTime: '',
    fileStorageLocation: '',
    ssnHandling: '',
    accountNumberHandling: '',
    pciCompliance: false,
    glbaCompliance: false,
    dataRetentionDays: '',
    integrationPlatform: '',
    apiRateLimitsKnown: false,
    realtimeWebhooksAvailable: false,
  });

  const [saved, setSaved] = useState(false);
  const [warnings, setWarnings] = useState([]);

  // Load existing data
  useEffect(() => {
    if (state.clientProfile?.integrationSpecs) {
      setFormData({ ...formData, ...state.clientProfile.integrationSpecs });
    }
  }, [state.clientProfile]);

  // Check for security warnings
  useEffect(() => {
    const newWarnings = [];

    if (formData.ssnHandling === 'plain_text') {
      newWarnings.push('SSN data should be hashed or encrypted before export for security compliance');
    }

    if (formData.accountNumberHandling === 'plain_text') {
      newWarnings.push('Account numbers should be masked or encrypted for PCI/GLBA compliance');
    }

    if (formData.pciCompliance && formData.accountNumberHandling === 'plain_text') {
      newWarnings.push('PCI compliance requires account number protection');
    }

    if (!formData.dataRetentionDays || formData.dataRetentionDays < 1) {
      newWarnings.push('Data retention policy should be specified for compliance');
    }

    setWarnings(newWarnings);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_CLIENT_PROFILE',
      payload: {
        integrationSpecs: formData,
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {warnings.length > 0 && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning-900 mb-2">Security Warnings</h4>
              <ul className="space-y-1 text-sm text-warning-800">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Card title="Export Capabilities" subtitle="How data will be extracted from your core banking system">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Export Method"
            name="exportMethod"
            type="select"
            value={formData.exportMethod}
            onChange={handleChange}
            options={EXPORT_METHODS}
          />

          <FormField
            label="Export Format"
            name="exportFormat"
            type="select"
            value={formData.exportFormat}
            onChange={handleChange}
            options={EXPORT_FORMATS}
          />

          <FormField
            label="Export Frequency"
            name="exportFrequency"
            type="select"
            value={formData.exportFrequency}
            onChange={handleChange}
            options={EXPORT_FREQUENCIES}
          />

          <FormField
            label="Export Time (if scheduled)"
            name="exportTime"
            type="time"
            value={formData.exportTime}
            onChange={handleChange}
            helpText="When does the export run?"
          />

          <FormField
            label="File Storage Location"
            name="fileStorageLocation"
            type="select"
            value={formData.fileStorageLocation}
            onChange={handleChange}
            options={STORAGE_LOCATIONS}
            className="md:col-span-2"
          />
        </div>
      </Card>

      <Card title="Data Security" subtitle="How sensitive data is protected">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="SSN Handling"
            name="ssnHandling"
            type="select"
            value={formData.ssnHandling}
            onChange={handleChange}
            options={DATA_HANDLING_OPTIONS}
            helpText="How are Social Security Numbers protected?"
          />

          <FormField
            label="Account Number Handling"
            name="accountNumberHandling"
            type="select"
            value={formData.accountNumberHandling}
            onChange={handleChange}
            options={ACCOUNT_HANDLING}
            helpText="How are account numbers protected?"
          />

          <FormField
            name="pciCompliance"
            type="checkbox"
            value={formData.pciCompliance}
            onChange={handleChange}
            label="PCI Compliance Required"
            helpText="Payment Card Industry standards apply"
          />

          <FormField
            name="glbaCompliance"
            type="checkbox"
            value={formData.glbaCompliance}
            onChange={handleChange}
            label="GLBA Compliance Required"
            helpText="Gramm-Leach-Bliley Act compliance"
          />

          <FormField
            label="Data Retention Policy (days)"
            name="dataRetentionDays"
            type="number"
            value={formData.dataRetentionDays}
            onChange={handleChange}
            placeholder="e.g., 90"
            helpText="How long data is retained before deletion"
            className="md:col-span-2"
          />
        </div>
      </Card>

      <Card title="Integration Partner" subtitle="iPaaS or middleware platform (if used)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Integration Platform"
            name="integrationPlatform"
            type="select"
            value={formData.integrationPlatform}
            onChange={handleChange}
            options={INTEGRATION_PLATFORMS}
            className="md:col-span-2"
          />

          <FormField
            name="apiRateLimitsKnown"
            type="checkbox"
            value={formData.apiRateLimitsKnown}
            onChange={handleChange}
            label="API Rate Limits Known"
            helpText="Rate limits documented and understood"
          />

          <FormField
            name="realtimeWebhooksAvailable"
            type="checkbox"
            value={formData.realtimeWebhooksAvailable}
            onChange={handleChange}
            label="Real-time Webhooks Available"
            helpText="System supports real-time event triggers"
          />
        </div>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Integration Recommendations</h4>
            <div className="space-y-2 text-sm text-blue-800">
              {formData.exportMethod === 'scheduled_file' && (
                <p>✓ Scheduled file export is the most common and reliable method for banking data</p>
              )}
              {formData.exportFrequency === 'daily' && (
                <p>✓ Daily exports provide a good balance of data freshness and system load</p>
              )}
              {(formData.ssnHandling === 'hashed' || formData.ssnHandling === 'encrypted') && (
                <p>✓ SSN protection meets security best practices</p>
              )}
              {formData.dataRetentionDays && formData.dataRetentionDays >= 90 && (
                <p>✓ 90+ day retention allows for sufficient historical analysis</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        {saved && (
          <div className="flex items-center gap-2 text-success-600 mr-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Saved successfully!</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Save Integration Specifications
        </button>
      </div>
    </div>
  );
}

export default IntegrationSpecifications;
