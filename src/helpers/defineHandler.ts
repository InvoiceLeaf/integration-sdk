import type { IntegrationContext } from '../context/IntegrationContext.js';

/**
 * Handler function type.
 */
export type HandlerFunction<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: IntegrationContext
) => Promise<TOutput>;

/**
 * Helper function to define a handler with type safety.
 *
 * @example
 * ```typescript
 * interface ExportInput {
 *   fromDate: string;
 *   toDate: string;
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
 *     context.logger.info('Starting export', { fromDate: input.fromDate });
 *
 *     const documents = await context.data.listDocuments({
 *       fromDate: input.fromDate,
 *       toDate: input.toDate,
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
export function defineHandler<TInput = unknown, TOutput = unknown>(
  handler: HandlerFunction<TInput, TOutput>
): HandlerFunction<TInput, TOutput> {
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
