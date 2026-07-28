# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-07-28

### Added

- New `context.payments` client (`PaymentsClient`) with `list` and `create`. `create` records a payment in the space's accounting model, supports inline document allocations (allocated documents become PARTIAL/PAID automatically), and is idempotent via `externalRef`. Requires the new `payments` dataAccess scope.
- New `payments` value in `DataAccessType`.
- New exported types: `PaymentsClient`, `PaymentListParams`, `PaymentRecord`, `PaymentListResult`, `PaymentAllocationInput`, `PaymentCreateInput`, `PaymentCreateResult`.
- New `data.createStructuredDocument`: creates a document with structured data (line items, tax items, amounts, parties) that skips the OCR/AI processing pipeline; an original file can optionally be attached as-is. Shares the `externalRef` dedupe namespace with `importDocument`.
- New `data.createCompany` for resolving external customers/vendors to InvoiceLeaf companies.
- The plugin runtime `fetch` now supports `{responseType: 'base64'}` to download binary content (e.g. PDFs) intact across the isolate boundary.

### Fixed

- `createAttachmentFingerprint` now uses a pure-JS SHA-256 instead of `node:crypto`, so importing SDK helper values no longer breaks the runtime's neutral-platform plugin bundling. Output is unchanged (verified against `node:crypto`).
- `exports` map gained a `default` condition so the package resolves under CJS/require-based tooling (the plugin runtime aliases plugin SDK imports to its own copy at bundle time).

## [2.0.0] - 2026-03-22

### Breaking Changes

- **Company: Address interface removed, fields flattened.** The nested `Address` interface has been removed. Address fields (`street`, `zip`, `city`, `country`, `countryIso`, `addressLine2`, `state`) are now inline on the `Company` interface. The `postalCode` field has been renamed to `zip`. Removed: `spaceId` (use `space?.id`), `taxId` (use `taxNumber`), `website` (use `url`), `metadata`, `createdAt`/`updatedAt` (use `created`/`lastUpdate`). Added: `userId`, `deleted`, `contactPerson`, `fax`, `commercialRegister`, `electronicAddress`, `electronicAddressScheme`, `iban`, `bic`, `icon`, `billingAddress`, `supplier`, `receiver`.

- **DocumentTaxItem: Field renames and additions.**
  - `taxRate` renamed to `taxPercentage` (percentage in range 0-100).
  - `taxableAmount` renamed to `netAmount` (taxable base amount before tax).
  - Removed `taxCategoryCode`.
  - Added `name` field (display name of the tax, e.g. "VAT", "GST 10%").
  - Added `totalTax` field (total tax collected across all line items for this tax rate).
  - Added `taxRole`, `taxJurisdictionId`, `rateSource` fields.

- **DocumentBarcode.code: Type changed from `number` to `string`.** The `code` field on `DocumentBarcode` is now a `string` instead of a `number`.

- **ListParams/ListResult: `size` renamed to `limit`.** The `size` field has been renamed to `limit` for consistency with the backend API parameter name.

- **Tag: `documentCount` removed.** The `documentCount` field has been removed from the `Tag` interface.

### Added

- New `DocumentMember` interface for document ownership/author info.
- New fields on `Document`: `member`, `log`, `templateId`, `taxDeterminationTrace`, `barcodes`, `next`, `previous`.
- New `Currency.minorUnits` field (ISO 4217 minor units).
- `Category.parentId` type refined to `string | null` (allows explicit null).
- Shared utility helpers exported: `toBoundedInt`, `toFiniteNumber`, `toDateOnly`, `toDateOnlyFromTimestamp`, `toErrorMessage`, `trimToUndefined`, `firstFinite`.
- `DocumentListParams`: added `tagIds`, `search`, and inherits `ids`, `sortBy`, `sortDirection`, `query` from `ListParams`.

## [1.7.0] and earlier

See the [git history](https://github.com/invoiceleaf/integration-sdk/commits/main) for changes prior to 2.0.0.
