import type { JsonSchema } from './schema.js';

/**
 * Trigger definition - defines when the integration runs.
 */
export interface TriggerDefinition {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description?: string;

  /** Trigger type */
  type: TriggerType;

  /** Handler function name in the module */
  handler: string;

  /** Event types to listen for (for 'event' type) */
  events?: EventType[];

  /** Cron expression (for 'schedule' type) */
  schedule?: string;

  /** Webhook configuration (for 'webhook' type) */
  webhook?: WebhookConfig;

  /** User action configuration (for 'user_action' type) */
  userAction?: UserActionConfig;

  /** Input schema */
  inputSchema?: JsonSchema;

  /** Output schema */
  outputSchema?: JsonSchema;

  /** Whether the user can enable/disable this trigger (default: true) */
  configurable?: boolean;
}

export type TriggerType = 'webhook' | 'event' | 'schedule' | 'user_action';

export type EventType =
  | 'document.created'
  | 'document.updated'
  | 'document.processed'
  | 'document.deleted'
  | 'company.created'
  | 'company.updated'
  | 'company.deleted'
  | 'export.completed'
  | 'space.member.added'
  | 'space.member.removed';

export interface WebhookConfig {
  /** Path for the webhook endpoint */
  path?: string;

  /** HTTP methods to accept */
  methods?: ('GET' | 'POST' | 'PUT' | 'DELETE')[];

  /** Signature verification */
  signature?: {
    header: string;
    algorithm: 'hmac-sha256' | 'hmac-sha1';
    secretConfigKey: string;
  };
}

export interface UserActionConfig {
  /** Label for the action button */
  label: string;

  /** Icon (emoji or icon name) */
  icon?: string;

  /** Where the action appears */
  placement: ActionPlacement[];

  /** Confirmation message */
  confirmMessage?: string;
}

export type ActionPlacement =
  | 'document-list'
  | 'document-detail'
  | 'company-list'
  | 'company-detail'
  | 'settings'
  | 'toolbar';
