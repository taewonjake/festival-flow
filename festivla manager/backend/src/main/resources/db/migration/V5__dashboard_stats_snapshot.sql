CREATE TABLE IF NOT EXISTS dashboard_stats_snapshot (
    event_id BIGINT PRIMARY KEY,
    total_waiting BIGINT NOT NULL,
    tables_in_use BIGINT NOT NULL,
    total_tables BIGINT NOT NULL,
    called_users BIGINT NOT NULL,
    completed_today BIGINT NOT NULL,
    aggregated_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_dashboard_stats_snapshot_event
        FOREIGN KEY (event_id) REFERENCES events(id)
);

SET @create_idx_dashboard_stats_snapshot_aggregated_at = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'dashboard_stats_snapshot'
              AND index_name = 'idx_dashboard_stats_snapshot_aggregated_at'
        ),
        'SELECT 1',
        'CREATE INDEX idx_dashboard_stats_snapshot_aggregated_at ON dashboard_stats_snapshot(aggregated_at)'
    )
);
PREPARE stmt_create_idx_dashboard_stats_snapshot_aggregated_at FROM @create_idx_dashboard_stats_snapshot_aggregated_at;
EXECUTE stmt_create_idx_dashboard_stats_snapshot_aggregated_at;
DEALLOCATE PREPARE stmt_create_idx_dashboard_stats_snapshot_aggregated_at;
