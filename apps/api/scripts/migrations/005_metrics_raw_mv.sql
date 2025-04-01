CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_raw_mv ENGINE = AggregatingMergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY AS
SELECT
  tenant_id,
  timestamp,
  count() as metric_count
FROM
  metrics_raw
GROUP BY
  tenant_id,
  timestamp; 