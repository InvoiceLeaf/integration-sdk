# Migration Guide: v1.x to v2.0.0

This guide covers the breaking changes introduced in `@invoiceleaf/integration-sdk` v2.0.0 and how to update your integration code.

## 1. Company: Address fields flattened

The nested `Address` interface has been removed. Address fields are now directly on the `Company` interface, and `postalCode` has been renamed to `zip`.

### Before (v1.x)

```typescript
const company: Company = ...;

// Accessing address via nested object
const street = company.address?.street;
const postalCode = company.address?.postalCode;
const city = company.address?.city;
const country = company.address?.country;
const countryIso = company.address?.countryIso;
const addressLine2 = company.address?.addressLine2;
```

### After (v2.0.0)

```typescript
const company: Company = ...;

// Address fields are now inline on Company
const street = company.street;
const zip = company.zip;           // was: company.address?.postalCode
const city = company.city;
const country = company.country;
const countryIso = company.countryIso;
const addressLine2 = company.addressLine2;
```

### What to do

1. Replace all `company.address?.` references with direct field access on `company`.
2. Rename `postalCode` to `zip` wherever it appears.
3. Remove any imports or references to the `Address` interface.

---

## 2. DocumentTaxItem: Field renames and additions

Several fields on `DocumentTaxItem` have been renamed for clarity and consistency with EN 16931.

### Before (v1.x)

```typescript
const taxItem: DocumentTaxItem = ...;

const rate = taxItem.taxRate;
const base = taxItem.taxableAmount;
```

### After (v2.0.0)

```typescript
const taxItem: DocumentTaxItem = ...;

const rate = taxItem.taxPercentage;   // was: taxRate
const base = taxItem.netAmount;       // was: taxableAmount
const label = taxItem.name;           // new field
const total = taxItem.totalTax;       // new field
```

### What to do

1. Rename `taxRate` to `taxPercentage` in all references.
2. Rename `taxableAmount` to `netAmount` in all references.
3. Optionally use the new `name` and `totalTax` fields if your integration displays or processes tax details.

---

## 3. DocumentBarcode.code: number to string

The `code` field on `DocumentBarcode` has changed from `number` to `string`.

### Before (v1.x)

```typescript
const barcode: DocumentBarcode = ...;
const code: number = barcode.code;  // was a number
```

### After (v2.0.0)

```typescript
const barcode: DocumentBarcode = ...;
const code: string = barcode.code;  // now a string
```

### What to do

1. Update any type annotations that expect `barcode.code` to be a `number`.
2. If you perform numeric comparisons or arithmetic on `barcode.code`, convert with `parseInt()` or `Number()` as needed.
3. If you store barcode codes externally (e.g., in a database), ensure the column type accommodates strings.

---

## Quick find-and-replace checklist

| Search for | Replace with |
|---|---|
| `.address?.street` | `.street` |
| `.address?.postalCode` | `.zip` |
| `.address?.zip` | `.zip` |
| `.address?.city` | `.city` |
| `.address?.country` | `.country` |
| `.address?.countryIso` | `.countryIso` |
| `.address?.addressLine2` | `.addressLine2` |
| `.address?.state` | `.state` |
| `.taxRate` | `.taxPercentage` |
| `.taxableAmount` | `.netAmount` |

## Need help?

If you encounter issues migrating, please [open an issue](https://github.com/invoiceleaf/integration-sdk/issues) or reach out at support@invoiceleaf.com.
