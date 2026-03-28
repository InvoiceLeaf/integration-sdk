import type { IntegrationContext } from '../context/IntegrationContext.js';

// ---------------------------------------------------------------------------
// Standard handler result types (INV-1080)
// ---------------------------------------------------------------------------

/**
 * Standard base result shape that all integration handlers should return.
 *
 * Integrations are free to extend this interface with domain-specific fields
 * (e.g. `documentId`, `synced`, `failures`), but every handler result should
 * at minimum include `success` so the runtime can determine outcome without
 * inspecting opaque payloads.
 */
export interface HandlerResult {
  /** Whether the handler completed successfully. */
  success: boolean;
  /** Human-readable summary (present on success or failure). */
  message?: string;
  /** Error description when `success` is false. */
  error?: string;
  /** If true the handler intentionally did no work (e.g. notification disabled). */
  skipped?: boolean;
  /** Machine-readable reason code when `skipped` is true. */
  reason?: string;
  /** Arbitrary structured details the caller may inspect. */
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Handler function types
// ---------------------------------------------------------------------------

/**
 * Handler function type.
 */
export type HandlerFunction<TInput = unknown, TOutput = unknown, TConfig = Record<string, unknown>> = (
  input: TInput,
  context: IntegrationContext<TConfig>
) => Promise<TOutput>;

/**
 * Integration handler type with config generic.
 * Use this to type your handler functions with proper config typing.
 *
 * @example
 * ```typescript
 * interface MyConfig {
 *   apiKey: string;
 *   enabled: boolean;
 * }
 *
 * const myHandler: IntegrationHandler<InputType, OutputType, MyConfig> = async (input, ctx) => {
 *   const { config } = ctx;
 *   // config is typed as MyConfig
 *   return { success: true };
 * };
 * ```
 */
export type IntegrationHandler<TInput = unknown, TOutput = unknown, TConfig = Record<string, unknown>> = (
  input: TInput,
  context: IntegrationContext<TConfig>
) => Promise<TOutput>;

/**
 * Helper function to define a handler with type safety.
 *
 * @example
 * ```typescript
 * interface ExportInput {
 *   startDate: number;
 *   endDate: number;
 *   format: 'csv' | 'xml';
 * }
 *
 * interface ExportOutput {
 *   exportId: string;
 *   documentCount: number;
 * }
 *
 * export const exportToDATEV = defineHandler<ExportInput, ExportOutput>(
 *   async (input, context) => {
 *     context.logger.info('Starting export', { startDate: input.startDate });
 *
 *     const documents = await context.data.listDocuments({
 *       startDate: input.startDate,
 *       endDate: input.endDate,
 *     });
 *
 *     const exportResult = await context.data.createExport({
 *       format: input.format,
 *       documentIds: documents.items.map(d => d.id),
 *     });
 *
 *     return {
 *       exportId: exportResult.id,
 *       documentCount: documents.items.length,
 *     };
 *   }
 * );
 * ```
 */
export function defineHandler<TInput = unknown, TOutput = unknown, TConfig = Record<string, unknown>>(
  handler: HandlerFunction<TInput, TOutput, TConfig>
): HandlerFunction<TInput, TOutput, TConfig> {
  return handler;
}

/**
 * Event handler input types for built-in events.
 *
 * Each input shape matches the normalized payload produced by the backend
 * IntegrationEventDispatcher.normalizeEventPayload(). All event payloads
 * include a `spaceId` field identifying the workspace where the event occurred.
 */

// ---------------------------------------------------------------------------
// Document events
// ---------------------------------------------------------------------------

export interface DocumentCreatedInput {
  documentId: string;
  document: {
    id: string;
    fileName: string;
    status: string;
    companyId?: string;
    categoryId?: string;
  };
  spaceId: string;
}

export interface DocumentUpdatedInput {
  documentId: string;
  document: {
    id: string;
    fileName: string;
    status: string;
  };
  changes: string[];
  spaceId: string;
}

export interface DocumentProcessedInput {
  documentId: string;
  document: {
    id: string;
    fileName: string;
    status: string;
    invoiceNumber?: string;
    totalAmount?: number;
    currency?: string;
  };
  spaceId: string;
}

export interface DocumentDeletedInput {
  documentId: string;
  spaceId: string;
}

/**
 * Generic document event input for sync-on-event handlers.
 * Supports both direct invocation (`documentId` at top level)
 * and event payload shape (`document.id` nested).
 */
export interface DocumentEventInput {
  documentId?: string;
  document?: {
    id?: string;
  };
  spaceId?: string;
}

// ---------------------------------------------------------------------------
// Company events
// ---------------------------------------------------------------------------

export interface CompanyCreatedInput {
  companyId: string;
  company: {
    id: string;
    name: string;
    taxId?: string;
  };
  spaceId: string;
}

export interface CompanyUpdatedInput {
  companyId: string;
  company: {
    id: string;
    name: string;
    taxId?: string;
  };
  spaceId: string;
}

export interface CompanyDeletedInput {
  companyId: string;
  spaceId: string;
}

// ---------------------------------------------------------------------------
// Tag events
// ---------------------------------------------------------------------------

export interface TagCreatedInput {
  tagId: string;
  tag: {
    id: string;
    name: string;
  };
  spaceId: string;
}

export interface TagUpdatedInput {
  tagId: string;
  tag: {
    id: string;
    name: string;
  };
  spaceId: string;
}

export interface TagDeletedInput {
  tagId: string;
  spaceId: string;
}

// ---------------------------------------------------------------------------
// Category events
// ---------------------------------------------------------------------------

export interface CategoryCreatedInput {
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  spaceId: string;
}

export interface CategoryUpdatedInput {
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  spaceId: string;
}

export interface CategoryDeletedInput {
  categoryId: string;
  spaceId: string;
}

// ---------------------------------------------------------------------------
// Export events
// ---------------------------------------------------------------------------

export interface ExportCompletedInput {
  exportId: string;
  export: {
    id: string;
    format: string;
    status: string;
    downloadUrl?: string;
    documentCount?: number;
  };
  spaceId: string;
}

// ---------------------------------------------------------------------------
// Reminder events
// ---------------------------------------------------------------------------

export interface ReminderTriggeredInput {
  reminderId: string;
  occurrenceId: string;
  spaceId: string;
  userId: string;
  title?: string;
  scheduledFor: number;
  triggeredAt: number;
  messageText: string;
  metadata?: {
    scheduleType?: 'one_time' | 'rrule' | string;
    aiMode?: 'off' | 'light_rewrite' | 'tool_enabled' | string;
  };
}

// ---------------------------------------------------------------------------
// Space member events
// ---------------------------------------------------------------------------

export interface SpaceMemberAddedInput {
  memberId: string;
  member: {
    id: string;
    userId?: string;
    role?: string;
  };
  spaceId: string;
}

export interface SpaceMemberRemovedInput {
  memberId: string;
  member: {
    id: string;
    userId?: string;
    role?: string;
  };
  spaceId: string;
}

export interface WebhookInput {
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  method: string;
  path: string;
}

export interface ScheduleInput {
  scheduledTime: string;
  lastRunTime?: string;
}

export interface UserActionInput {
  actionId: string;
  targetId?: string;
  targetType?: 'document' | 'company' | 'export';
  selectedIds?: string[];
}
