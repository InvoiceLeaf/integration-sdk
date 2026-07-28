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
 *
 * @typeParam TConfig - The configuration type for your integration
 *
 * @example
 * ```typescript
 * interface MyConfig {
 *   webhookUrl: string;
 *   enabled: boolean;
 * }
 *
 * async function myHandler(input: Input, ctx: IntegrationContext<MyConfig>) {
 *   const { webhookUrl, enabled } = ctx.config;
 *   // config is typed as MyConfig
 * }
 * ```
 */
export interface IntegrationContext<TConfig = Record<string, unknown>> {
  /** Current space ID */
  readonly spaceId: string;

  /** Current user ID (who triggered the execution) */
  readonly userId: string;

  /** Installation ID */
  readonly installationId: string;

  /**
   * User-provided configuration.
   *
   * This is typed as `Partial<TConfig>` because the installation may not have
   * all configuration fields populated. Always check for the presence of
   * required fields before using them.
   */
  readonly config: Partial<TConfig>;

  /** Data access client */
  readonly data: DataClient;

  /** Credential access client */
  readonly credentials: CredentialsClient;

  /** External system mapping client */
  readonly mappings: MappingsClient;

  /**
   * Payment access client (list payments, record payments with document
   * allocations). Requires the `payments` dataAccess scope.
   */
  readonly payments: PaymentsClient;

  /** Installation-scoped state storage client */
  readonly state: StateClient;

  /** Email transport and mailbox operations */
  readonly email: EmailClient;

  /**
   * Privileged tax-filing capability (validate / submit via the host).
   *
   * Only present for verified integrations that have been granted the `filing`
   * capability; enforcement is server-side. Plugins must guard usage with a
   * presence check (`if (context.filing) { ... }`).
   */
  readonly filing?: FilingClient;

  /** Structured logger */
  readonly logger: Logger;
}

/**
 * Client for accessing InvoiceLeaf data.
 * All operations are scoped to the current space.
 *
 * **Error handling contract:** All methods throw on failure (network errors,
 * API errors, invalid requests). Methods that semantically return "not found"
 * (e.g. {@link StateClient.get}, {@link MappingsClient.get}) return `null`
 * on success when no record exists — they only throw on transport/server errors.
 * Plugins should use try/catch for operations where graceful degradation is
 * preferred over hard failure (e.g. checkpoint reads, deduplication checks).
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
   * Get original file content for a document.
   */
  getDocumentFile(id: string): Promise<DocumentFileContent>;

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
   * Get a tag by ID.
   */
  getTag(id: string): Promise<Tag>;

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
    /** Output filename (without extension) */
    filename?: string;
    /** Currency code for the export (e.g. "EUR", "USD") */
    currency?: string;
    /** Report type identifier */
    report?: number;
  }): Promise<Export>;

  /**
   * Get export status by ID.
   */
  getExport(id: string): Promise<Export>;

  /**
   * Import a file as a new document.
   *
   * The file runs through InvoiceLeaf's normal OCR/AI processing pipeline.
   * For invoices whose structured data is already known from the external
   * API, prefer {@link createStructuredDocument}.
   */
  importDocument(input: DocumentImportInput): Promise<DocumentImportResult>;

  /**
   * Create a fully structured document (line items, amounts, parties already
   * known) that skips the OCR/AI processing pipeline entirely. An original
   * file (e.g. the provider's PDF) can optionally be attached as-is.
   *
   * Deduplicates against previous structured creates AND file imports via
   * `externalRef` (shared namespace).
   */
  createStructuredDocument(input: StructuredDocumentCreateInput): Promise<DocumentImportResult>;

  /**
   * Create a company in the space. Used to resolve external customers or
   * vendors to InvoiceLeaf companies before creating structured documents.
   */
  createCompany(input: CompanyCreateInput): Promise<CompanyCreateResult>;

  /**
   * Patch integration sync metadata for a document.
   */
  patchDocumentIntegrationMeta(input: DocumentIntegrationMetaPatchInput): Promise<void>;
}

export interface DocumentImportInput {
  fileName: string;
  contentType: string;
  contentBase64: string;
  source: string;
  description?: string;
  externalRef?: string;
  categoryId?: string;
  tagIds?: string[];
  dedupeTtlSeconds?: number;
}

export interface DocumentImportResult {
  documentId: string;
  duplicate: boolean;
}

export interface StructuredLineItemInput {
  name?: string;
  quantity?: string | number;
  unitCode?: string;
  unitAmount?: string | number;
  /** Tax rate percentage in range 0-100. */
  taxPercentage?: string | number;
  netAmount?: string | number;
  taxAmount?: string | number;
  totalAmount?: string | number;
}

export interface StructuredTaxItemInput {
  name?: string;
  /** Tax rate percentage in range 0-100. */
  taxPercentage?: string | number;
  netAmount?: string | number;
  taxAmount?: string | number;
}

export interface StructuredDocumentCreateInput {
  /** Integration source slug, e.g. "stripe". */
  source: string;
  /** Stable provider-side reference used for server-side deduplication. */
  externalRef?: string;
  dedupeTtlSeconds?: number;
  description?: string;
  categoryId?: string;
  tagIds?: string[];
  /** Invoice number. */
  invoiceId?: string;
  /** ISO date. */
  invoiceDate?: string;
  /** ISO date. */
  dueDate?: string;
  /** Currency code, e.g. "EUR". */
  currency?: string;
  /** RECEIVABLE | PAYABLE | UNKNOWN. */
  accountingType?: string;
  documentStatus?: string;
  supplierId?: string;
  receiverId?: string;
  netAmount?: string | number;
  taxAmount?: string | number;
  totalAmount?: string | number;
  amountDue?: string | number;
  lineItems?: StructuredLineItemInput[];
  taxItems?: StructuredTaxItemInput[];
  /** Optional original file to store as-is (no processing). */
  fileName?: string;
  contentType?: string;
  contentBase64?: string;
}

export interface CompanyCreateInput {
  name: string;
  displayName?: string;
  email?: string;
  phone?: string;
  url?: string;
  street?: string;
  addressLine2?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  countryIso?: string;
  vatId?: string;
  taxNumber?: string;
}

export interface CompanyCreateResult {
  companyId: string;
  name: string;
}

export interface DocumentFileContent {
  documentId: string;
  fileName?: string;
  contentType?: string;
  contentBase64: string;
  sizeBytes?: number;
}

export interface DocumentIntegrationMetaPatchInput {
  documentId: string;
  system: string;
  externalId?: string;
  status?: string;
  lastSyncedAt?: string;
  errorSummary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Client for reading and recording payments.
 *
 * Payments created here land in the space's accounting model: a payment with
 * allocations marks the allocated documents as PARTIAL/PAID automatically,
 * while a payment without allocations is created UNMATCHED for the user to
 * reconcile manually.
 *
 * Requires the `payments` dataAccess scope in the manifest.
 */
export interface PaymentsClient {
  /**
   * List payments in the space.
   */
  list(params?: PaymentListParams): Promise<PaymentListResult>;

  /**
   * Record a payment, optionally allocating it to documents in the same call.
   *
   * Pass a stable `externalRef` (e.g. `stripe:charge:ch_123`) to make the call
   * idempotent: retries return the previously created payment with
   * `duplicate: true` instead of creating a second one.
   */
  create(input: PaymentCreateInput): Promise<PaymentCreateResult>;
}

export interface PaymentListParams {
  /** Filter by company. */
  companyId?: string;
  /** Start date (ISO date, inclusive). */
  startDate?: string;
  /** End date (ISO date, inclusive). */
  endDate?: string;
  /** Filter by payment status (UNMATCHED | MATCHED | POSTED). */
  statuses?: string[];
  /** Filter by currency code. */
  currency?: string;
  page?: number;
  limit?: number;
}

export interface PaymentRecord {
  id: string;
  companyId?: string;
  /** ISO date. */
  paymentDate?: string;
  /** Decimal amount serialized as string to preserve precision. */
  amount?: string | number;
  currency?: string;
  paymentMethodId?: string;
  reference?: string;
  bankAccount?: string;
  /** UNMATCHED | MATCHED | POSTED. */
  status?: string;
  /** INCOMING | OUTGOING. */
  direction?: string;
  notes?: string;
}

export interface PaymentListResult {
  items: PaymentRecord[];
  page: number;
  limit: number;
  hasMore: boolean;
  totalAmount?: string | number;
  totalAllocated?: string | number;
  totalUnallocated?: string | number;
}

export interface PaymentAllocationInput {
  /** InvoiceLeaf document to allocate against. */
  documentId: string;
  /** Positive decimal amount; pass a string to preserve precision. */
  amount: string | number;
}

export interface PaymentCreateInput {
  /** ISO date the payment was made. */
  paymentDate: string;
  /** Positive decimal amount; pass a string to preserve precision. */
  amount: string | number;
  /** Currency code, e.g. "EUR". */
  currency: string;
  /** INCOMING (default) or OUTGOING. */
  direction?: string;
  companyId?: string;
  paymentMethodId?: string;
  /** Human-readable payment reference (e.g. provider transaction id). */
  reference?: string;
  bankAccount?: string;
  notes?: string;
  /** Stable provider-side reference used for server-side deduplication. */
  externalRef?: string;
  /** TTL for the dedupe marker; defaults to 90 days. */
  dedupeTtlSeconds?: number;
  /** Documents to allocate this payment against. Sum must not exceed amount. */
  allocations?: PaymentAllocationInput[];
}

export interface PaymentCreateResult {
  paymentId: string;
  /** True when externalRef matched a previously recorded payment. */
  duplicate: boolean;
  /** Payment status after creation/allocation (UNMATCHED | MATCHED). */
  status?: string;
  /** Set when the payment was created but allocation failed. */
  allocationError?: string;
}

export interface StateClient {
  /**
   * Read installation-scoped state value by key.
   * Returns `null` when the key does not exist. Throws on transport/server errors.
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Persist installation-scoped state value.
   */
  set<T = unknown>(key: string, value: T, opts?: { ttlSeconds?: number }): Promise<void>;

  /**
   * Delete installation-scoped state value by key.
   */
  delete(key: string): Promise<void>;
}

export interface EmailAttachmentInput {
  fileName: string;
  contentType?: string;
  contentBase64: string;
}

export interface SendSmtpEmailInput {
  fromAddress?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachmentInput[];
}

export interface SendSmtpEmailResult {
  messageId: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
}

export interface SmtpImapConnectionTestInput {
  imapFolder?: string;
}

export interface SmtpImapConnectionTestResult {
  smtp: boolean;
  imap: boolean;
  smtpError?: string;
  imapError?: string;
}

export interface ImapPdfAttachment {
  uid: number;
  fileName: string;
  contentType: string;
  contentBase64: string;
  checksum: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface CrawlImapPdfAttachmentsInput {
  imapFolder?: string;
  searchFilter?: string;
  maxMessagesPerRun?: number;
  maxAttachmentsPerMessage?: number;
  markAsSeen?: boolean;
  moveToFolder?: string;
}

export interface CrawlImapPdfAttachmentsResult {
  messages: number;
  attachments: number;
  items: ImapPdfAttachment[];
}

export interface EmailClient {
  sendSmtpEmail(input: SendSmtpEmailInput): Promise<SendSmtpEmailResult>;
  testSmtpImapConnection(input: SmtpImapConnectionTestInput): Promise<SmtpImapConnectionTestResult>;
  crawlImapPdfAttachments(input: CrawlImapPdfAttachmentsInput): Promise<CrawlImapPdfAttachmentsResult>;
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

  /**
   * Get non-secret connection metadata for a provider.
   */
  getConnectionInfo(provider: string): Promise<CredentialConnectionInfo>;
}

export interface CredentialConnectionInfo {
  connected: boolean;
  provider: string;
  credentialType?: 'oauth2' | 'api_key';
  accountEmail?: string;
  accountId?: string;
  accountName?: string;
  scopes?: string[];
  expiresAt?: string;
  valid?: boolean;
  errorMessage?: string;
}

/**
 * Privileged client for tax filing (e.g. ELSTER via the native ERiC service).
 *
 * Granted only to verified integrations with the `filing` capability. The
 * sandbox builds and passes the transfer XML; certificate bytes and PIN never
 * enter the isolate — the plugin references the customer's certificate by a
 * stable handle and the host performs the native call.
 */
export interface FilingClient {
  /**
   * Validate a built transfer XML against the filing schema without sending it.
   * Runs in test mode by default.
   */
  validate(input: FilingValidateInput): Promise<FilingValidateResult>;

  /**
   * Submit a built transfer XML to the tax authority using the customer's
   * stored certificate (referenced by handle). Irreversible in production mode.
   */
  submit(input: FilingSubmitInput): Promise<FilingSubmitResult>;

  /**
   * Open a filing whose transport runs inside this sandbox rather than host side
   * (FinanzOnline, where the SOAP client is bundled with the plugin).
   *
   * The host verifies that the period was approved for these figures and that it
   * has not been filed already, then opens the audit record. **Do not transmit if
   * this call rejects.** Pair every successful call with {@link completeExternal}.
   */
  beginExternal(input: FilingBeginExternalInput): Promise<FilingBeginExternalResult>;

  /**
   * Record the outcome of a filing opened with {@link beginExternal}. Idempotent.
   */
  completeExternal(input: FilingCompleteExternalInput): Promise<FilingSubmitResult>;

  /**
   * List the filings this installation has produced (read-only filing history).
   */
  list(): Promise<FilingRecord[]>;
}

export interface FilingValidateInput {
  /** The built transfer-package XML (Nutzdaten + envelope). */
  xml: string;
  /** Form type, e.g. "ustva" or "euer". */
  formType: string;
  /** Tax period (e.g. "2026-01") or year, depending on the form. */
  period?: string;
  /** When true (default), validate against the test path / test Finanzamt. */
  testMode?: boolean;
}

export interface FilingValidateResult {
  ok: boolean;
  errors?: string[];
}

export interface FilingSubmitInput {
  /** The built transfer-package XML (Nutzdaten + envelope). */
  xml: string;
  /** Form type, e.g. "ustva" or "euer". */
  formType: string;
  /** Tax period (e.g. "2026-01") or year, depending on the form. */
  period?: string;
  /** Stable handle referencing the customer's stored certificate. */
  certHandle: string;
  /** When true, route to the test path instead of a real submission. */
  testMode?: boolean;
  /**
   * Single-use approval token minted by the host when the figures were approved.
   * Required for a real submission; the host rejects the call without it.
   */
  confirmToken?: string;
  /** Hash of the approved figures, re-checked host side against the approval. */
  figuresHash?: string;
}

export interface FilingSubmitResult {
  transferTicket: string;
  /** GCS reference to the stored receipt PDF, if available. */
  receiptFileSource?: string;
  serverResponse?: string;
  /** The persisted filing record this submission produced. */
  filingId?: string;
  /** Lifecycle state the filing reached. */
  state?: string;
}

export interface FilingBeginExternalInput {
  /** Form type, e.g. "u30" or "zm". */
  formType: string;
  /** Tax period, e.g. "2026-01" or "2026-Q1". */
  period: string;
  /** When true (default), the transmission is non-binding and no approval is needed. */
  testMode?: boolean;
  /** Single-use approval token; required when `testMode` is false. */
  confirmToken?: string;
  /** Hash of the approved figures, re-checked host side against the approval. */
  figuresHash?: string;
}

export interface FilingBeginExternalResult {
  /** Pass this back to `completeExternal` once the transmission finishes. */
  filingId: string;
  state: string;
  ok: boolean;
}

export interface FilingCompleteExternalInput {
  /** The id returned by `beginExternal`. */
  filingId: string;
  /** Whether the authority accepted the transmission. */
  success: boolean;
  /** Transfer ticket or message reference the authority returned. */
  transferTicket?: string;
  /** Authority errors on a rejection. */
  errors?: string[];
  /** Raw response for the audit trail. */
  serverResponse?: string;
}

/** A persisted filing record (filing history). */
export interface FilingRecord {
  filingId: string;
  formType: string;
  period?: string;
  year?: number;
  /** "test" or "production". */
  mode: string;
  /** BUILT | VALIDATED | SUBMITTED | ACCEPTED | REJECTED | ERROR. */
  state: string;
  transferTicket?: string;
  receiptFileSource?: string;
  /** Creation time (epoch millis). */
  created: number;
}

export interface MappingRecord {
  system: string;
  entity: string;
  localId: string;
  externalId: string;
  metadata?: Record<string, unknown>;
}

export interface MappingGetInput {
  system: string;
  entity: string;
  localId: string;
}

export interface MappingFindByExternalInput {
  system: string;
  entity: string;
  externalId: string;
}

export interface MappingUpsertInput extends MappingRecord {}

export interface MappingsClient {
  /** Returns `null` when no mapping exists. Throws on transport/server errors. */
  get(input: MappingGetInput): Promise<MappingRecord | null>;
  /** Returns `null` when no mapping exists. Throws on transport/server errors. */
  findByExternal(input: MappingFindByExternalInput): Promise<MappingRecord | null>;
  upsert(input: MappingUpsertInput): Promise<void>;
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
