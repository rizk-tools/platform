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

// Define the type for our data
interface MonitoringResponse {
  id: string;
  attributes: Record<string, unknown>;
  resourceAttributes: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

// Helper function to extract attributes from raw data
function extractAttributes(response: MonitoringResponse, key: string, defaultValue: OtelValueType = ""): OtelValueType {
  // If we have the attributes already, use them
  if (response.attributes && response.attributes[key] !== undefined) {
    return response.attributes[key] as OtelValueType;
  }
  
  // If we have raw data from ClickHouse, extract from there
  if (response.raw) {
    // Try to find the resource spans data
    if (response.raw.resourceSpans) {
      for (const resourceSpan of (response.raw.resourceSpans as any[])) {
        if (resourceSpan.scopeSpans) {
          for (const scopeSpan of (resourceSpan.scopeSpans as any[])) {
            if (scopeSpan.spans) {
              for (const span of (scopeSpan.spans as any[])) {
                if (span.attributes) {
                  // Search for the attribute in the KeyValue pairs
                  for (const attr of (span.attributes as any[])) {
                    if (attr.key === key) {
                      if (attr.value) {
                        if (attr.value.stringValue !== undefined) return attr.value.stringValue;
                        if (attr.value.intValue !== undefined) return attr.value.intValue;
                        if (attr.value.doubleValue !== undefined) return attr.value.doubleValue;
                        if (attr.value.boolValue !== undefined) return attr.value.boolValue;
                        if (attr.value.arrayValue?.values) {
                          return attr.value.arrayValue.values.map((v: Record<string, unknown>) => {
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
  }
  
  return defaultValue;
}

// Helper to extract resource attributes from raw data
function extractResourceAttributes(response: MonitoringResponse, key: string, defaultValue: OtelValueType = ""): OtelValueType {
  // If we have the resource attributes directly, use them
  if (response.resourceAttributes && response.resourceAttributes[key] !== undefined) {
    return response.resourceAttributes[key] as OtelValueType;
  }
  
  // If we have raw data, extract from there
  if (response.raw) {
    if (response.raw.resourceSpans) {
      for (const resourceSpan of (response.raw.resourceSpans as any[])) {
        if (resourceSpan.resource && resourceSpan.resource.attributes) {
          for (const attr of (resourceSpan.resource.attributes as any[])) {
            if (attr.key === key) {
              if (attr.value) {
                if (attr.value.stringValue !== undefined) return attr.value.stringValue;
                if (attr.value.intValue !== undefined) return attr.value.intValue;
                if (attr.value.doubleValue !== undefined) return attr.value.doubleValue;
                if (attr.value.boolValue !== undefined) return attr.value.boolValue;
                if (attr.value.arrayValue?.values) {
                  return attr.value.arrayValue.values.map((v: Record<string, unknown>) => {
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
  
  return defaultValue;
}

definePageMeta({
  layout: "app",
});

// Define a query to fetch monitoring responses
const { data: items, isLoading, error } = useQuery({
  key: ['monitoring', 'responses'],
  query: async () => {
    const res = await client.api.monitoring.responses.$get()

    if (!res.ok) {
      throw new Error(`Failed to fetch monitoring responses: ${res.status} ${res.statusText}`)
    }

    return await res.json()
  },
})

const columnHelper = createColumnHelper<MonitoringResponse>();

const columns = [
  // Expand/collapse column
  columnHelper.display({
    id: "expand",
    header: "",
    cell: ({ row }) =>
      h(
        "button",
        {
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            row.toggleExpanded();
          },
          class: "cursor-pointer p-1"
        },
        h(Icon, {
          name: row.getIsExpanded() ? "lucide:chevron-down" : "lucide:chevron-right",
          class: "size-4"
        })
      ),
  }),
  columnHelper.accessor("id", {
    enableSorting: false,
    enableGlobalFilter: false,
    header ({ table }) {
      return h(UiCheckbox, {
        checked: table.getIsSomeRowsSelected()
          ? "indeterminate"
          : table.getIsAllRowsSelected()
            ? true
            : false,
        "onUpdate:checked": (v) =>
          table.getToggleAllRowsSelectedHandler()({ target: { checked: v } }),
      });
    },
    cell ({ row }) {
      return h(UiCheckbox, {
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        "onUpdate:checked": row.getToggleSelectedHandler(),
        onClick: (e: MouseEvent) => e.stopPropagation(),
      });
    },
  }),
  columnHelper.accessor(row => extractAttributes(row, "traceloop.association.properties.query"), {
    id: "query",
    header: "Query",
    sortingFn: "text",
    cell: ({ getValue }) => h("span", { class: "font-medium" }, getValue() as string),
  }),
  columnHelper.accessor(row => extractAttributes(row, "traceloop.workflow.name"), {
    id: "workflow",
    header: "Workflow",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => extractResourceAttributes(row, "service.name"), {
    id: "service",
    header: "Service",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => extractResourceAttributes(row, "langfuse.tags"), {
    id: "tags",
    header: "Tags",
    enableSorting: false,
    cell: ({ getValue }) => {
      const tags = getValue() as string[] || [];
      return h(
        "div",
        { class: "flex items-center gap-1 flex-wrap" },
        tags.map((tag: string) => {
          return h(
            "div",
            {
              class: "px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded",
            },
            tag
          );
        })
      );
    },
  }),
  columnHelper.accessor(row => extractAttributes(row, "gen_ai.request.model"), {
    id: "model",
    header: "Model",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => extractAttributes(row, "gen_ai.usage.total_tokens"), {
    id: "tokens",
    header: "Tokens",
    cell: ({ getValue }) => {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(Number(getValue() || 0));
    },
  }),
  columnHelper.accessor(row => extractAttributes(row, "gen_ai.usage.cost"), {
    id: "cost",
    header: "Cost",
    cell: ({ getValue }) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(Number(getValue() || 0));
    },
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

      return h("div", { class: `px-2 py-1 rounded ${style} inline-block text-xs font-medium` }, env);
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
  },
});

// Helper to extract completion/response text from a record
function getResponseText(item: MonitoringResponse): string {
  // First try to get it from the attributes
  if (item.attributes && item.attributes["gen_ai.response.text"]) {
    return item.attributes["gen_ai.response.text"] as string;
  }
  
  if (item.attributes && item.attributes["gen_ai.completion"]) {
    return item.attributes["gen_ai.completion"] as string;
  }
  
  // Then try to extract it from raw data
  if (item.raw && item.raw.resourceSpans) {
    for (const resourceSpan of (item.raw.resourceSpans as any[])) {
      if (resourceSpan.scopeSpans) {
        for (const scopeSpan of (resourceSpan.scopeSpans as any[])) {
          if (scopeSpan.spans) {
            for (const span of (scopeSpan.spans as any[])) {
              if (span.attributes) {
                for (const attr of (span.attributes as any[])) {
                  if (attr.key === "gen_ai.response.text" || attr.key === "gen_ai.completion") {
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
</script>

<template>
  <div class="col-span-3 grid gap-6">
    <CommonPageTitle title="Monitoring" description="Monitor your AI responses" />

    <div>
      <div class="md:w-1/2 lg:max-w-[300px]">
        <UiVeeInput v-model="search" placeholder="Search queries" icon="lucide:search" label="Search" />
      </div>

      <!-- Loading and error states -->
      <div v-if="isLoading" class="mt-8 flex justify-center">
        <Icon class="size-8" name="lucide:loader-circle" />
      </div>

      <div
v-else-if="error"
        class="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{{ error.message || 'Failed to load responses' }}</p>
      </div>

      <!-- Render the table when data is loaded -->
      <UiTable v-else class="mt-8">
        <UiTableHeader>
          <!-- For rows, we loop over the tables `getHeaderGroups` function -->
          <UiTableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="bg-muted/50">
            <!-- For each header, we loop over the headers in the headerGroup -->
            <UiTableHead
v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan"
              :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
              class="relative h-10 select-none border-t" @click="header.column.getToggleSortingHandler()?.($event)">
              <div class="flex w-full items-center gap-3 whitespace-nowrap">
                <!-- Render the header cell -->
                <FlexRender
v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                  :props="header.getContext()" />
                <Icon
v-if="header.column.getIsSorted() == 'asc'" name="lucide:chevron-up"
                  class="size-4 shrink-0 text-muted-foreground" />
                <Icon
v-else-if="header.column.getIsSorted() == 'desc'" name="lucide:chevron-down"
                  class="size-4 shrink-0 text-muted-foreground" />
                <Icon
v-else-if="header.column.getCanSort()" name="lucide:chevrons-up-down"
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
              <UiTableRow
:data-state="row.getIsSelected() && 'selected'" class="cursor-pointer hover:bg-muted/50"
                @click="row.toggleExpanded()">
                <!-- For each cell in the row, loop over the visible cells -->
                <UiTableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <!-- Render the cell -->
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </UiTableCell>
              </UiTableRow>

              <!-- Expanded row content -->
              <tr v-if="row.getIsExpanded()">
                <td :colspan="columns.length" class="p-0">
                  <div class="p-4 bg-muted/30 border-t border-b">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h3 class="font-medium text-sm mb-2">Request Details</h3>
                        <pre
                          class="text-xs bg-muted p-2 rounded max-h-80 overflow-auto">{{ JSON.stringify(row.original, null, 2) }}</pre>
                      </div>
                      <div>
                        <h3 class="font-medium text-sm mb-2">Response</h3>
                        <pre
                          class="text-xs bg-muted p-2 rounded max-h-80 overflow-auto">{{ getResponseText(row.original) }}</pre>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
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