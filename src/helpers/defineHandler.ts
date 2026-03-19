import type { IntegrationContext } from '../context/IntegrationContext.js';

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
 */
export interface DocumentCreatedInput {
  documentId: string;
  document: {
    id: string;
    fileName: string;
    status: string;
    companyId?: string;
    categoryId?: string;
  };
}

export interface DocumentUpdatedInput {
  documentId: string;
  document: {
    id: string;
    fileName: string;
    status: string;
  };
  changes: string[];
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
}

export interface DocumentDeletedInput {
  documentId: string;
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
}

export interface CompanyCreatedInput {
  companyId: string;
  company: {
    id: string;
    name: string;
    taxId?: string;
  };
}

export interface ExportCompletedInput {
  exportId: string;
  export: {
    id: string;
    format: string;
    status: string;
    downloadUrl?: string;
    documentCount?: number;
  };
}

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
