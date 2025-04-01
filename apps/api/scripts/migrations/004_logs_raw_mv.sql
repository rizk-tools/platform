CREATE MATERIALIZED VIEW IF NOT EXISTS logs_raw_mv ENGINE = AggregatingMergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY AS
SELECT
  tenant_id,
  timestamp,
  count() as log_count
FROM
  logs_raw
GROUP BY
  tenant_id,
  timestamp; 