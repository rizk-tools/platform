CREATE TABLE IF NOT EXISTS traces_raw (
  tenant_id String,
  timestamp DateTime,
  data String,
  insert_time DateTime DEFAULT now()
) ENGINE = MergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY; 