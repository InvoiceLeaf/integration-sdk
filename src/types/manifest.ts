import type { TriggerDefinition } from './triggers.js';
import type { ActionDefinition, ExportDefinition } from './actions.js';
import type { PageDefinition } from './ui.js';
import type { JsonSchema } from './schema.js';
import type { InvocationDefinition } from './invocation.js';

/**
 * Integration Manifest - the main definition file for an integration.
 */
export interface IntegrationManifest {
  /** Unique identifier for the integration (slug format) */
  id: string;

  /** Display name */
  name: string;

  /** Semantic version */
  version: string;

  /** Short description (max 200 chars) */
  description?: string;

  /** Long description (markdown supported) */
  longDescription?: string;

  /** Author information */
  author?: AuthorInfo;

  /** Icon name (generic, e.g. "mail", "book") */
  icon?: string;

  /** URL to the integration's brand icon (used in marketplace and installation UIs) */
  iconUrl?: string;

  /** Primary category for marketplace (singular) */
  category?: IntegrationCategory | string;

  /** Categories for marketplace (multiple) */
  categories?: IntegrationCategory[];

  /** Tags for search */
  tags?: string[];

  /** Data types this integration accesses */
  dataAccess: DataAccessType[];

  /**
   * Privileged host capabilities this integration uses (e.g. `"filing"` for tax
   * filing via the host). Capabilities are granted only to verified (first-party)
   * integrations; declaring one as an unverified integration is rejected at publish.
   */
  capabilities?: string[];

  /** External service authentication configurations */
  externalAuth?: ExternalAuthConfig[];

  /** Trigger definitions */
  triggers: TriggerDefinition[];

  /** Action definitions */
  actions: ActionDefinition[];

  /** Optional platform invocation mappings (operation -> action) */
  invocations?: InvocationDefinition[];

  /** Custom UI pages */
  pages?: PageDefinition[];

  /** Export format definitions */
  exports?: ExportDefinition[];

  /** User configuration schema */
  configSchema?: JsonSchema;

  /** UI configuration */
  ui?: IntegrationUI;

  /** Resource limits */
  limits?: ResourceLimits;
}

export interface AuthorInfo {
  /** Author name */
  name: string;
  /** Author email */
  email?: string;
  /** Author website */
  url?: string;
}

export interface IntegrationUI {
  /** Configuration form layout groups */
  configGroups?: ConfigGroup[];
  /** Setup instructions (markdown) */
  setupInstructions?: string;
}

export interface ConfigGroup {
  /** Group title */
  title: string;
  /** Group description */
  description?: string;
  /** Field names in this group */
  fields: string[];
}

export type IntegrationCategory =
  | 'accounting'
  | 'analytics'
  | 'automation'
  | 'communication'
  | 'crm'
  | 'export'
  | 'file-storage'
  | 'payment'
  | 'tax'
  | 'other';

export type DataAccessType =
  | 'documents'
  | 'companies'
  | 'categories'
  | 'tags'
  | 'exports'
  | 'spaces'
  | 'payment_methods'
  | 'payments';

export interface ExternalAuthConfig {
  /** Provider identifier */
  provider: string;

  /** Display name */
  name: string;

  /** Auth type */
  type: 'oauth2' | 'oauth2.1' | 'api_key';

  /** OAuth2 configuration */
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    scopes: string[];
    pkceRequired?: boolean;
  };

  /** API key configuration */
  apiKey?: {
    /** HTTP header the key is sent in, when the host injects it automatically.
     * Optional: not used for credentials read explicitly via `context.credentials`
     * (e.g. multi-field secrets consumed host-side). */
    headerName?: string;
    prefix?: string;
    instructions?: string;
    /**
     * Optional multi-field credential schema. When present, the setup UI renders one
     * input per field and stores them as a single JSON-encoded object in the one
     * encrypted credential slot for this provider. The plugin (or host) reads them
     * back via `context.credentials.getApiKey(provider)` and JSON-parses the result.
     * Omit for a single opaque key.
     */
    fields?: ApiKeyField[];
  };
}

/** One field of a multi-field `api_key` credential (see {@link ExternalAuthConfig}). */
export interface ApiKeyField {
  /** Stable key used in the stored JSON object (e.g. "tid"). */
  key: string;
  /** Human label shown in the setup form. */
  label: string;
  /** Render as a masked secret input. Defaults to true. */
  secret?: boolean;
  /** Whether the field must be filled in. Defaults to true. */
  required?: boolean;
  /** Optional placeholder shown in the empty input. */
  placeholder?: string;
  /** Optional helper text shown under the field. */
  description?: string;
}

export interface ResourceLimits {
  /** Rate limit per hour */
  rateLimit?: number;

  /** Execution timeout in seconds */
  timeoutSeconds?: number;

  /** Memory limit in MB */
  memoryMb?: number;
}
