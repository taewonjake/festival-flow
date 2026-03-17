CREATE TABLE IF NOT EXISTS table_assignment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,
    waiting_id BIGINT NOT NULL,
    started_at DATETIME(6) NOT NULL,
    ended_at DATETIME(6) NULL,
    active_guard TINYINT GENERATED ALWAYS AS (CASE WHEN ended_at IS NULL THEN 1 ELSE NULL END) STORED,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tah_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_tah_table FOREIGN KEY (table_id) REFERENCES tables(id),
    CONSTRAINT fk_tah_waiting FOREIGN KEY (waiting_id) REFERENCES waitings(id),
    CONSTRAINT uq_tah_table_active UNIQUE (table_id, active_guard)
);

SET @create_idx_tah_event_table = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'table_assignment_history'
              AND index_name = 'idx_tah_event_table'
        ),
        'SELECT 1',
        'CREATE INDEX idx_tah_event_table ON table_assignment_history(event_id, table_id)'
    )
);
PREPARE stmt_idx_tah_event_table FROM @create_idx_tah_event_table;
EXECUTE stmt_idx_tah_event_table;
DEALLOCATE PREPARE stmt_idx_tah_event_table;

SET @create_idx_tah_waiting_id = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'table_assignment_history'
              AND index_name = 'idx_tah_waiting_id'
        ),
        'SELECT 1',
        'CREATE INDEX idx_tah_waiting_id ON table_assignment_history(waiting_id)'
    )
);
PREPARE stmt_idx_tah_waiting_id FROM @create_idx_tah_waiting_id;
EXECUTE stmt_idx_tah_waiting_id;
DEALLOCATE PREPARE stmt_idx_tah_waiting_id;
