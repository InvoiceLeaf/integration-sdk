/**
 * JSON Schema subset for form generation and validation.
 */
export interface JsonSchema {
  /** Schema type */
  type?: JsonSchemaType;

  /** Display title */
  title?: string;

  /** Description */
  description?: string;

  /** Default value */
  default?: unknown;

  /** Object properties */
  properties?: Record<string, JsonSchemaProperty>;

  /** Required property names */
  required?: string[];

  /** Array items schema */
  items?: JsonSchema;

  /** Additional properties allowed */
  additionalProperties?: boolean | JsonSchema;

  /** Pattern properties */
  patternProperties?: Record<string, JsonSchema>;

  /** Minimum properties */
  minProperties?: number;

  /** Maximum properties */
  maxProperties?: number;

  /** Property order */
  propertyOrder?: string[];

  /** Schema reference */
  $ref?: string;

  /** Schema definitions */
  definitions?: Record<string, JsonSchema>;

  /** Any of schemas */
  anyOf?: JsonSchema[];

  /** One of schemas */
  oneOf?: JsonSchema[];

  /** All of schemas */
  allOf?: JsonSchema[];

  /** Not schema */
  not?: JsonSchema;

  /** If-then-else */
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
}

export interface JsonSchemaProperty extends JsonSchema {
  /** String format */
  format?: JsonSchemaFormat;

  /** Enum values */
  enum?: (string | number | boolean)[];

  /** Enum display names */
  enumNames?: string[];

  /** Minimum length (string) */
  minLength?: number;

  /** Maximum length (string) */
  maxLength?: number;

  /** Regex pattern (string) */
  pattern?: string;

  /** Minimum value (number) */
  minimum?: number;

  /** Maximum value (number) */
  maximum?: number;

  /** Exclusive minimum (number) */
  exclusiveMinimum?: number;

  /** Exclusive maximum (number) */
  exclusiveMaximum?: number;

  /** Multiple of (number) */
  multipleOf?: number;

  /** Minimum items (array) */
  minItems?: number;

  /** Maximum items (array) */
  maxItems?: number;

  /** Unique items (array) */
  uniqueItems?: boolean;

  /** Read-only field */
  readOnly?: boolean;

  /** Write-only field */
  writeOnly?: boolean;

  /** Constant value */
  const?: unknown;

  /** Content media type */
  contentMediaType?: string;

  /** Content encoding */
  contentEncoding?: string;
}

export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export type JsonSchemaFormat =
  | 'date'
  | 'time'
  | 'date-time'
  | 'email'
  | 'uri'
  | 'uri-reference'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uuid'
  | 'textarea'
  | 'password'
  | 'color'
  | 'file';
