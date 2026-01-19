import type { IntegrationManifest } from '../types/manifest.js';

/**
 * Helper function to define an integration manifest with type safety.
 *
 * @example
 * ```typescript
 * const manifest = defineIntegration({
 *   id: 'datev-export',
 *   name: 'DATEV Export',
 *   version: '1.0.0',
 *   dataAccess: ['documents', 'companies'],
 *   triggers: [
 *     {
 *       id: 'export-monthly',
 *       name: 'Monthly Export',
 *       type: 'schedule',
 *       handler: 'onMonthlyExport',
 *       schedule: '0 2 1 * *', // 2 AM on 1st of month
 *     }
 *   ],
 *   actions: [
 *     {
 *       id: 'export-now',
 *       name: 'Export Now',
 *       handler: 'exportToDATEV',
 *     }
 *   ]
 * });
 * ```
 */
export function defineIntegration(manifest: IntegrationManifest): IntegrationManifest {
  // Validate required fields
  if (!manifest.id) {
    throw new Error('Integration manifest must have an id');
  }

  if (!manifest.name) {
    throw new Error('Integration manifest must have a name');
  }

  if (!manifest.version) {
    throw new Error('Integration manifest must have a version');
  }

  if (!manifest.dataAccess || manifest.dataAccess.length === 0) {
    throw new Error('Integration manifest must declare dataAccess');
  }

  if (!manifest.triggers || manifest.triggers.length === 0) {
    if (!manifest.actions || manifest.actions.length === 0) {
      throw new Error('Integration must have at least one trigger or action');
    }
  }

  // Validate trigger handlers
  for (const trigger of manifest.triggers || []) {
    if (!trigger.id) {
      throw new Error('Trigger must have an id');
    }
    if (!trigger.handler) {
      throw new Error(`Trigger ${trigger.id} must have a handler`);
    }
  }

  // Validate action handlers
  for (const action of manifest.actions || []) {
    if (!action.id) {
      throw new Error('Action must have an id');
    }
    if (!action.handler) {
      throw new Error(`Action ${action.id} must have a handler`);
    }
  }

  return manifest;
}
