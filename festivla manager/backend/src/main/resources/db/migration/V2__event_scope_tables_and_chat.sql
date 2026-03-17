SET @default_event_id := (SELECT MIN(id) FROM events);

SET @tables_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'tables'
);

SET @tables_event_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'tables' AND column_name = 'event_id'
);

SET @sql := IF(
    @tables_exists > 0 AND @tables_event_col_exists = 0,
    'ALTER TABLE tables ADD COLUMN event_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @tables_exists > 0,
    CONCAT('UPDATE tables SET event_id = ', IFNULL(@default_event_id, 1), ' WHERE event_id IS NULL'),
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @tables_exists > 0,
    'ALTER TABLE tables MODIFY COLUMN event_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @tables_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'tables'
      AND constraint_name = 'fk_tables_event'
      AND constraint_type = 'FOREIGN KEY'
);

SET @sql := IF(
    @tables_exists > 0 AND @tables_fk_exists = 0,
    'ALTER TABLE tables ADD CONSTRAINT fk_tables_event FOREIGN KEY (event_id) REFERENCES events(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @legacy_table_number_unique := (
    SELECT index_name
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'tables'
      AND non_unique = 0
      AND column_name = 'table_number'
      AND index_name <> 'uk_tables_event_table_number'
    LIMIT 1
);

SET @sql := IF(
    @tables_exists > 0 AND @legacy_table_number_unique IS NOT NULL,
    CONCAT('ALTER TABLE tables DROP INDEX `', @legacy_table_number_unique, '`'),
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @tables_event_number_unique_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'tables'
      AND index_name = 'uk_tables_event_table_number'
);

SET @sql := IF(
    @tables_exists > 0 AND @tables_event_number_unique_exists = 0,
    'ALTER TABLE tables ADD CONSTRAINT uk_tables_event_table_number UNIQUE (event_id, table_number)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @tables_event_status_idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'tables'
      AND index_name = 'idx_tables_event_status'
);

SET @sql := IF(
    @tables_exists > 0 AND @tables_event_status_idx_exists = 0,
    'CREATE INDEX idx_tables_event_status ON tables(event_id, status)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_rooms_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'chat_rooms'
);

SET @chat_rooms_event_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'chat_rooms' AND column_name = 'event_id'
);

SET @sql := IF(
    @chat_rooms_exists > 0 AND @chat_rooms_event_col_exists = 0,
    'ALTER TABLE chat_rooms ADD COLUMN event_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @chat_rooms_exists > 0,
    CONCAT('UPDATE chat_rooms SET event_id = ', IFNULL(@default_event_id, 1), ' WHERE event_id IS NULL'),
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @chat_rooms_exists > 0,
    'ALTER TABLE chat_rooms MODIFY COLUMN event_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_rooms_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'chat_rooms'
      AND constraint_name = 'fk_chat_rooms_event'
      AND constraint_type = 'FOREIGN KEY'
);

SET @sql := IF(
    @chat_rooms_exists > 0 AND @chat_rooms_fk_exists = 0,
    'ALTER TABLE chat_rooms ADD CONSTRAINT fk_chat_rooms_event FOREIGN KEY (event_id) REFERENCES events(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_rooms_event_user_idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'chat_rooms'
      AND index_name = 'idx_chat_rooms_event_user'
);

SET @sql := IF(
    @chat_rooms_exists > 0 AND @chat_rooms_event_user_idx_exists = 0,
    'CREATE INDEX idx_chat_rooms_event_user ON chat_rooms(event_id, user_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_rooms_event_status_idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'chat_rooms'
      AND index_name = 'idx_chat_rooms_event_status'
);

SET @sql := IF(
    @chat_rooms_exists > 0 AND @chat_rooms_event_status_idx_exists = 0,
    'CREATE INDEX idx_chat_rooms_event_status ON chat_rooms(event_id, status)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_messages_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'chat_messages'
);

SET @chat_messages_event_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'chat_messages' AND column_name = 'event_id'
);

SET @sql := IF(
    @chat_messages_exists > 0 AND @chat_messages_event_col_exists = 0,
    'ALTER TABLE chat_messages ADD COLUMN event_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @chat_messages_exists > 0,
    'UPDATE chat_messages m JOIN chat_rooms r ON m.chat_room_id = r.id SET m.event_id = r.event_id WHERE m.event_id IS NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @chat_messages_exists > 0,
    'ALTER TABLE chat_messages MODIFY COLUMN event_id BIGINT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_messages_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'chat_messages'
      AND constraint_name = 'fk_chat_messages_event'
      AND constraint_type = 'FOREIGN KEY'
);

SET @sql := IF(
    @chat_messages_exists > 0 AND @chat_messages_fk_exists = 0,
    'ALTER TABLE chat_messages ADD CONSTRAINT fk_chat_messages_event FOREIGN KEY (event_id) REFERENCES events(id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chat_messages_event_room_idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'chat_messages'
      AND index_name = 'idx_chat_messages_event_room'
);

SET @sql := IF(
    @chat_messages_exists > 0 AND @chat_messages_event_room_idx_exists = 0,
    'CREATE INDEX idx_chat_messages_event_room ON chat_messages(event_id, chat_room_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
