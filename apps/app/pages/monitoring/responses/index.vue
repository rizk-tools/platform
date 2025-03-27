<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
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

const columnHelper = createColumnHelper();

const columns = [
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
      });
    },
  }),
  columnHelper.accessor(row => row.attributes["traceloop.association.properties.query"], {
    id: "query",
    header: "Query",
    sortingFn: "text",
    cell: ({ getValue }) => h("span", { class: tw`font-medium` }, getValue()),
  }),
  columnHelper.accessor(row => row.attributes["traceloop.workflow.name"], {
    id: "workflow",
    header: "Workflow",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => row.resourceAttributes["service.name"], {
    id: "service",
    header: "Service",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => row.resourceAttributes["langfuse.tags"], {
    id: "tags",
    header: "Tags",
    enableSorting: false,
    cell: ({ getValue }) => {
      const tags = getValue() || [];
      return h(
        "div",
        { class: tw`flex items-center gap-1 flex-wrap` },
        tags.map((tag) => {
          return h(
            "div",
            {
              class: tw`px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded`,
            },
            tag
          );
        })
      );
    },
  }),
  columnHelper.accessor(row => row.attributes["gen_ai.request.model"], {
    id: "model",
    header: "Model",
    sortingFn: "text",
  }),
  columnHelper.accessor(row => row.attributes["gen_ai.usage.total_tokens"], {
    id: "tokens",
    header: "Tokens",
    cell: ({ getValue }) => {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(getValue() || 0);
    },
  }),
  columnHelper.accessor(row => row.attributes["gen_ai.usage.cost"], {
    id: "cost",
    header: "Cost",
    cell: ({ getValue }) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(getValue() || 0);
    },
  }),
  columnHelper.accessor(row => row.resourceAttributes["deployment.environment"], {
    id: "environment",
    header: "Environment",
    cell: ({ getValue }) => {
      const env = getValue();
      const styles = {
        development: "bg-amber-400/20 text-amber-600",
        staging: "bg-indigo-400/20 text-indigo-600",
        production: "bg-emerald-400/20 text-emerald-600",
      };
      const style = styles[env] || "bg-gray-400/20 text-gray-600";

      return h(
        "div",
        { class: tw`px-2 py-1 rounded ${style} inline-block text-xs font-medium` },
        env
      );
    },
  }),
];

const rowSelection = ref<RowSelectionState>({});
const columnFilters = ref<ColumnFiltersState>([]);
const sorting = ref<SortingState>([]);
const search = ref("");
const globalFilter = refDebounced(search, 300);
const table = useVueTable({
  columns,
  get data () {
    return items.value || [];
  },
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
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
});
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

      <div v-else-if="error"
        class="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{{ error.message || 'Failed to load responses' }}</p>
      </div>

      <!-- Render the table when data is loaded -->
      <UiTable v-else class="mt-8">
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
            <!-- For each row, loop over the tables `getRowModel().rows` -->
            <UiTableRow v-for="row in table.getRowModel().rows" :key="row.id"
              :data-state="row.getIsSelected() && 'selected'">
              <!-- For each cell in the row, loop over the visible cells -->
              <UiTableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <!-- Render the cell -->
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </UiTableCell>
            </UiTableRow>
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