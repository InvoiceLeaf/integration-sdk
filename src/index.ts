/**
 * @invoiceleaf/integration-sdk
 *
 * SDK for building InvoiceLeaf integrations.
 *
 * @example
 * ```typescript
 * import { defineIntegration, IntegrationContext } from '@invoiceleaf/integration-sdk';
 *
 * const manifest = defineIntegration({
 *   id: 'my-integration',
 *   name: 'My Integration',
 *   version: '1.0.0',
 *   dataAccess: ['documents', 'companies'],
 *   triggers: [...],
 *   actions: [...]
 * });
 *
 * export async function onDocumentCreated(
 *   input: { documentId: string },
 *   context: IntegrationContext
 * ) {
 *   const doc = await context.data.getDocument(input.documentId);
 *   context.logger.info('Document created', { doc });
 *   return { success: true };
 * }
 * ```
 */

// Types
export * from './types/index.js';

// Context
export * from './context/index.js';

// Helpers
export { defineIntegration } from './helpers/defineIntegration.js';
export { defineHandler } from './helpers/defineHandler.js';
export { createAttachmentFingerprint } from './helpers/createAttachmentFingerprint.js';
export type { AttachmentFingerprintInput } from './helpers/createAttachmentFingerprint.js';
export type {
  IntegrationHandler,
  HandlerFunction,
  DocumentCreatedInput,
  DocumentUpdatedInput,
  DocumentProcessedInput,
  DocumentDeletedInput,
  CompanyCreatedInput,
  ExportCompletedInput,
  ReminderTriggeredInput,
  WebhookInput,
  ScheduleInput,
  UserActionInput,
} from './helpers/defineHandler.js';
