import type { JsonSchema } from './schema.js';

/**
 * Action definition - defines callable operations.
 */
export interface ActionDefinition {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description?: string;

  /** Handler function name in the module */
  handler: string;

  /** Icon identifier (emoji or icon name) */
  icon?: string;

  /** Input schema */
  inputSchema?: JsonSchema;

  /** Output schema */
  outputSchema?: JsonSchema;

  /** Whether this action should be hidden from UI */
  internal?: boolean;
}

/**
 * Export definition - defines export formats.
 */
export interface ExportDefinition {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description?: string;

  /** File format */
  format: ExportFormat;

  /** Handler function name */
  handler: string;

  /** File extension */
  extension?: string;

  /** MIME type */
  mimeType?: string;
}

export type ExportFormat = 'csv' | 'xml' | 'json' | 'pdf' | 'xlsx' | 'custom';
