SET @add_active_guard_column = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'table_assignment_history'
              AND column_name = 'active_guard'
        ),
        'SELECT 1',
        'ALTER TABLE table_assignment_history
         ADD COLUMN active_guard TINYINT GENERATED ALWAYS AS (CASE WHEN ended_at IS NULL THEN 1 ELSE NULL END) STORED'
    )
);
PREPARE stmt_add_active_guard_column FROM @add_active_guard_column;
EXECUTE stmt_add_active_guard_column;
DEALLOCATE PREPARE stmt_add_active_guard_column;

SET @add_uq_tah_table_active = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'table_assignment_history'
              AND index_name = 'uq_tah_table_active'
        ),
        'SELECT 1',
        'ALTER TABLE table_assignment_history
         ADD CONSTRAINT uq_tah_table_active UNIQUE (table_id, active_guard)'
    )
);
PREPARE stmt_add_uq_tah_table_active FROM @add_uq_tah_table_active;
EXECUTE stmt_add_uq_tah_table_active;
DEALLOCATE PREPARE stmt_add_uq_tah_table_active;
