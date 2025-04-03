<script setup lang="ts">
import { computed, h, reactive, ref } from "vue";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { Icon } from "#components";
import type {
  ColumnFiltersState,
  RowData,
  RowSelectionState,
  SortingState,
} from "@tanstack/vue-table";

declare module "@tanstack/vue-table" {
  //allows us to define custom properties for our columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "select";
  }
}

// Define type for OpenTelemetry value types
type OtelValueType = string | number | boolean | string[] | number[] | boolean[];

// Define types for the OpenTelemetry data structure
interface OtelKeyValue {
  key: string;
  value: {
    stringValue?: string;
    intValue?: number;
    doubleValue?: number;
    boolValue?: boolean;
    arrayValue?: {
      values: Array<{
        stringValue?: string;
        intValue?: number;
        doubleValue?: number;
        boolValue?: boolean;
      }>;
    };
  };
}

interface OtelScope {
  attributes: OtelKeyValue[];
  name: string;
  version: string;
  droppedAttributesCount: number;
}

interface OtelSpan {
  attributes: OtelKeyValue[];
  events: unknown[];
  links: unknown[];
  traceId: number[];
  spanId: number[];
  traceState: string;
  parentSpanId: number[];
  name: string;
  kind: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  droppedAttributesCount: number;
  droppedEventsCount: number;
  droppedLinksCount: number;
  status: {
    message: string;
    code: string;
  };
  flags: number;
}

interface OtelScopeSpan {
  spans: OtelSpan[];
  scope: OtelScope;
  schemaUrl: string;
}

interface OtelResource {
  attributes: OtelKeyValue[];
  entityRefs: unknown[];
  droppedAttributesCount: number;
}

interface OtelResourceSpan {
  scopeSpans: OtelScopeSpan[];
  resource: OtelResource;
  schemaUrl: string;
}

// Define types for OpenTelemetry metric data structure
interface OtelMetricDataPoint {
  attributes: OtelKeyValue[] | Record<string, any>;
  startTimeUnixNano: number;
  timeUnixNano: number;
  count?: number;
  sum?: number;
  min?: number;
  max?: number;
  asInt?: number;
  asDouble?: number;
  bucketCounts?: number[];
  explicitBounds?: number[];
  flags: number;
}

interface OtelMetric {
  name: string;
  description?: string;
  unit?: string;
  histogram?: {
    dataPoints: OtelMetricDataPoint[];
    aggregationTemporality?: string;
  };
  sum?: {
    dataPoints: OtelMetricDataPoint[];
    aggregationTemporality?: string;
    isMonotonic?: boolean;
  };
}

interface OtelScopeMetric {
  metrics: OtelMetric[];
  scope: OtelScope;
  schemaUrl?: string;
}

interface OtelResourceMetric {
  scopeMetrics: OtelScopeMetric[];
  resource: OtelResource;
  schemaUrl?: string;
}

// Update the MonitoringResponse interface to include metrics
interface MonitoringResponse {
  id?: string;
  type?: string;
  attributes: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  resourceMetrics?: OtelResourceMetric[];
  resource_metrics?: OtelResourceMetric[];
}

// Custom interface for metric data points in our UI
interface MetricDataPoint {
  value: number;
  timestamp: string;
  attributes?: Record<string, any>;
}

// Custom interface for metric details in our UI
interface MetricDetails {
  name: string;
  description: string;
  unit: string;
  dataPoints: MetricDataPoint[];
}

// Interface for token counts used in summarizing token metrics
interface TokenCounts {
  input: number;
  output: number;
  total: number;
}

// Helper to extract value from OtelKeyValue
function getAttributeValue (value: any): unknown {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return value.intValue;
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.boolValue !== undefined) return value.boolValue;
  return null;
}

// Transform the data from the backend to a usable format
function transformResponseData (data: any[]): MonitoringResponse[] {
  if (!data || !Array.isArray(data)) return [];

  return data.map(item => {
    // Process OTel format
    const attributes: Record<string, any> = {};

    // Extract attributes from the data
    if (item.attributes) {
      Object.keys(item.attributes).forEach(key => {
        attributes[key] = item.attributes[key];
      });
    }

    // Extract metric details if available
    const resourceMetricsArray = item.resourceMetrics || item.resource_metrics || [];
    if (resourceMetricsArray.length > 0) {
      const resourceMetric = resourceMetricsArray[0];
      if (!resourceMetric) return {
        id: item.id,
        type: item.type,
        attributes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        resourceMetrics: resourceMetricsArray
      };

      // Extract resource attributes
      if (resourceMetric.resource && resourceMetric.resource.attributes) {
        resourceMetric.resource.attributes.forEach((attr: OtelKeyValue) => {
          if (attr.key && attr.value) {
            const value = getAttributeValue(attr.value);
            if (value !== null) {
              attributes[attr.key] = value;
            }
          }
        });
      }

      // Process metric data
      const scopeMetricsArray = resourceMetric.scopeMetrics || resourceMetric.scope_metrics || [];
      if (scopeMetricsArray.length > 0) {
        scopeMetricsArray.forEach((scopeMetric: any) => {
          if (scopeMetric.metrics && scopeMetric.metrics.length > 0) {
            scopeMetric.metrics.forEach((metric: any) => {
              // Add metric info to attributes
              attributes['metric.name'] = metric.name;
              if (metric.description) attributes['metric.description'] = metric.description;
              if (metric.unit) attributes['metric.unit'] = metric.unit;

              // Extract data points for specific metric types
              if (metric.name === 'gen_ai.client.token.usage') {
                const histogram = metric.histogram;
                if (histogram && histogram.dataPoints && histogram.dataPoints.length > 0) {
                  // Process histogram data points for token usage
                  const dataPointsByTokenType: Record<string, number> = {};

                  histogram.dataPoints.forEach((point: OtelMetricDataPoint) => {
                    let tokenType = 'unknown';

                    // Find the token type from attributes
                    if (Array.isArray(point.attributes)) {
                      const tokenTypeAttr = point.attributes.find(
                        (attr: OtelKeyValue) => attr.key === 'gen_ai.token.type'
                      );
                      if (tokenTypeAttr && tokenTypeAttr.value && tokenTypeAttr.value.stringValue) {
                        tokenType = tokenTypeAttr.value.stringValue;
                      }
                    } else if (point.attributes && (point.attributes as Record<string, any>)['gen_ai.token.type']) {
                      tokenType = (point.attributes as Record<string, any>)['gen_ai.token.type'];
                    }

                    // Get the sum value
                    const value = point.sum || 0;

                    // Aggregate by token type
                    if (!dataPointsByTokenType[tokenType]) {
                      dataPointsByTokenType[tokenType] = 0;
                    }
                    dataPointsByTokenType[tokenType] += value;
                  });

                  // Store in attributes
                  Object.keys(dataPointsByTokenType).forEach(tokenType => {
                    attributes[`token.${tokenType}`] = dataPointsByTokenType[tokenType];
                  });
                }
              }

              // Extract operation metrics
              if (metric.name === 'gen_ai.client.operation.duration') {
                const histogram = metric.histogram;
                if (histogram && histogram.dataPoints && histogram.dataPoints.length > 0) {
                  // Use the first data point for simplicity
                  const dataPoint = histogram.dataPoints[0];
                  const value = dataPoint.sum || 0;
                  attributes['metric.value'] = value;

                  // Copy over other attributes
                  if (Array.isArray(dataPoint.attributes)) {
                    dataPoint.attributes.forEach((attr: OtelKeyValue) => {
                      if (attr.key && attr.value) {
                        const attrValue = getAttributeValue(attr.value);
                        if (attrValue !== null) {
                          attributes[attr.key] = attrValue;
                        }
                      }
                    });
                  } else if (dataPoint.attributes) {
                    const attrs = dataPoint.attributes as Record<string, any>;
                    Object.keys(attrs).forEach(key => {
                      attributes[key] = attrs[key];
                    });
                  }
                }
              }
            });
          }
        });
      }
    }

    return {
      id: item.id,
      type: item.type,
      attributes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      resourceMetrics: item.resourceMetrics || item.resource_metrics
    } as MonitoringResponse;
  });
}

// Extract metric name from response
function getMetricName (item: MonitoringResponse): string {
  if (item.attributes['metric.name']) {
    return item.attributes['metric.name'] as string;
  }

  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics && scopeMetric.metrics.length > 0) {
          return scopeMetric.metrics[0].name;
        }
      }
    }
  }

  return "Unknown metric";
}

// Extract metric value from response
function getMetricValue (item: MonitoringResponse): number | string {
  // First try to get from attributes
  if (item.attributes['metric.value'] !== undefined) {
    return item.attributes['metric.value'] as number;
  }

  // Otherwise try to extract from raw data
  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics) {
          for (const metric of scopeMetric.metrics) {
            // Check for histogram data points
            const histogramPoints = metric.histogram?.dataPoints;
            if (histogramPoints && histogramPoints.length > 0) {
              return formatMetricValue(histogramPoints[0].sum, metric.unit || '');
            }

            // Check for sum data points
            const sumPoints = metric.sum?.dataPoints;
            if (sumPoints && sumPoints.length > 0) {
              return formatMetricValue(sumPoints[0].asInt || sumPoints[0].asDouble, metric.unit || '');
            }
          }
        }
      }
    }
  }

  return 'N/A';
}

// Format metric value based on unit
function formatMetricValue (value: unknown, unit: string): string {
  if (value === undefined || value === null) return "N/A";

  if (typeof value === 'number') {
    // Handle different units
    if (unit === 'token') {
      return value.toLocaleString();
    } else if (unit === 's') {
      // Convert seconds to ms for display
      return `${(value * 1000).toFixed(2)}ms`;
    } else if (unit === 'choice') {
      return value.toString();
    }

    // Default format
    return value.toString();
  }

  return String(value);
}

// Get metric unit
function getMetricUnit (item: MonitoringResponse): string {
  if (item.attributes['metric.unit']) {
    return item.attributes['metric.unit'] as string;
  }

  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics && scopeMetric.metrics.length > 0) {
          return scopeMetric.metrics[0].unit || '';
        }
      }
    }
  }

  return "";
}

// Define a query to fetch monitoring metrics
const { data: rawItems, isLoading, error } = useQuery({
  key: ['monitoring', 'metrics'],
  query: async () => {
    const res = await client.api.monitoring.metrics.$get();

    if (!res.ok) {
      throw new Error(`Failed to fetch monitoring metrics: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  },
});

// Transform the data
const items = computed(() => {
  if (!rawItems.value) return [];
  return transformResponseData(rawItems.value);
});

// Helper function to extract attributes from raw data
function extractAttributes (response: MonitoringResponse, key: string, defaultValue: OtelValueType = ""): OtelValueType {
  // If we have the attributes already, use them
  if (response.attributes && response.attributes[key] !== undefined) {
    return response.attributes[key] as OtelValueType;
  }

  // If we have raw data from ClickHouse, extract from there
  const resourceMetrics = response.resourceMetrics || response.resource_metrics || [];
  // Try to find the resource spans data
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics) {
          for (const metric of scopeMetric.metrics) {
            if (metric.name === key) {
              if (metric.sum) {
                const dataPoints = metric.sum.dataPoints;
                if (dataPoints && dataPoints.length > 0) {
                  const value = dataPoints[0].asDouble || dataPoints[0].asInt || 0;
                  return value as OtelValueType;
                }
              }
            }
          }
        }
      }
    }
  }

  return defaultValue;
}

// Helper to extract resource attributes from raw data
function extractResourceAttributes (response: MonitoringResponse, key: string, defaultValue: OtelValueType = ""): OtelValueType {
  // If we have the resource attributes directly, use them
  if (response.attributes && response.attributes[key] !== undefined) {
    return response.attributes[key] as OtelValueType;
  }

  // If we have raw data, extract from there
  const resourceMetrics = response.resourceMetrics || response.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics) {
          for (const metric of scopeMetric.metrics) {
            if (metric.name === key) {
              if (metric.sum) {
                const dataPoints = metric.sum.dataPoints;
                if (dataPoints && dataPoints.length > 0) {
                  const value = dataPoints[0].asDouble || dataPoints[0].asInt || 0;
                  return value as OtelValueType;
                }
              }
            }
          }
        }
      }
    }
  }

  return defaultValue;
}

// Helper to calculate duration in milliseconds from nanoseconds
function calculateDuration (item: MonitoringResponse): string {
  // First try to get from attributes
  if (item.attributes['metric.name'] === 'gen_ai.client.operation.duration') {
    const value = item.attributes['metric.value'];
    if (typeof value === 'number') {
      return `${(value * 1000).toFixed(2)}ms`;
    }
  }

  // Then try to extract from start and end timestamps
  const startTime = item.attributes['start_time'] || item.attributes['startTime'];
  const endTime = item.attributes['end_time'] || item.attributes['endTime'];

  if (startTime && endTime) {
    try {
      const start = new Date(startTime as string).getTime();
      const end = new Date(endTime as string).getTime();
      const durationMs = end - start;
      return `${durationMs.toFixed(2)}ms`;
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Try to extract from resource metrics
  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics) {
          for (const metric of scopeMetric.metrics) {
            if (metric.name === 'gen_ai.client.operation.duration') {
              // Try to extract from histogram data points
              if (metric.histogram && metric.histogram.dataPoints && metric.histogram.dataPoints.length > 0) {
                const dataPoint = metric.histogram.dataPoints[0];
                const value = dataPoint.sum || 0;
                return `${(value * 1000).toFixed(2)}ms`;
              }

              // Try to extract from sum data points as fallback
              if (metric.sum && metric.sum.dataPoints && metric.sum.dataPoints.length > 0) {
                const value = metric.sum.dataPoints[0].asDouble ||
                  metric.sum.dataPoints[0].asInt || 0;
                return `${(value * 1000).toFixed(2)}ms`;
              }
            }
          }
        }
      }
    }
  }

  return 'N/A';
}

// Helper to extract decision information
function getGuardrailDecision (item: MonitoringResponse): { allowed: boolean; layer: string } {
  const allowed = extractAttributes(item, "decision.allowed", true) as boolean;
  const layer = extractAttributes(item, "decision.layer", "default") as string;
  return { allowed, layer };
}

// Helper to extract metrics details for UI display
function getMetricDetails (item: MonitoringResponse): MetricDetails | null {
  if (!item || !item.attributes) return null;

  const metricName = item.attributes['metric.name'] || 'Unknown Metric';
  const metricDescription = item.attributes['metric.description'] || 'No description available';
  const metricUnit = item.attributes['metric.unit'] || '';

  const dataPoints: MetricDataPoint[] = [];

  // Handle OpenTelemetry metric data
  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  resourceMetrics.forEach(resourceMetric => {
    resourceMetric.scopeMetrics.forEach(scopeMetric => {
      scopeMetric.metrics.forEach(metric => {
        // Process histogram data points
        if (metric.histogram) {
          metric.histogram.dataPoints.forEach((dataPoint: OtelMetricDataPoint) => {
            const timestamp = new Date(dataPoint.timeUnixNano / 1000000).toLocaleString();

            // Add a data point for each bucket boundary
            if (dataPoint.bucketCounts && dataPoint.explicitBounds) {
              dataPoint.bucketCounts.forEach((count: number, index: number) => {
                const upperBound = dataPoint.explicitBounds?.[index] || 'Infinity';
                dataPoints.push({
                  value: count,
                  timestamp,
                  attributes: {
                    ...extractPointAttributes(dataPoint),
                    'bucket_bound': upperBound
                  }
                });
              });
            }

            // Add summary values
            dataPoints.push({
              value: dataPoint.sum || 0,
              timestamp,
              attributes: {
                ...extractPointAttributes(dataPoint),
                'type': 'sum'
              }
            });
          });
        }

        // Process sum data points
        if (metric.sum) {
          metric.sum.dataPoints.forEach((dataPoint: OtelMetricDataPoint) => {
            const timestamp = new Date(dataPoint.timeUnixNano / 1000000).toLocaleString();
            dataPoints.push({
              value: dataPoint.asDouble || dataPoint.asInt || 0,
              timestamp,
              attributes: extractPointAttributes(dataPoint)
            });
          });
        }
      });
    });
  });

  return {
    name: metricName,
    description: metricDescription,
    unit: metricUnit,
    dataPoints
  };
}

// Helper to extract attributes from a metric data point
function extractPointAttributes (dataPoint: OtelMetricDataPoint): Record<string, any> {
  if (!dataPoint.attributes) return {};

  if (Array.isArray(dataPoint.attributes)) {
    // Handle array of OtelKeyValue objects
    const attributes: Record<string, any> = {};
    dataPoint.attributes.forEach((attr: OtelKeyValue) => {
      if (attr.key && attr.value) {
        const attrValue = getAttributeValue(attr.value);
        if (attrValue !== null) {
          attributes[attr.key] = attrValue;
        }
      }
    });
    return attributes;
  } else {
    // Handle Record<string, any> format
    return dataPoint.attributes as Record<string, any>;
  }
}

// Get token counts for a metric
function getTokenCounts (row: MonitoringResponse): TokenCounts {
  const result: TokenCounts = { input: 0, output: 0, total: 0 };

  if (!row || !row.attributes) return result;

  // Extract from metrics data
  try {
    const metricDetails = getMetricDetails(row);
    if (!metricDetails || !metricDetails.dataPoints.length) return result;

    metricDetails.dataPoints.forEach(dataPoint => {
      if (!dataPoint.attributes) return;

      const tokenType = dataPoint.attributes['gen_ai.token.type'];
      const value = typeof dataPoint.value === 'number' ? dataPoint.value : 0;

      if (tokenType === 'input') {
        result.input += value;
      } else if (tokenType === 'output') {
        result.output += value;
      }
    });

    result.total = result.input + result.output;
  } catch (error) {
    console.error('Error calculating token counts:', error);
  }

  return result;
}

// Display query from row
function getQueryFromRow (row: MonitoringResponse): string {
  if (!row) return 'No query data available';

  const extractAttributes = (key: string) => {
    const value = row.attributes[key];
    return typeof value === 'string' ? value : 'N/A';
  };

  // First try to get from gen_ai.request.inputs
  const inputs = extractAttributes('gen_ai.request.inputs');
  if (inputs && inputs !== 'N/A') return inputs;

  // Then try to get from attributes
  const query = extractAttributes('query');
  if (query && query !== 'N/A') return query;

  return 'No query data available';
}

// Helper function to extract completion/response text from a record
function getResponseText (item: MonitoringResponse): string {
  // First try to get it from the attributes
  if (item.attributes && item.attributes["gen_ai.response.text"]) {
    return item.attributes["gen_ai.response.text"] as string;
  }

  if (item.attributes && item.attributes["gen_ai.completion"]) {
    return item.attributes["gen_ai.completion"] as string;
  }

  // Check for gen_ai.completion.0.content which is in the example data
  const completionContent = extractAttributes(item, "gen_ai.completion.0.content");
  if (completionContent) {
    return completionContent as string;
  }

  // Then try to extract it from raw data
  const resourceMetrics = item.resourceMetrics || item.resource_metrics || [];
  for (const resourceMetric of resourceMetrics) {
    if (resourceMetric.scopeMetrics) {
      for (const scopeMetric of resourceMetric.scopeMetrics) {
        if (scopeMetric.metrics) {
          for (const metric of scopeMetric.metrics) {
            if (metric.name === "gen_ai.response.text" ||
              metric.name === "gen_ai.completion" ||
              metric.name === "gen_ai.completion.0.content") {
              if (metric.sum) {
                const dataPoints = metric.sum.dataPoints;
                if (dataPoints && dataPoints.length > 0) {
                  return String(dataPoints[0].asDouble || dataPoints[0].asInt || '');
                }
              }
            }
          }
        }
      }
    }
  }

  return "No response text available";
}

definePageMeta({
  layout: "app",
});

const columnHelper = createColumnHelper<MonitoringResponse>();

const columns = reactive([
  columnHelper.accessor((row) => getMetricName(row), {
    id: "name",
    header: "Metric Name",
    cell: ({ getValue }) => {
      const value = getValue();
      return h('div', { class: 'flex items-center' }, [
        h('span', { class: 'truncate max-w-[200px]' }, [value]),
        h('div', { class: 'ml-2 text-muted-foreground' }, [
          h(Icon, { name: "lucide:info", class: 'w-4 h-4' })
        ])
      ]);
    },
  }),
  columnHelper.accessor((row) => getQueryFromRow(row), {
    id: "query",
    header: "Query",
    cell: ({ getValue }) => {
      const value = getValue();
      return h('div', { class: 'flex items-center' }, [
        h('span', { class: 'truncate max-w-[200px]' }, [value]),
        value !== 'No query data available' ? h('div', { class: 'ml-2 text-muted-foreground' }, [
          h(Icon, { name: "lucide:info", class: 'w-4 h-4' })
        ]) : null
      ]);
    },
  }),
  columnHelper.accessor((row) => getMetricValue(row), {
    id: "value",
    header: "Value",
    cell: ({ getValue, row }) => {
      const value = getValue();
      const metricUnit = getMetricUnit(row.original);

      // Special formatting for token usage metrics
      if (row.original.attributes['metric.name'] === 'gen_ai.client.token.usage') {
        const tokenCounts = getTokenCounts(row.original);
        return h('div', { class: 'flex flex-col' }, [
          h('div', { class: 'font-medium' }, `${tokenCounts.total.toLocaleString()} tokens`),
          h('div', { class: 'text-xs text-muted-foreground' }, `(${tokenCounts.input.toLocaleString()} in / ${tokenCounts.output.toLocaleString()} out)`)
        ]);
      }

      return h('span', { class: 'font-mono' }, [formatMetricValue(value, metricUnit)]);
    },
  }),
  columnHelper.accessor((row) => extractAttributes(row, "model"), {
    id: "model",
    header: "Model/System",
    cell: ({ getValue, row }) => {
      const model = getValue() || extractAttributes(row.original, "gen_ai.system") || 'N/A';
      return h('span', {}, [model]);
    },
  }),
  columnHelper.accessor((row) => calculateDuration(row), {
    id: "duration",
    header: "Duration",
    cell: ({ getValue }) => h('span', { class: 'font-mono' }, [getValue()]),
  }),
  columnHelper.accessor((row) => extractResourceAttributes(row, "environment", "unknown"), {
    id: "environment",
    header: "Environment",
    cell: ({ getValue }) => {
      const value = getValue();
      let color: string = 'gray';
      if (value === 'production') color = 'red';
      else if (value === 'staging') color = 'yellow';
      else if (value === 'development') color = 'green';

      return h('div', {
        class: `px-2 py-1 rounded bg-${color}-400/20 text-${color}-600 inline-block text-xs font-medium`
      }, [value]);
    },
  }),
]);

const rowSelection = ref<RowSelectionState>({});
const columnFilters = ref<ColumnFiltersState>([]);
const sorting = ref<SortingState>([]);
const expanded = ref({});
const search = ref("");
const globalFilter = refDebounced(search, 300);

const table = useVueTable({
  columns,
  get data () {
    return items.value || [];
  },
  enableRowSelection: true,
  enableExpanding: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getExpandedRowModel: getExpandedRowModel(),
  state: {
    get rowSelection () {
      return rowSelection.value;
    },
    get sorting () {
      return sorting.value;
    },
    get globalFilter () {
      return globalFilter.value;
    },
    get columnFilters () {
      return columnFilters.value;
    },
    get expanded () {
      return expanded.value;
    }
  },
  onRowSelectionChange: (newRowSelection) => {
    rowSelection.value =
      typeof newRowSelection === "function"
        ? newRowSelection(rowSelection.value)
        : newRowSelection;
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === "function" ? updaterOrValue(sorting.value) : updaterOrValue;
  },
  onGlobalFilterChange: (updaterOrValue) => {
    search.value =
      typeof updaterOrValue === "function" ? updaterOrValue(globalFilter.value) : updaterOrValue;
  },
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value =
      typeof updaterOrValue === "function" ? updaterOrValue(columnFilters.value) : updaterOrValue;
  },
  onExpandedChange: (updaterOrValue) => {
    expanded.value =
      typeof updaterOrValue === "function" ? updaterOrValue(expanded.value) : updaterOrValue;

    const expandedEntries = Object.entries(expanded.value);
    const expandedEntry = expandedEntries.find(([_, isExpanded]) => isExpanded);

    isSheetOpen.value = !!expandedEntry;
  },
});

const selectedRow = computed(() => {
  // Find the first expanded row ID from the expanded state object
  const expandedEntries = Object.entries(expanded.value);
  const expandedEntry = expandedEntries.find(([_, isExpanded]) => isExpanded);

  // If no row is expanded, return null
  if (!expandedEntry) {
    return null;
  }

  // Get the ID of the expanded row
  const [expandedId] = expandedEntry;

  // Find and return the corresponding row data from the table model
  return table.getRowModel().rows.find(row => row.id === expandedId);
});

const isSheetOpen = ref(false);

watch(isSheetOpen, (newValue) => {
  if (!newValue) {
    // Clear expanded state when sheet is closed
    table.setExpanded({});
  }
});
</script>

<template>
  <div class="col-span-3 grid gap-6">
    <UiSheet v-model:open="isSheetOpen">
      <UiSheetContent class="max-w-4xl flex flex-col" side="right" title="Metric Details"
        description="Detailed information about the metric measurement.">
        <template #content>

          <div v-if="selectedRow" class="p-4 space-y-6  bg-muted/30 border-t border-b flex-1 overflow-y-auto">
            <!-- All important metadata in a grid -->
            <div class="grid grid-cols-3 gap-4">
              <div v-if="selectedRow" class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Metric</h4>
                <p class="text-sm">{{ getMetricName(selectedRow.original) }}</p>
              </div>
              <div v-if="selectedRow" class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Unit</h4>
                <p class="text-sm">{{ getMetricUnit(selectedRow.original) }}</p>
              </div>
              <div v-if="selectedRow && (extractAttributes(selectedRow.original, 'conversation.id') ||
                extractAttributes(selectedRow.original, 'traceloop.association.properties.conversation_id'))"
                class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Conversation ID</h4>
                <p class="text-xs font-mono">
                  {{ extractAttributes(selectedRow.original, 'traceloop.association.properties.conversation_id') ||
                    extractAttributes(selectedRow.original, 'conversation.id') }}
                </p>
              </div>
              <div
                v-if="selectedRow && extractAttributes(selectedRow.original, 'traceloop.association.properties.project_id')"
                class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Project ID</h4>
                <p class="text-sm">{{ extractAttributes(selectedRow.original,
                  'traceloop.association.properties.project_id') }}</p>
              </div>
              <div
                v-if="selectedRow && extractAttributes(selectedRow.original, 'traceloop.association.properties.agent_id')"
                class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Agent ID</h4>
                <p class="text-sm">{{ extractAttributes(selectedRow.original,
                  'traceloop.association.properties.agent_id') }}</p>
              </div>
              <div v-if="selectedRow && (extractAttributes(selectedRow.original, 'traceloop.workflow.name') ||
                extractAttributes(selectedRow.original, 'traceloop.entity.name'))" class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Workflow</h4>
                <p class="text-sm">
                  {{ extractAttributes(selectedRow.original, 'traceloop.workflow.name') ||
                    extractAttributes(selectedRow.original, 'traceloop.entity.name') }}
                </p>
              </div>
              <div v-if="selectedRow && extractResourceAttributes(selectedRow.original, 'service.name')"
                class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Service</h4>
                <p class="text-sm">{{ extractResourceAttributes(selectedRow.original, 'service.name') }}</p>
              </div>
            </div>

            <UiSeparator class="my-4" />

            <!-- Metric Details -->
            <div class="space-y-4 mt-4">
              <div v-if="selectedRow && getQueryFromRow(selectedRow.original) !== 'No query data available'">
                <h3 class="font-medium text-sm mb-2">Query</h3>
                <div
                  class="rounded border p-3 bg-white dark:bg-gray-900 overflow-auto whitespace-pre-wrap font-mono text-sm">
                  {{ getQueryFromRow(selectedRow.original) }}
                </div>
              </div>

              <div>
                <h3 class="font-medium text-sm mb-2">Metric Description</h3>
                <div class="rounded border p-3 bg-white dark:bg-gray-900 overflow-auto">
                  {{ selectedRow && selectedRow.original.attributes['metric.description'] || 'No description available'
                  }}
                </div>
              </div>

              <!-- Token Usage Summary for token usage metrics -->
              <div v-if="selectedRow && selectedRow.original.attributes['metric.name'] === 'gen_ai.client.token.usage'">
                <h3 class="font-medium text-sm mb-2">Token Usage Summary</h3>
                <div class="grid grid-cols-3 gap-4 p-3 border rounded">
                  <div class="space-y-1">
                    <h4 class="text-xs text-muted-foreground font-medium">Input Tokens</h4>
                    <p class="text-base font-medium">{{ getTokenCounts(selectedRow.original).input.toLocaleString() }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <h4 class="text-xs text-muted-foreground font-medium">Output Tokens</h4>
                    <p class="text-base font-medium">{{ getTokenCounts(selectedRow.original).output.toLocaleString() }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <h4 class="text-xs text-muted-foreground font-medium">Total Tokens</h4>
                    <p class="text-base font-medium">{{ getTokenCounts(selectedRow.original).total.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Operation Duration for duration metrics -->
              <div
                v-if="selectedRow && selectedRow.original.attributes['metric.name'] === 'gen_ai.client.operation.duration'">
                <h3 class="font-medium text-sm mb-2">Operation Duration</h3>
                <div class="p-3 border rounded">
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div class="text-xs text-muted-foreground">Time to complete</div>
                      <div class="text-base font-medium">
                        {{ selectedRow.original.attributes['metric.value'] ?
                          `${(Number(selectedRow.original.attributes['metric.value']) * 1000).toFixed(2)}ms` : 'N/A' }}
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="text-xs text-muted-foreground">Operation</div>
                      <div class="text-base font-medium">
                        {{ selectedRow.original.attributes['gen_ai.operation.name'] || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-medium text-sm mb-2">Data Points</h3>
                <div class="border rounded overflow-hidden">
                  <table class="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Value
                        </th>
                        <th
                          v-if="selectedRow && selectedRow.original.attributes['metric.name'] === 'gen_ai.client.token.usage'"
                          class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Token Type
                        </th>
                        <th
                          class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      <template v-if="selectedRow && getMetricDetails(selectedRow.original)?.dataPoints.length">
                        <tr v-for="(point, idx) in getMetricDetails(selectedRow.original)?.dataPoints?.slice(0, 10)"
                          :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {{ point.value.toLocaleString() }}{{ getMetricDetails(selectedRow.original)?.unit ? `
                            ${getMetricDetails(selectedRow.original)?.unit}` : '' }}
                          </td>
                          <td
                            v-if="selectedRow && selectedRow.original.attributes['metric.name'] === 'gen_ai.client.token.usage'"
                            class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <UiBadge :color="point.attributes?.['gen_ai.token.type'] === 'input' ? 'green' : 'blue'">
                              {{ point.attributes?.['gen_ai.token.type'] || 'unknown' }}
                            </UiBadge>
                          </td>
                          <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ point.timestamp }}
                          </td>
                        </tr>
                      </template>
                      <tr v-else>
                        <td
                          :colspan="selectedRow && selectedRow.original.attributes['metric.name'] === 'gen_ai.client.token.usage' ? 3 : 2"
                          class="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                          No data points available
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="selectedRow && getMetricDetails(selectedRow.original)?.dataPoints.length > 10"
                    class="px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                    Showing 10 of {{ getMetricDetails(selectedRow.original)?.dataPoints.length }} data points
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-medium text-sm mb-2">Raw Data</h3>
                <div
                  class="rounded border p-3 bg-white dark:bg-gray-900 overflow-auto whitespace-pre-wrap font-mono text-sm max-h-80">
                  <Shiki lang="json" :code="JSON.stringify(selectedRow.original, null, 2)" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center">
            <p class="text-muted-foreground">Loading details...</p>
          </div>

        </template>
        <template #footer>
          <UiSheetFooter>
            <UiSheetClose as-child>
              <UiButton type="button">Close</UiButton>
            </UiSheetClose>
          </UiSheetFooter>
        </template>
      </UiSheetContent>
    </UiSheet>


    <CommonPageTitle title="Metrics Monitoring" description="Monitor your AI metrics" />

    <div>
      <div class="md:w-1/2 lg:max-w-[300px]">
        <UiVeeInput v-model="search" placeholder="Search metrics" icon="lucide:search" label="Search" />
      </div>

      <!-- Loading and error states -->
      <div v-if="isLoading" class="mt-8 flex justify-center">
        <Icon class="size-8 animate-spin" name="lucide:loader-circle" />
      </div>

      <div v-else-if="error"
        class="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{{ error.message || 'Failed to load metrics' }}</p>
      </div>

      <!-- Render the table when data is loaded -->
      <UiTable v-else class="mt-8 overflow-y-auto">
        <UiTableHeader>
          <!-- For rows, we loop over the tables `getHeaderGroups` function -->
          <UiTableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="bg-muted/50">
            <!-- For each header, we loop over the headers in the headerGroup -->
            <UiTableHead v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan"
              :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
              class="relative h-10 select-none border-t" @click="header.column.getToggleSortingHandler()?.($event)">
              <div class="flex w-full items-center gap-3 whitespace-nowrap">
                <!-- Render the header cell -->
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                  :props="header.getContext()" />
                <Icon v-if="header.column.getIsSorted() == 'asc'" name="lucide:chevron-up"
                  class="size-4 shrink-0 text-muted-foreground" />
                <Icon v-else-if="header.column.getIsSorted() == 'desc'" name="lucide:chevron-down"
                  class="size-4 shrink-0 text-muted-foreground" />
                <Icon v-else-if="header.column.getCanSort()" name="lucide:chevrons-up-down"
                  class="size-4 shrink-0 text-muted-foreground/30" />
              </div>
            </UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <!-- If there are rows, loop over them -->
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <!-- Regular row -->
              <UiTableRow :data-state="row.getIsSelected() && 'selected'" class="cursor-pointer hover:bg-muted/50"
                @click="row.toggleExpanded()">
                <!-- For each cell in the row, loop over the visible cells -->
                <UiTableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <!-- Render the cell -->
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </UiTableCell>
              </UiTableRow>
            </template>
          </template>
          <!-- If there are no rows, show a message -->
          <template v-else>
            <UiTableRow>
              <UiTableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </UiTableCell>
            </UiTableRow>
          </template>
        </UiTableBody>
      </UiTable>
    </div>
  </div>
</template>