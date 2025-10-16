/**
 * Vitest Setup File
 * Sets up global mocks and environment variables for all tests
 */

import { vi } from 'vitest';

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false
  }
});
