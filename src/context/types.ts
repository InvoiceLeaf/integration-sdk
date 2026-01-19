/**
 * Types for the Integration Context API.
 */

export interface Document {
  id: string;
  spaceId: string;
  status: DocumentStatus;
  fileName: string;
  mimeType: string;
  fileSize: number;
  pageCount?: number;
  companyId?: string;
  company?: Company;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'ARCHIVED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

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
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}
