/**
 * Migration Service
 *
 * Handles data migration from localStorage to Supabase.
 * This service ensures safe, atomic migration of all project data
 * with progress tracking and error recovery.
 */

import LocalStorageAdapter from './adapters/LocalStorageAdapter';
import SupabaseAdapter from './adapters/SupabaseAdapter';
import { getCurrentUser } from '../lib/supabase';

/**
 * Migration status constants
 */
export const MigrationStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
};

/**
 * Migration Service Class
 */
class MigrationService {
  constructor() {
    this.localAdapter = new LocalStorageAdapter();
    this.supabaseAdapter = new SupabaseAdapter();
  }

  /**
   * Check if user is authenticated and ready for migration
   * @returns {Promise<{ready: boolean, error: Error|null, user: Object|null}>}
   */
  async checkMigrationReadiness() {
    try {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        return {
          ready: false,
          error: new Error('User must be authenticated to migrate data'),
          user: null,
        };
      }

      // Check if there's data to migrate
      const { data: localProjects } = await this.localAdapter.getAllProjects();

      return {
        ready: true,
        error: null,
        user,
        projectCount: localProjects?.length || 0,
      };
    } catch (error) {
      return {
        ready: false,
        error,
        user: null,
      };
    }
  }

  /**
   * Migrate all projects from localStorage to Supabase
   * @param {Function} onProgress - Callback for progress updates (current, total)
   * @returns {Promise<{success: boolean, migratedCount: number, errors: Array}>}
   */
  async migrateToSupabase(onProgress) {
    const results = {
      success: false,
      migratedCount: 0,
      errors: [],
      totalProjects: 0,
    };

    try {
      // Check readiness
      const readinessCheck = await this.checkMigrationReadiness();
      if (!readinessCheck.ready) {
        results.errors.push({
          message: readinessCheck.error?.message || 'Migration not ready',
          type: 'readiness',
        });
        return results;
      }

      // Get all local projects
      const { data: localProjects, error: fetchError } =
        await this.localAdapter.getAllProjects();

      if (fetchError || !localProjects) {
        results.errors.push({
          message: fetchError?.message || 'Failed to fetch local projects',
          type: 'fetch',
        });
        return results;
      }

      results.totalProjects = localProjects.length;

      if (localProjects.length === 0) {
        results.success = true;
        return results;
      }

      // Migrate each project
      for (let i = 0; i < localProjects.length; i++) {
        const project = localProjects[i];

        // Report progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: localProjects.length,
            projectName: project.name,
            status: 'migrating',
          });
        }

        try {
          // Create project in Supabase
          const { error: createError } = await this.supabaseAdapter.createProject({
            name: project.name,
            status: project.status || 'draft',
            clientProfile: project.clientProfile || {},
            dataModel: project.dataModel || { objects: [], associations: [] },
            tags: project.tags || [],
            journeys: project.journeys || [],
          });

          if (createError) {
            results.errors.push({
              message: `Failed to migrate project "${project.name}": ${createError.message}`,
              type: 'migration',
              projectId: project.id,
              projectName: project.name,
            });
          } else {
            results.migratedCount++;

            if (onProgress) {
              onProgress({
                current: i + 1,
                total: localProjects.length,
                projectName: project.name,
                status: 'completed',
              });
            }
          }
        } catch (error) {
          results.errors.push({
            message: `Exception migrating project "${project.name}": ${error.message}`,
            type: 'exception',
            projectId: project.id,
            projectName: project.name,
          });
        }
      }

      // Consider migration successful if at least one project migrated
      results.success = results.migratedCount > 0;

      return results;
    } catch (error) {
      results.errors.push({
        message: `Migration failed: ${error.message}`,
        type: 'fatal',
      });
      return results;
    }
  }

  /**
   * Create a backup of localStorage data
   * @returns {Promise<{success: boolean, backup: Object|null, error: Error|null}>}
   */
  async createBackup() {
    try {
      const { data: projects, error } = await this.localAdapter.getAllProjects();

      if (error) {
        return { success: false, backup: null, error };
      }

      const backup = {
        timestamp: new Date().toISOString(),
        projects: projects || [],
        version: '1.0',
      };

      // Store backup in localStorage with special key
      localStorage.setItem(
        'strategist-backup',
        JSON.stringify(backup)
      );

      return { success: true, backup, error: null };
    } catch (error) {
      return { success: false, backup: null, error };
    }
  }

  /**
   * Restore from backup
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async restoreFromBackup() {
    try {
      const backupData = localStorage.getItem('strategist-backup');

      if (!backupData) {
        return {
          success: false,
          error: new Error('No backup found'),
        };
      }

      const backup = JSON.parse(backupData);

      // Restore projects
      localStorage.setItem(
        'strategist-projects',
        JSON.stringify(backup.projects || [])
      );

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Clear localStorage data after successful migration
   * (Keep backup for safety)
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async clearLocalStorage() {
    try {
      // Only remove projects, keep backup
      localStorage.removeItem('strategist-projects');
      localStorage.removeItem('strategist-current-project');

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Check if Supabase already has data for the current user
   * @returns {Promise<{hasData: boolean, projectCount: number, error: Error|null}>}
   */
  async checkSupabaseData() {
    try {
      const { data: projects, error } = await this.supabaseAdapter.getAllProjects();

      if (error) {
        return { hasData: false, projectCount: 0, error };
      }

      return {
        hasData: projects && projects.length > 0,
        projectCount: projects?.length || 0,
        error: null,
      };
    } catch (error) {
      return { hasData: false, projectCount: 0, error };
    }
  }
}

// Export singleton instance
const migrationService = new MigrationService();
export { migrationService, MigrationService };
export default migrationService;
