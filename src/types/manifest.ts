import type { TriggerDefinition } from './triggers.js';
import type { ActionDefinition, ExportDefinition } from './actions.js';
import type { PageDefinition } from './ui.js';
import type { JsonSchema } from './schema.js';

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

  /** Icon URL or emoji */
  icon?: string;

  /** Primary category for marketplace (singular) */
  category?: IntegrationCategory | string;

  /** Categories for marketplace (multiple) */
  categories?: IntegrationCategory[];

  /** Tags for search */
  tags?: string[];

  /** Data types this integration accesses */
  dataAccess: DataAccessType[];

  /** External service authentication configurations */
  externalAuth?: ExternalAuthConfig[];

  /** Trigger definitions */
  triggers: TriggerDefinition[];

  /** Action definitions */
  actions: ActionDefinition[];

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
  | 'spaces';

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
    headerName: string;
    prefix?: string;
    instructions?: string;
  };
}

export interface ResourceLimits {
  /** Rate limit per hour */
  rateLimit?: number;

  /** Execution timeout in seconds */
  timeoutSeconds?: number;

  /** Memory limit in MB */
  memoryMb?: number;
}
