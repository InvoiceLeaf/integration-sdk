import type { JsonSchema } from './schema.js';

/**
 * Page definition - defines custom UI pages.
 */
export interface PageDefinition {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Route path */
  route: string;

  /** Page title */
  title?: string;

  /** Page description */
  description?: string;

  /** Action ID to fetch page data */
  dataSource?: string;

  /** Page layout */
  layout: PageLayout;
}

export interface PageLayout {
  /** Layout type */
  type: 'dashboard' | 'form' | 'table' | 'custom';

  /** Number of grid columns */
  columns?: number;

  /** Widgets on the page */
  widgets: Widget[];
}

/**
 * Widget types for UI rendering.
 */
export type Widget =
  | MetricWidget
  | ChartWidget
  | TableWidget
  | FormWidget
  | ActionButtonWidget
  | TextWidget
  | AlertWidget;

export interface BaseWidget {
  /** Unique identifier */
  id?: string;

  /** Widget type */
  type: string;

  /** Grid column span (CSS grid-column) */
  gridColumn?: string;

  /** Grid row span (CSS grid-row) */
  gridRow?: string;
}

export interface MetricWidget extends BaseWidget {
  type: 'metric';

  /** Display title */
  title?: string;

  /** Value or data binding (e.g., "{{totalRevenue}}") */
  value: string | number;

  /** Value format */
  format?: 'number' | 'currency' | 'percentage';

  /** Currency code for currency format */
  currency?: string;

  /** Description text */
  description?: string;

  /** Icon (emoji or icon name) */
  icon?: string;

  /** Custom color */
  color?: string;

  /** Trend indicator */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: number;
    label?: string;
  };
}

export interface ChartWidget extends BaseWidget {
  type: 'chart';

  /** Display title */
  title?: string;

  /** Description */
  description?: string;

  /** Chart type */
  chartType: 'line' | 'bar' | 'pie' | 'donut' | 'area';

  /** Data source binding */
  dataSource: string;

  /** X-axis field */
  xField?: string;

  /** Y-axis field */
  yField?: string;

  /** Data series configuration */
  series?: ChartSeries[];
}

export interface ChartSeries {
  /** Data key */
  dataKey: string;

  /** Display name */
  name?: string;

  /** Series color */
  color?: string;
}

export interface TableWidget extends BaseWidget {
  type: 'table';

  /** Display title */
  title?: string;

  /** Description */
  description?: string;

  /** Data source binding */
  dataSource: string;

  /** Column definitions */
  columns?: TableColumn[];

  /** Enable search */
  search?: boolean;

  /** Enable pagination */
  pagination?: boolean;

  /** Row actions */
  actions?: TableAction[];
}

export interface TableColumn {
  /** Data key */
  key?: string;

  /** Display label */
  label?: string;

  /** Value format */
  format?: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'percentage';

  /** Enable sorting */
  sortable?: boolean;

  /** Column width */
  width?: string;
}

export interface TableAction {
  /** Action ID */
  id: string;

  /** Display label */
  label: string;

  /** Icon */
  icon?: string;

  /** Confirmation message */
  confirmMessage?: string;
}

export interface FormWidget extends BaseWidget {
  type: 'form';

  /** Display title */
  title?: string;

  /** Description */
  description?: string;

  /** Form schema (JSON Schema) */
  schema?: JsonSchema;

  /** Submit action ID */
  submitAction?: string;

  /** Submit button label */
  submitLabel?: string;
}

export interface ActionButtonWidget extends BaseWidget {
  type: 'actionButton';

  /** Button label */
  label: string;

  /** Action ID to trigger */
  actionId: string;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';

  /** Icon */
  icon?: string;

  /** Description */
  description?: string;

  /** Confirmation message */
  confirmMessage?: string;

  /** Disabled state */
  disabled?: boolean;
}

export interface TextWidget extends BaseWidget {
  type: 'text';

  /** Display title */
  title?: string;

  /** Text content or data binding */
  content: string;

  /** Content format */
  format?: 'plain' | 'markdown';
}

export interface AlertWidget extends BaseWidget {
  type: 'alert';

  /** Alert type */
  alertType: 'info' | 'success' | 'warning' | 'error';

  /** Alert title */
  title?: string;

  /** Alert message */
  message: string;

  /** Dismissible */
  dismissible?: boolean;
}
