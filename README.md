# @invoiceleaf/integration-sdk

SDK for building InvoiceLeaf integrations.

## Installation

```bash
npm install @invoiceleaf/integration-sdk
```

## Package Structure

Every integration package **must** have a `manifest.json` file at the package root. This file is the canonical source of truth for the integration's metadata, triggers, actions, and configuration schema.

```
my-integration/
├── manifest.json        # REQUIRED - Integration manifest
├── package.json
├── src/
│   ├── index.ts         # Handler exports
│   └── handlers/        # Handler implementations
└── README.md
```

### manifest.json

The `manifest.json` file is automatically read by:
- The **InvoiceLeaf backend** when registering/updating integrations (fetched from npm)
- The **plugin runtime** when executing integration handlers

This ensures the same manifest definition is used everywhere, keeping the backend database and runtime in sync.

**Example manifest.json:**
```json
{
  "id": "my-integration",
  "name": "My Integration",
  "version": "1.0.0",
  "description": "A sample integration",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "icon": "puzzle",
  "category": "productivity",
  "dataAccess": ["documents", "companies"],
  "triggers": [
    {
      "id": "on-document-processed",
      "type": "event",
      "name": "On Document Processed",
      "events": ["document.processed"],
      "handler": "onDocumentProcessed"
    }
  ],
  "actions": [
    {
      "id": "sync-documents",
      "name": "Sync Documents",
      "handler": "syncDocuments"
    }
  ],
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key"
      }
    },
    "required": ["apiKey"]
  }
}
```

## Quick Start

```typescript
// src/index.ts
import { defineHandler, DocumentProcessedInput } from '@invoiceleaf/integration-sdk';

// Export handlers that match the "handler" names in manifest.json
export const onDocumentProcessed = defineHandler<DocumentProcessedInput>(
  async (input, context) => {
    context.logger.info('Document processed', { id: input.documentId });

    const doc = await context.data.getDocument(input.documentId);
    // Process the document...

    return { success: true };
  }
);

export const syncDocuments = defineHandler(async (input, context) => {
  const documents = await context.data.listDocuments({
    status: 'PROCESSED',
    size: 100,
  });

  context.logger.info(`Found ${documents.total} documents to sync`);

  // Sync documents to external service...

  return { syncedCount: documents.items.length };
});
```

## Trigger Types

### Event Triggers

Triggered by InvoiceLeaf events:

```typescript
{
  id: 'on-document-created',
  type: 'event',
  events: ['document.created', 'document.updated'],
  handler: 'handleDocumentEvent',
}
```

Available events:
- `document.created`
- `document.updated`
- `document.processed`
- `document.deleted`
- `company.created`
- `company.updated`
- `company.deleted`
- `export.completed`
- `reminder.triggered`
- `space.member.added`
- `space.member.removed`

### Schedule Triggers

Triggered on a schedule (cron):

```typescript
{
  id: 'daily-sync',
  type: 'schedule',
  schedule: '0 2 * * *', // 2 AM daily
  handler: 'dailySync',
}
```

### Webhook Triggers

Triggered by external services:

```typescript
{
  id: 'stripe-webhook',
  type: 'webhook',
  webhook: {
    methods: ['POST'],
    signature: {
      header: 'stripe-signature',
      algorithm: 'hmac-sha256',
      secretConfigKey: 'stripeWebhookSecret',
    },
  },
  handler: 'handleStripeWebhook',
}
```

### User Action Triggers

Triggered by user clicks:

```typescript
{
  id: 'export-to-datev',
  type: 'user_action',
  userAction: {
    label: 'Export to DATEV',
    icon: '📤',
    placement: ['document-list', 'toolbar'],
    confirmMessage: 'Export selected documents to DATEV?',
  },
  handler: 'exportToDATEV',
}
```

## Invocation Mappings (Optional)

Invocation mappings let the platform route external interaction operations
to internal manifest actions in a structured way.

```json
{
  "actions": [
    {
      "id": "apply-document-action",
      "name": "Apply Document Action",
      "handler": "applyDocumentAction",
      "internal": true
    }
  ],
  "invocations": [
    {
      "id": "telegram-mark-paid",
      "source": "telegram.callback",
      "operation": "mark_paid",
      "actionId": "apply-document-action",
      "requiresLinkedUser": true
    }
  ]
}
```

Validation rules:
- Every invocation needs `id`, `source`, `operation`, and `actionId`
- `actionId` must reference an existing `actions[].id`
- Invocation IDs must be unique

## External Authentication

### OAuth2

```typescript
externalAuth: [
  {
    provider: 'google',
    name: 'Google Drive',
    type: 'oauth2',
    oauth: {
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    },
  },
],
```

Usage in handler:

```typescript
const accessToken = await context.credentials.getAccessToken('google');
```

### API Key

```typescript
externalAuth: [
  {
    provider: 'openai',
    name: 'OpenAI',
    type: 'api_key',
    apiKey: {
      headerName: 'Authorization',
      prefix: 'Bearer ',
      instructions: 'Get your API key from https://platform.openai.com',
    },
  },
],
```

Usage in handler:

```typescript
const apiKey = await context.credentials.getApiKey('openai');
```

## Custom UI Pages

Define custom dashboard pages:

```typescript
pages: [
  {
    id: 'dashboard',
    name: 'Dashboard',
    route: '/dashboard',
    dataSource: 'getDashboardData',
    layout: {
      type: 'dashboard',
      widgets: [
        {
          type: 'metric',
          title: 'Documents Synced',
          value: '{{syncedCount}}',
          format: 'number',
          trend: { direction: 'up', value: 12 },
        },
        {
          type: 'chart',
          title: 'Sync History',
          chartType: 'line',
          dataSource: '{{syncHistory}}',
          xField: 'date',
          yField: 'count',
        },
        {
          type: 'actionButton',
          label: 'Sync Now',
          actionId: 'sync-documents',
          variant: 'primary',
        },
      ],
    },
  },
],
```

## User Configuration

Define configuration options:

```typescript
configSchema: {
  type: 'object',
  properties: {
    syncEnabled: {
      type: 'boolean',
      title: 'Enable Auto-Sync',
      default: true,
    },
    syncInterval: {
      type: 'string',
      title: 'Sync Interval',
      enum: ['hourly', 'daily', 'weekly'],
      default: 'daily',
    },
    apiEndpoint: {
      type: 'string',
      title: 'API Endpoint',
      format: 'uri',
    },
  },
  required: ['syncEnabled'],
},
```

Access in handler:

```typescript
const syncEnabled = context.config.syncEnabled as boolean;
```

## API Reference

### IntegrationContext

| Property | Type | Description |
|----------|------|-------------|
| `spaceId` | `string` | Current space ID |
| `userId` | `string` | User who triggered execution |
| `installationId` | `string` | Installation ID |
| `config` | `Record<string, unknown>` | User configuration |
| `data` | `DataClient` | Data access client |
| `credentials` | `CredentialsClient` | Credential client |
| `state` | `StateClient` | Installation-scoped state client |
| `email` | `EmailClient` | SMTP/IMAP operations |
| `logger` | `Logger` | Structured logger |

### DataClient

| Method | Description |
|--------|-------------|
| `listDocuments(params?)` | List documents with filters |
| `getDocument(id)` | Get document by ID |
| `listCompanies(params?)` | List companies |
| `getCompany(id)` | Get company by ID |
| `listCategories()` | List all categories |
| `listTags()` | List all tags |
| `createExport(params)` | Create export job |
| `getExport(id)` | Get export status |
| `importDocument(input)` | Import file as document |

### CredentialsClient

| Method | Description |
|--------|-------------|
| `getAccessToken(provider)` | Get OAuth access token |
| `getApiKey(provider)` | Get API key |
| `refreshToken(provider)` | Force token refresh |

### StateClient

| Method | Description |
|--------|-------------|
| `get(key)` | Read installation-scoped state |
| `set(key, value, opts?)` | Persist installation-scoped state |
| `delete(key)` | Remove installation-scoped state |

### EmailClient

| Method | Description |
|--------|-------------|
| `sendSmtpEmail(input)` | Send outbound SMTP email |
| `testSmtpImapConnection(input)` | Verify SMTP + IMAP connection |
| `crawlImapPdfAttachments(input)` | Fetch PDF attachments from IMAP |

### Logger

| Method | Description |
|--------|-------------|
| `debug(message, data?)` | Debug log |
| `info(message, data?)` | Info log |
| `warn(message, data?)` | Warning log |
| `error(message, data?)` | Error log |

## License

MIT
