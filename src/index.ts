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
export type {
  // Email types
  EmailClient,
  EmailAttachmentInput,
  SendSmtpEmailInput,
  SendSmtpEmailResult,
  SmtpImapConnectionTestInput,
  SmtpImapConnectionTestResult,
  ImapPdfAttachment,
  CrawlImapPdfAttachmentsInput,
  CrawlImapPdfAttachmentsResult,
  // Credential types
  CredentialsClient,
  CredentialConnectionInfo,
  // Filing types
  FilingClient,
  FilingValidateInput,
  FilingValidateResult,
  FilingSubmitInput,
  FilingSubmitResult,
  FilingRecord,
  // Mapping types
  MappingsClient,
  MappingRecord,
  MappingGetInput,
  MappingFindByExternalInput,
  MappingUpsertInput,
  // State types
  StateClient,
  // Payment types
  PaymentsClient,
  PaymentListParams,
  PaymentRecord,
  PaymentListResult,
  PaymentAllocationInput,
  PaymentCreateInput,
  PaymentCreateResult,
  // Data types
  DataClient,
  DocumentImportInput,
  DocumentImportResult,
  StructuredDocumentCreateInput,
  StructuredLineItemInput,
  StructuredTaxItemInput,
  CompanyCreateInput,
  CompanyCreateResult,
  DocumentFileContent,
  DocumentIntegrationMetaPatchInput,
  // Logger
  Logger,
} from './context/IntegrationContext.js';

// Helpers
export { defineIntegration } from './helpers/defineIntegration.js';
export { defineHandler } from './helpers/defineHandler.js';
export { createAttachmentFingerprint } from './helpers/createAttachmentFingerprint.js';
export { firstFinite } from './helpers/firstFinite.js';
export { toBoundedInt } from './helpers/toBoundedInt.js';
export { trimToUndefined } from './helpers/trimToUndefined.js';
export { toErrorMessage } from './helpers/toErrorMessage.js';
export { toFiniteNumber } from './helpers/toFiniteNumber.js';
export { toDateOnly, toDateOnlyFromTimestamp } from './helpers/toDateOnly.js';
export {
  requestWithRetry,
  requestResponseWithRetry,
  backoffMs,
  sleep,
  RETRYABLE_STATUSES,
  SAFE_RETRY_STATUSES_FOR_MUTATING,
  DEFAULT_MAX_REQUEST_ATTEMPTS,
  DEFAULT_REQUEST_TIMEOUT_MS,
} from './helpers/httpRetry.js';
export type { RequestWithRetryOptions } from './helpers/httpRetry.js';
export type { AttachmentFingerprintInput } from './helpers/createAttachmentFingerprint.js';
export type {
  HandlerResult,
  IntegrationHandler,
  HandlerFunction,
  DocumentCreatedInput,
  DocumentUpdatedInput,
  DocumentProcessedInput,
  DocumentDeletedInput,
  DocumentEventInput,
  CompanyCreatedInput,
  CompanyUpdatedInput,
  CompanyDeletedInput,
  TagCreatedInput,
  TagUpdatedInput,
  TagDeletedInput,
  CategoryCreatedInput,
  CategoryUpdatedInput,
  CategoryDeletedInput,
  ExportCompletedInput,
  ReminderTriggeredInput,
  SpaceMemberAddedInput,
  SpaceMemberRemovedInput,
  WebhookInput,
  ScheduleInput,
  UserActionInput,
} from './helpers/defineHandler.js';
