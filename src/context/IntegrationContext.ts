import type {
  Document,
  Company,
  Category,
  Tag,
  Export,
  DocumentListParams,
  ListParams,
  ListResult,
} from './types.js';

/**
 * Integration Context - the main interface for plugins to interact with InvoiceLeaf.
 *
 * This context is automatically injected when your handler function is called.
 * It provides access to:
 * - InvoiceLeaf data (documents, companies, categories, tags)
 * - External service credentials (OAuth tokens, API keys)
 * - Structured logging
 * - User-provided configuration
 */
export interface IntegrationContext {
  /** Current space ID */
  readonly spaceId: string;

  /** Current user ID (who triggered the execution) */
  readonly userId: string;

  /** Installation ID */
  readonly installationId: string;

  /** User-provided configuration */
  readonly config: Record<string, unknown>;

  /** Data access client */
  readonly data: DataClient;

  /** Credential access client */
  readonly credentials: CredentialsClient;

  /** Structured logger */
  readonly logger: Logger;
}

/**
 * Client for accessing InvoiceLeaf data.
 * All operations are scoped to the current space.
 */
export interface DataClient {
  /**
   * List documents with optional filters.
   */
  listDocuments(params?: DocumentListParams): Promise<ListResult<Document>>;

  /**
   * Get a document by ID.
   */
  getDocument(id: string): Promise<Document>;

  /**
   * List companies.
   */
  listCompanies(params?: ListParams): Promise<ListResult<Company>>;

  /**
   * Get a company by ID.
   */
  getCompany(id: string): Promise<Company>;

  /**
   * List all categories.
   */
  listCategories(): Promise<Category[]>;

  /**
   * Get a category by ID.
   */
  getCategory(id: string): Promise<Category>;

  /**
   * List all tags.
   */
  listTags(): Promise<Tag[]>;

  /**
   * Create an export job.
   */
  createExport(params: {
    format: string;
    documentIds?: string[];
    filters?: DocumentListParams;
  }): Promise<Export>;

  /**
   * Get export status by ID.
   */
  getExport(id: string): Promise<Export>;
}

/**
 * Client for accessing external service credentials.
 */
export interface CredentialsClient {
  /**
   * Get OAuth2 access token for a provider.
   * Automatically refreshes if expired.
   */
  getAccessToken(provider: string): Promise<string>;

  /**
   * Get API key for a provider.
   */
  getApiKey(provider: string): Promise<string>;

  /**
   * Force refresh OAuth2 token.
   */
  refreshToken(provider: string): Promise<string>;
}

/**
 * Structured logger for execution.
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

// Re-export types for convenience
export type {
  Document,
  Company,
  Category,
  Tag,
  Export,
  DocumentListParams,
  ListParams,
  ListResult,
} from './types.js';
