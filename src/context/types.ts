/**
 * Types for the Integration Context API.
 * Aligned with backend DocumentDto for EN 16931 compliance.
 */

export interface Document {
  id: string;
  userId?: string;
  lastUpdate?: number;
  created?: number;
  deleted?: boolean;
  duplicateOfId?: string;

  /** Space the document belongs to */
  space?: Space;

  /** Category classification */
  category?: Category;

  /** Tags associated with the document */
  tags?: Tag[];

  /** Space member who owns/uploaded the document */
  member?: DocumentMember;

  /** Description/notes */
  description?: string;

  /** Supplier/vendor company */
  supplier?: Company;

  /** Receiver/buyer company */
  receiver?: Company;

  /** Invoice number/ID */
  invoiceId?: string;

  /** Invoice date (ISO string) */
  invoiceDate?: string;

  /** Currency information */
  currency?: Currency;

  /** Due date (ISO string) */
  dueDate?: string;

  // === EN 16931 Compliance Fields ===

  /** UNTDID 1001 invoice type code (BT-3) */
  invoiceTypeCode?: string;

  /** Buyer's reference (BT-10) */
  buyerReference?: string;

  /** Purchase order reference (BT-13) */
  purchaseOrderReference?: string;

  /** Payment terms (BT-20) */
  paymentTerms?: string;

  /** Delivery date (BT-72) */
  deliveryDate?: string;

  /** Billing period start (BT-73) */
  invoicePeriodStart?: string;

  /** Billing period end (BT-74) */
  invoicePeriodEnd?: string;

  /** Reference to original invoice for credit notes (BT-25) */
  precedingInvoiceReference?: string;

  // === Monetary Fields ===

  /** Net amount (before tax) */
  netAmount?: number;

  /** Tax amount */
  taxAmount?: number;

  /** Subtotal amount */
  subtotalAmount?: number;

  /** Total amount (gross) */
  totalAmount?: number;

  /** Discount amount */
  discount?: number;

  /** Tip amount */
  tip?: number;

  /** Charges (shipping, handling) */
  chargesAmount?: number;

  /** Prepaid amount */
  prepaidAmount?: number;

  /** Amount due */
  amountDue?: number;

  /** Rounding adjustment */
  roundingAmount?: number;

  // === Classification Fields ===

  /** Economic effect: DEBIT, CREDIT, NEUTRAL */
  economicEffect?: string;

  /** Legal invoice kind */
  legalKind?: LegalKind;

  /** Supply type */
  supplyType?: SupplyType;

  /** Document lifecycle status */
  documentStatus?: DocumentStatus;

  /** Accounting classification */
  accountingType?: AccountingType;

  /** FK to original Document for corrections */
  referencedDocumentId?: string;

  // === File and Processing Fields ===

  /** Original file name */
  fileName?: string;

  /** Source of the file */
  fileSource?: string;

  /** Upload source */
  uploadSource?: string;

  /** Processing completion percentage (0-100) */
  completionRate?: number;

  /** Whether OCR processing is complete */
  processed?: boolean;

  /** Whether document is approved */
  approved?: boolean;

  /** Error type code (0 = no error) */
  errorType?: number;

  /** Error message */
  errorMessage?: string;

  // === Payment Tracking ===

  /** Processing/activity log */
  log?: string;

  /** Payment date (ISO string) */
  paymentDate?: string;

  /** Payment method */
  paymentMethod?: PaymentMethod;

  /** Payment status */
  paymentStatus?: PaymentStatus;

  /** Invoice series ID */
  invoiceSeriesId?: string;

  /** Template ID used for generating this document */
  templateId?: string;

  // === Tax Fields ===

  /** Tax treatment classification */
  taxTreatment?: string;

  /** Tax system (EU_VAT, US_SALES_TAX) */
  taxSystem?: string;

  /** Country for tax determination */
  taxCountry?: string;

  /** Region/state for tax determination */
  taxRegion?: string;

  /** VAT liability indicator */
  vatLiability?: string;

  /** Tax exemption reason */
  taxExemptionReason?: string;

  /** Tax determination status */
  taxDeterminationStatus?: string;

  /** Tax determination trace */
  taxDeterminationTrace?: string;

  // === Related Items ===

  /** Line items */
  lineItems?: DocumentLineItem[];

  /** Tax breakdown items */
  taxItems?: DocumentTaxItem[];

  /** Barcodes detected on the document */
  barcodes?: DocumentBarcode[];

  /** ID of the next document in sequence */
  next?: string;

  /** ID of the previous document in sequence */
  previous?: string;

  /** Display name (computed) */
  displayName?: string;
}

export type DocumentStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'CANCELLED' | 'DISPUTED';

export type LegalKind =
  | 'STANDARD'
  | 'ADVANCE'
  | 'PARTIAL'
  | 'FINAL'
  | 'CORRECTION'
  | 'CANCELLATION'
  | 'CREDIT_NOTE'
  | 'SELF_BILLED';

export type SupplyType = 'GOODS' | 'SERVICES' | 'LICENSE' | 'RENTAL' | 'SUBSCRIPTION' | 'MIXED';

export type AccountingType = 'PAYABLE' | 'RECEIVABLE' | 'UNKNOWN';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Space {
  id: string;
  name?: string;
}

export interface Currency {
  code: string;
  symbol?: string;
  name?: string;
  /** Number of decimal places (ISO 4217 minor units, e.g. 2 for EUR, 0 for JPY) */
  minorUnits?: number;
}

export interface PaymentMethod {
  id: string;
  name?: string;
}

export interface DocumentLineItem {
  id?: string;
  name?: string;
  lineIdentifier?: string;
  itemSellerIdentifier?: string;
  unitCode?: string;
  quantity?: number;
  /** Tax rate as a percentage in range 0–100 (e.g. 19 for 19% VAT) */
  taxPercentage?: number;
  /** Price per unit (before tax) */
  unitAmount?: number;
  /** Line net amount before tax: quantity * unitAmount */
  netAmount?: number;
  /** Tax amount for this line: netAmount * (taxPercentage / 100) */
  taxAmount?: number;
  /** Line total including tax: netAmount + taxAmount */
  totalAmount?: number;
  lineDiscount?: number;
  lineDiscountReason?: string;
}

export interface DocumentTaxItem {
  id?: string;
  /** Display name of the tax (e.g. "VAT", "GST 10%") */
  name?: string;
  /** Tax rate as a percentage in range 0–100 (e.g. 19 for 19% VAT) */
  taxPercentage?: number;
  /** Taxable base amount before tax (i.e. the net/subtotal this tax applies to) */
  netAmount?: number;
  /** Computed tax amount: netAmount * (taxPercentage / 100) */
  taxAmount?: number;
  /** Total tax collected across all line items for this tax rate (may differ from taxAmount for multi-line documents) */
  totalTax?: number;
  /** Tax role in accounting (e.g. "INVOICE_TAX", "SELF_ASSESSED_PAYABLE", "SELF_ASSESSED_RECOVERABLE", "IMPORT_TAX", "USE_TAX", "WITHHOLDING") */
  taxRole?: string;
  /** Reference to the tax jurisdiction/registration this tax applies to */
  taxJurisdictionId?: string;
  /** Source of the tax rate (e.g. "MANUAL", "PROVIDER", "RULESET", "AUTHORITY", "DOCUMENT", "UNKNOWN") */
  rateSource?: string;
}

export interface DocumentBarcode {
  /** Barcode category identifier for internal classification */
  code?: string;
  type?: string;
  rawCode?: string;
}

export interface DocumentMember {
  uid?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  imageUrl?: string;
  deleted?: boolean;
  /** Computed display name */
  displayName?: string;
  /** Computed initials */
  initials?: string;
}

export interface Company {
  id: string;
  space?: { id: string };
  userId?: string;
  deleted?: boolean;
  lastUpdate: number;
  created: number;

  name: string;
  displayName?: string;

  // Address fields (BG-5/BG-8)
  country?: string;
  countryIso?: string;
  street?: string;
  addressLine2?: string;
  state?: string;
  zip?: string;
  city?: string;

  // Contact fields (BG-6/BG-9)
  contactPerson?: string;
  email?: string;
  phone?: string;
  fax?: string;

  // Tax/Business identifiers
  taxNumber?: string;
  vatId?: string;
  commercialRegister?: string;

  // Electronic address (BT-34/BT-49)
  electronicAddress?: string;
  electronicAddressScheme?: string;

  // Banking details
  iban?: string;
  bic?: string;

  // Other
  url?: string;
  icon?: string;

  // Billing
  billingAddress?: boolean;

  // Statistics
  supplier?: number;
  receiver?: number;
}

export interface Category {
  id: string;
  spaceId: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  spaceId: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Export {
  id: string;
  spaceId: string;
  format: string;
  status: ExportStatus;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: string;
  documentCount?: number;
  createdAt: string;
  completedAt?: string;
}

export type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ListParams {
  /** Filter by specific IDs */
  ids?: string[];
  page?: number;
  /** Items per page (backend parameter name) */
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  /** Search/filter query (e.g. company name search) */
  query?: string;
}

export interface DocumentListParams extends ListParams {
  status?: DocumentStatus;
  companyId?: string;
  categoryId?: string;
  tagIds?: string[];
  startDate?: number;
  endDate?: number;
  search?: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
