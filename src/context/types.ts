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

  /** Payment date (ISO string) */
  paymentDate?: string;

  /** Payment method */
  paymentMethod?: PaymentMethod;

  /** Payment status */
  paymentStatus?: PaymentStatus;

  /** Invoice series ID */
  invoiceSeriesId?: string;

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

  // === Related Items ===

  /** Line items */
  lineItems?: DocumentLineItem[];

  /** Tax breakdown items */
  taxItems?: DocumentTaxItem[];

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
  taxPercentage?: number;
  unitAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  lineDiscount?: number;
  lineDiscountReason?: string;
}

export interface DocumentTaxItem {
  id?: string;
  taxRate?: number;
  taxableAmount?: number;
  taxAmount?: number;
  taxCategoryCode?: string;
}

export interface Company {
  id: string;
  spaceId: string;
  name: string;
  displayName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Category {
  id: string;
  spaceId: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  spaceId: string;
  name: string;
  color?: string;
  documentCount?: number;
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
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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
  size: number;
  hasMore: boolean;
}
