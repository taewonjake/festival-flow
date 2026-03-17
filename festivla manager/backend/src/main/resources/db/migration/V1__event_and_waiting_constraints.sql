CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

INSERT INTO events (name, start_date, end_date, status)
SELECT 'Festival Flow Default Event', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY), 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM events);

SET @waitings_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'waitings'
);

SET @event_id_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'waitings' AND column_name = 'event_id'
);

SET @sql := IF(
    @waitings_exists > 0 AND @event_id_col_exists = 0,
    'ALTER TABLE waitings ADD COLUMN event_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @business_date_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'waitings' AND column_name = 'business_date'
);

SET @sql := IF(
    @waitings_exists > 0 AND @business_date_col_exists = 0,
    'ALTER TABLE waitings ADD COLUMN business_date DATE NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @waitings_exists > 0,
    'UPDATE waitings SET business_date = DATE(created_at) WHERE business_date IS NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @waitings_exists > 0,
    'UPDATE waitings SET event_id = (SELECT MIN(id) FROM events) WHERE event_id IS NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @waitings_exists > 0,
    'ALTER TABLE waitings MODIFY COLUMN event_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @waitings_exists > 0,
    'ALTER TABLE waitings MODIFY COLUMN business_date DATE NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'waitings'
      AND constraint_name = 'fk_waitings_event'
      AND constraint_type = 'FOREIGN KEY'
);

SET @sql := IF(
    @waitings_exists > 0 AND @fk_exists = 0,
    'ALTER TABLE waitings ADD CONSTRAINT fk_waitings_event FOREIGN KEY (event_id) REFERENCES events(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @legacy_unique_idx := (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'waitings'
      AND non_unique = 0
      AND column_name = 'waiting_number'
      AND index_name <> 'uk_waitings_event_date_number'
    LIMIT 1
);

SET @sql := IF(
    @waitings_exists > 0 AND @legacy_unique_idx IS NOT NULL,
    CONCAT('ALTER TABLE waitings DROP INDEX `', @legacy_unique_idx, '`'),
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @event_number_unique_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'waitings'
      AND index_name = 'uk_waitings_event_date_number'
);

SET @sql := IF(
    @waitings_exists > 0 AND @event_number_unique_exists = 0,
    'ALTER TABLE waitings ADD CONSTRAINT uk_waitings_event_date_number UNIQUE (event_id, business_date, waiting_number)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @active_guard_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'waitings' AND column_name = 'active_guard'
);

SET @sql := IF(
    @waitings_exists > 0 AND @active_guard_col_exists = 0,
    'ALTER TABLE waitings ADD COLUMN active_guard TINYINT GENERATED ALWAYS AS (CASE WHEN status IN (''WAITING'', ''CALLED'') THEN 1 ELSE NULL END) STORED',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @user_active_unique_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'waitings'
      AND index_name = 'uq_waitings_user_active'
);

SET @sql := IF(
    @waitings_exists > 0 AND @user_active_unique_exists = 0,
    'ALTER TABLE waitings ADD CONSTRAINT uq_waitings_user_active UNIQUE (user_id, active_guard)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @user_phone_unique_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND non_unique = 0
      AND column_name = 'phone_number'
);

SET @sql := IF(
    @user_phone_unique_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT uq_users_phone_number UNIQUE (phone_number)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
