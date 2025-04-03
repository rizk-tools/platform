// composables/useDummyDashboardData.ts
import { computed, ref } from "vue";

export function useDummyDashboardData(dateRange: { start: Date; end: Date }) {
  const totalTraces = ref(2260);
  const tracesByCategory = ref([
    { label: "QA", value: 2063 },
    { label: "Sales", value: 150 },
    { label: "Support", value: 47 },
  ]);

  const tracesChartData = computed(() => ({
    labels: tracesByCategory.value.map((item) => item.label),
    datasets: [
      {
        label: "Traces",
        backgroundColor: "#3B82F6",
        data: tracesByCategory.value.map((item) => item.value),
      },
    ],
  }));

  function getDateLabels(start: Date, end: Date) {
    const labels = [];
    const current = new Date(start);
    while (current <= end) {
      labels.push(`${current.getMonth() + 1}/${current.getDate()}`);
      current.setDate(current.getDate() + 1);
    }
    return labels;
  }

  const tracesLineData = computed(() => {
    const labels = getDateLabels(dateRange.start, dateRange.end);
    return {
      labels,
      datasets: [
        {
          label: "Traces",
          data: labels.map(() => Math.floor(Math.random() * 500)),
          borderColor: "#6366F1",
          backgroundColor: "rgba(99,102,241,0.2)",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    };
  });

  const modelCosts = ref([
    { model: "gpt-4o-mini", tokens: 2044, usd: 0.1856 },
    { model: "text-embedding-ada-002", tokens: 31142, usd: 0.249 },
  ]);
  const totalCost = computed(() => modelCosts.value.reduce((sum, m) => sum + m.usd, 0));

  const scoresData = ref([
    { name: "hallucination (eval)", count: 2300, avg: 1.05 },
    { name: "irrelevance (eval)", count: 1875, avg: 2.14 },
    { name: "conciseness (eval)", count: 890, avg: 1.33 },
    { name: "friendly (eval)", count: 560, avg: 1.8 },
    { name: "frank-yuri (eval)", count: 132, avg: 2.0 },
  ]);
  const totalScores = computed(() => scoresData.value.reduce((sum, s) => sum + s.count, 0));

  const usageChartData = computed(() => {
    const labels = getDateLabels(dateRange.start, dateRange.end);
    return {
      labels,
      datasets: [
        {
          label: "gpt-4o-mini",
          data: labels.map(() => Math.random() * 0.2),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "text-embedding-ada-002",
          data: labels.map(() => Math.random() * 0.1),
          borderColor: "#14B8A6",
          backgroundColor: "rgba(20,184,166,0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  });

  const totalTokens = computed(() => {
    return modelCosts.value.reduce((sum, m) => sum + m.tokens, 0);
  });

  return {
    totalTraces,
    tracesByCategory,
    tracesChartData,
    tracesLineData,
    modelCosts,
    totalCost,
    scoresData,
    totalScores,
    usageChartData,
    totalTokens,
  };
}
