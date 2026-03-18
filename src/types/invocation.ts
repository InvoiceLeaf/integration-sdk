/**
 * Invocation source identifiers for platform-driven action dispatch.
 */
export type InvocationSource =
  | 'telegram.callback'
  | 'slack.interaction'
  | 'discord.component'
  | 'whatsapp.interactive'
  | 'messenger.postback'
  | 'webhook.callback';

/**
 * Invocation definition - maps an external platform operation to an action.
 */
export interface InvocationDefinition {
  /** Unique identifier */
  id: string;

  /** External source producing the invocation */
  source: InvocationSource;

  /** Operation name from that source (e.g., "mark_paid") */
  operation: string;

  /** Action ID in the integration manifest that should be executed */
  actionId: string;

  /** Whether the caller must be mapped to a linked platform user */
  requiresLinkedUser?: boolean;
}
