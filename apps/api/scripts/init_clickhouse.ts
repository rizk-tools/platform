import clickhouse from "@/lib/clickhouse";

async function createTables () {
  try {
    // Create traces table with JSON storage
    await clickhouse.exec({
      query: `
        CREATE TABLE IF NOT EXISTS traces (
          tenant_id String,
          timestamp DateTime64(9) DEFAULT now64(9),
          trace_id String,
          span_id String,
          parent_span_id String,
          operation_name String,
          service_name String,
          start_time_unix_nano UInt64,
          end_time_unix_nano UInt64,
          duration_ms Float64,
          kind Int32,
          status_code Int32,
          status_message String,
          resource_attributes JSON, -- Store resource attributes as JSON
          span_attributes JSON,    -- Store span attributes as JSON
          events JSON,            -- Store events as JSON
          links JSON,             -- Store links as JSON
          data JSON CODEC(ZSTD(3)), -- Store full trace data as compressed JSON
          INDEX tenant_idx tenant_id TYPE bloom_filter GRANULARITY 1,
          INDEX trace_idx trace_id TYPE bloom_filter GRANULARITY 1,
          INDEX service_idx service_name TYPE bloom_filter GRANULARITY 1,
          INDEX operation_idx operation_name TYPE bloom_filter GRANULARITY 1
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (tenant_id, timestamp, trace_id);
      `
    });

    // Create metrics table
    await clickhouse.exec({
      query: `
        CREATE TABLE IF NOT EXISTS metrics (
          tenant_id String,
          timestamp DateTime64(9) DEFAULT now64(9),
          metric_name String,
          metric_type Enum8('counter' = 1, 'gauge' = 2, 'histogram' = 3),
          value Float64,
          labels_json String,
          INDEX tenant_idx tenant_id TYPE bloom_filter GRANULARITY 1,
          INDEX metric_idx metric_name TYPE bloom_filter GRANULARITY 1
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (tenant_id, timestamp, metric_name);
      `
    });

    // Create logs table
    await clickhouse.exec({
      query: `
        CREATE TABLE IF NOT EXISTS logs (
          tenant_id String,
          timestamp DateTime64(9) DEFAULT now64(9),
          log_level String,
          message String,
          source String,
          attributes_json String,
          trace_id String,
          span_id String,
          INDEX tenant_idx tenant_id TYPE bloom_filter GRANULARITY 1,
          INDEX trace_idx trace_id TYPE bloom_filter GRANULARITY 1,
          INDEX level_idx log_level TYPE bloom_filter GRANULARITY 1
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (tenant_id, timestamp);
      `
    });

    // Create materialized view for trace statistics
    await clickhouse.exec({
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS trace_stats_mv
        TO trace_stats
        AS SELECT
          tenant_id,
          toStartOfHour(timestamp) as hour,
          count() as trace_count,
          uniqExact(trace_id) as unique_traces,
          uniqExact(service_name) as unique_services,
          avg(duration_ms) as avg_duration_ms,
          max(duration_ms) as max_duration_ms,
          min(duration_ms) as min_duration_ms
        FROM traces
        GROUP BY tenant_id, hour;
      `
    });

    // Add TTL policies
    await clickhouse.exec({
      query: `
        ALTER TABLE traces
        MODIFY TTL timestamp + INTERVAL 30 DAY DELETE;

        ALTER TABLE metrics
        MODIFY TTL timestamp + INTERVAL 30 DAY DELETE;

        ALTER TABLE logs
        MODIFY TTL timestamp + INTERVAL 30 DAY DELETE;
      `
    });

    console.log('Successfully created ClickHouse tables and views');
  } catch (error) {
    console.error('Error creating ClickHouse tables:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize ClickHouse:', error);
      process.exit(1);
    });
}

export default createTables;
