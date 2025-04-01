-- Create table for storing raw trace data
CREATE TABLE IF NOT EXISTS traces_raw (
  tenant_id String,
  timestamp DateTime,
  data String,
  insert_time DateTime DEFAULT now()
) ENGINE = MergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY;

-- Create table for storing raw logs data
CREATE TABLE IF NOT EXISTS logs_raw (
  tenant_id String,
  timestamp DateTime,
  data String,
  insert_time DateTime DEFAULT now()
) ENGINE = MergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY;

-- Create table for storing raw metrics data
CREATE TABLE IF NOT EXISTS metrics_raw (
  tenant_id String,
  timestamp DateTime,
  data String,
  insert_time DateTime DEFAULT now()
) ENGINE = MergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY;

-- Create materialized views for better query performance (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS traces_raw_mv ENGINE = AggregatingMergeTree() PARTITION BY toYYYYMM(timestamp)
ORDER BY
  (tenant_id, timestamp) TTL timestamp + INTERVAL 30 DAY AS
SELECT
  tenant_id,
  timestamp,
  count() as trace_count
FROM
  traces_raw
GROUP BY
  tenant_id,
  timestamp;

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