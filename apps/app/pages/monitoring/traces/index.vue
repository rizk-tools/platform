<script setup lang="ts">
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
import { Icon, UiCheckbox } from "#components";
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

// Define the type for our data
interface MonitoringResponse {
  id: string;
  attributes: Record<string, unknown>;
  resourceAttributes: Record<string, unknown>;
  raw?: {
    resourceSpans?: OtelResourceSpan[];
  };
}

// Transform the data from the backend to a usable format
function transformResponseData (data: unknown[]): MonitoringResponse[] {
  return data.map(item => {
    // If the data is already in the expected format, just return it
    if (typeof item === 'object' && item !== null && 'id' in item &&
      (('attributes' in item) || ('raw' in item))) {
      return item as MonitoringResponse;
    }

    // Otherwise, transform the object to fit our expected structure
    return {
      id: crypto.randomUUID(), // Generate a random ID if none exists
      attributes: {}, // Empty attributes object
      resourceAttributes: {}, // Empty resourceAttributes object
      raw: item as Record<string, unknown> // Use the entire item as raw data
    } as MonitoringResponse;
  });
}

// Define a query to fetch monitoring responses
const { data: rawItems, isLoading, error } = useQuery({
  key: ['monitoring', 'responses'],
  query: async () => {
    const res = await client.api.monitoring.traces.$get()

    if (!res.ok) {
      throw new Error(`Failed to fetch monitoring responses: ${res.status} ${res.statusText}`)
    }

    return await res.json()
  },
})

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
  if (response.raw?.resourceSpans) {
    // Try to find the resource spans data
    for (const resourceSpan of response.raw.resourceSpans) {
      if (resourceSpan.scopeSpans) {
        for (const scopeSpan of resourceSpan.scopeSpans) {
          if (scopeSpan.spans) {
            for (const span of scopeSpan.spans) {
              if (span.attributes) {
                // Search for the attribute in the KeyValue pairs
                for (const attr of span.attributes) {
                  if (attr.key === key) {
                    if (attr.value) {
                      if (attr.value.stringValue !== undefined) return attr.value.stringValue;
                      if (attr.value.intValue !== undefined) return attr.value.intValue;
                      if (attr.value.doubleValue !== undefined) return attr.value.doubleValue;
                      if (attr.value.boolValue !== undefined) return attr.value.boolValue;
                      if (attr.value.arrayValue?.values) {
                        return attr.value.arrayValue.values.map((v) => {
                          if (v.stringValue !== undefined) return v.stringValue;
                          if (v.intValue !== undefined) return v.intValue;
                          if (v.doubleValue !== undefined) return v.doubleValue;
                          if (v.boolValue !== undefined) return v.boolValue;
                          return null;
                        }).filter(Boolean) as OtelValueType;
                      }
                    }
                  }
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
  if (response.resourceAttributes && response.resourceAttributes[key] !== undefined) {
    return response.resourceAttributes[key] as OtelValueType;
  }

  // If we have raw data, extract from there
  if (response.raw?.resourceSpans) {
    for (const resourceSpan of response.raw.resourceSpans) {
      if (resourceSpan.resource && resourceSpan.resource.attributes) {
        for (const attr of resourceSpan.resource.attributes) {
          if (attr.key === key) {
            if (attr.value) {
              if (attr.value.stringValue !== undefined) return attr.value.stringValue;
              if (attr.value.intValue !== undefined) return attr.value.intValue;
              if (attr.value.doubleValue !== undefined) return attr.value.doubleValue;
              if (attr.value.boolValue !== undefined) return attr.value.boolValue;
              if (attr.value.arrayValue?.values) {
                return attr.value.arrayValue.values.map((v) => {
                  if (v.stringValue !== undefined) return v.stringValue;
                  if (v.intValue !== undefined) return v.intValue;
                  if (v.doubleValue !== undefined) return v.doubleValue;
                  if (v.boolValue !== undefined) return v.boolValue;
                  return null;
                }).filter(Boolean) as OtelValueType;
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
  if (item.raw?.resourceSpans) {
    for (const resourceSpan of item.raw.resourceSpans) {
      if (resourceSpan.scopeSpans) {
        for (const scopeSpan of resourceSpan.scopeSpans) {
          if (scopeSpan.spans) {
            // Find spans related to LLM calls which typically take the longest
            for (const span of scopeSpan.spans) {
              if (span.name?.includes('openai') || span.name?.includes('chat')) {
                const durationNs = span.endTimeUnixNano - span.startTimeUnixNano;
                const durationMs = durationNs / 1000000;
                return `${durationMs.toFixed(2)}ms`;
              }
            }
            // If no LLM span, use any span
            if (scopeSpan.spans.length > 0) {
              const span = scopeSpan.spans[0];
              const durationNs = span.endTimeUnixNano - span.startTimeUnixNano;
              const durationMs = durationNs / 1000000;
              return `${durationMs.toFixed(2)}ms`;
            }
          }
        }
      }
    }
  }
  return "N/A";
}

// Helper to extract decision information
function getGuardrailDecision (item: MonitoringResponse): { allowed: boolean; layer: string } {
  const allowed = extractAttributes(item, "decision.allowed", true) as boolean;
  const layer = extractAttributes(item, "decision.layer", "default") as string;
  return { allowed, layer };
}

definePageMeta({
  layout: "app",
});

const columnHelper = createColumnHelper<MonitoringResponse>();

const columns = [
  columnHelper.accessor(row => {
    // Try multiple paths to find the query
    const query = extractAttributes(row, "traceloop.association.properties.query") ||
      extractAttributes(row, "traceloop.entity.input");

    // If it's a JSON string representing an object with args, parse it
    if (typeof query === 'string' && query.startsWith('{') && query.includes('"args":')) {
      try {
        const parsed = JSON.parse(query);
        if (parsed.args && Array.isArray(parsed.args) && parsed.args.length > 0) {
          return parsed.args[0];
        }
      } catch {
        // If parsing fails, just return the original string
      }
    }

    return query;
  }, {
    id: "query",
    header: "Query",
    sortingFn: "text",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "N/A";

      // Create a container for the text with line clamp and proper text wrapping
      return h("div", {
        class: "max-w-sm text-sm font-medium line-clamp-3 break-words whitespace-pre-wrap",
        title: value // Show full text on hover
      }, value);
    },
  }),
  columnHelper.accessor(row => {
    const decision = getGuardrailDecision(row);
    return decision.allowed;
  }, {
    id: "guardrailDecision",
    header: "Guardrail",
    cell: ({ row }) => {
      const decision = getGuardrailDecision(row.original);
      const style = decision.allowed
        ? "bg-emerald-400/20 text-emerald-600"
        : "bg-destructive/20 text-destructive";

      return h(
        "div",
        { class: `px-2 py-1 rounded ${style} inline-block text-xs font-medium flex items-center gap-1` },
        [
          decision.allowed
            ? h(Icon, { name: "lucide:check-circle", class: "size-3" })
            : h(Icon, { name: "lucide:x-circle", class: "size-3" }),
          h("span", {}, `${decision.allowed ? "Allowed" : "Blocked"} (${decision.layer})`)
        ]
      );
    },
  }),
  columnHelper.accessor(row => extractAttributes(row, "gen_ai.request.model"), {
    id: "model",
    header: "Model",
    sortingFn: "text",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value || "N/A";
    },
  }),
  columnHelper.accessor(row => calculateDuration(row), {
    id: "duration",
    header: "Response Time",
    cell: ({ getValue }) => getValue(),
  }),
  columnHelper.accessor(row => extractResourceAttributes(row, "deployment.environment"), {
    id: "environment",
    header: "Environment",
    cell: ({ getValue }) => {
      const env = getValue() as string;
      const styles: Record<string, string> = {
        development: "bg-amber-400/20 text-amber-600",
        staging: "bg-indigo-400/20 text-indigo-600",
        production: "bg-emerald-400/20 text-emerald-600",
      };
      const style = styles[env] || "bg-gray-400/20 text-gray-600";

      return h("div", { class: `px-2 py-1 rounded ${style} inline-block text-xs font-medium` }, env || "N/A");
    },
  }),
];

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

// Helper to extract completion/response text from a record
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
  if (item.raw?.resourceSpans) {
    for (const resourceSpan of item.raw.resourceSpans) {
      if (resourceSpan.scopeSpans) {
        for (const scopeSpan of resourceSpan.scopeSpans) {
          if (scopeSpan.spans) {
            for (const span of scopeSpan.spans) {
              if (span.attributes) {
                for (const attr of span.attributes) {
                  if (attr.key === "gen_ai.response.text" ||
                    attr.key === "gen_ai.completion" ||
                    attr.key === "gen_ai.completion.0.content") {
                    if (attr.value && attr.value.stringValue !== undefined) {
                      return attr.value.stringValue;
                    }
                  }
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
      <UiSheetContent class="max-w-4xl flex flex-col" side="right" title="AI Response Details"
        description="Detailed information about the AI interaction.">
        <template #content>

          <div v-if="selectedRow" class="p-4 space-y-6  bg-muted/30 border-t border-b flex-1 overflow-y-auto">
            <!-- All important metadata in a grid -->
            <div class="grid grid-cols-3 gap-4">
              <div v-if="selectedRow && (extractAttributes(selectedRow.original, 'traceloop.association.properties.conversation_id') ||
                extractAttributes(selectedRow.original, 'conversation.id'))" class="space-y-1">
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
              <div v-if="selectedRow && (extractAttributes(selectedRow.original, 'gen_ai.usage.total_tokens') ||
                extractAttributes(selectedRow.original, 'llm.usage.total_tokens'))" class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Tokens</h4>
                <p class="text-sm">
                  {{ new Intl.NumberFormat("en-US").format(Number(extractAttributes(selectedRow.original,
                    'gen_ai.usage.total_tokens') ||
                    extractAttributes(selectedRow.original, 'llm.usage.total_tokens') || 0)) }}
                </p>
              </div>
              <div v-if="selectedRow && extractAttributes(selectedRow.original, 'gen_ai.usage.cost')" class="space-y-1">
                <h4 class="text-xs text-muted-foreground font-medium">Cost</h4>
                <p class="text-sm">
                  {{ new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4
                  }).format(Number(extractAttributes(selectedRow.original, 'gen_ai.usage.cost') || 0)) }}
                </p>
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

            <!-- Request and Response -->
            <div class="space-y-4 mt-4">
              <div>
                <h3 class="font-medium text-sm mb-2">Query</h3>
                <div
                  class="rounded border p-3 bg-white dark:bg-gray-900 overflow-auto whitespace-pre-wrap font-mono text-sm">
                  {{ extractAttributes(selectedRow.original, 'traceloop.association.properties.query') ||
                    extractAttributes(selectedRow.original, 'traceloop.entity.input') || 'No query data available' }}
                </div>
              </div>
              <div>
                <h3 class="font-medium text-sm mb-2">Response</h3>
                <div
                  class="rounded border p-3 bg-white dark:bg-gray-900 overflow-auto whitespace-pre-wrap font-mono text-sm">
                  {{ getResponseText(selectedRow.original) }}
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


    <CommonPageTitle title="Monitoring" description="Monitor your AI responses" />

    <div>
      <div class="md:w-1/2 lg:max-w-[300px]">
        <UiVeeInput v-model="search" placeholder="Search queries" icon="lucide:search" label="Search" />
      </div>

      <!-- Loading and error states -->
      <div v-if="isLoading" class="mt-8 flex justify-center">
        <Icon class="size-8 animate-spin" name="lucide:loader-circle" />
      </div>

      <div v-else-if="error"
        class="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{{ error.message || 'Failed to load responses' }}</p>
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