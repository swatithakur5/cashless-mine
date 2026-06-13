-- ============================================================================
-- Run this ONCE in SQLyog against cg_medical_cashless database
-- ============================================================================

-- 1. Application tables
CREATE TABLE IF NOT EXISTS `hospital_employee_login` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(50) NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_code` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `hospital_authorization_requests` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_code` VARCHAR(50) NOT NULL,
  `hospital_name` VARCHAR(200) NOT NULL,
  `relation_name` VARCHAR(100) NOT NULL,
  `from_date`     DATE NOT NULL,
  `to_date`       DATE NOT NULL,
  `amount`        DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status`        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_code` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Framework metadata tables (for auto GET APIs)
CREATE TABLE IF NOT EXISTS `mas_api` (
  `api_id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `api_name`          VARCHAR(150) NOT NULL,
  `api_path`          VARCHAR(150) NOT NULL,
  `prefix`            VARCHAR(50)  NOT NULL,
  `api_type`          ENUM('GET','POST','PUT','DELETE') NOT NULL DEFAULT 'GET',
  `api_creation`      ENUM('A','M') NOT NULL DEFAULT 'M',
  `is_control_access` TINYINT NOT NULL DEFAULT 0,
  `api_hit_count`     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`api_id`),
  UNIQUE KEY `uq_api_path_prefix` (`api_path`, `prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mas_custom_queries` (
  `query_id`      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `query_name`    VARCHAR(200) NOT NULL,
  `query_object`  LONGTEXT NOT NULL,
  `base_database` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`query_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_api_query` (
  `api_id`   INT UNSIGNED NOT NULL,
  `query_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`api_id`, `query_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_designation_api` (
  `api_id`         INT UNSIGNED NOT NULL,
  `designation_id` INT NOT NULL,
  `access_type`    ENUM('A','S','C') NOT NULL DEFAULT 'A',
  `custom_value`   LONGTEXT NULL,
  PRIMARY KEY (`api_id`, `designation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Register auto GET APIs
INSERT IGNORE INTO `mas_custom_queries` (`query_name`, `base_database`, `query_object`) VALUES (
  'getAuthRequests',
  'cg_main',
  '{"query_name":"getAuthRequests","base":"SELECT hel.employee_code, har.id, har.hospital_name, har.relation_name, har.from_date, har.to_date, har.amount, har.status FROM hospital_employee_login hel INNER JOIN hospital_authorization_requests har ON hel.employee_code = har.employee_code $where","params":[],"permission":{"A":{}},"other":{"employee_code":{"where":"hel.employee_code = ?","params":["employee_code"]},"status":{"where":"har.status = ?","params":["status"]}}}'
);

INSERT IGNORE INTO `mas_custom_queries` (`query_name`, `base_database`, `query_object`) VALUES (
  'getAllAuthRequests',
  'cg_main',
  '{"query_name":"getAllAuthRequests","base":"SELECT har.id, har.employee_code, har.hospital_name, har.relation_name, har.from_date, har.to_date, har.amount, har.status FROM hospital_authorization_requests har $where ORDER BY har.id DESC","params":[],"permission":{"A":{}},"other":{"status":{"where":"har.status = ?","params":["status"]}}}'
);

INSERT IGNORE INTO `mas_api` (`api_name`, `api_path`, `prefix`, `api_type`, `api_creation`, `is_control_access`)
VALUES ('getAuthRequests', '/list/get/getAuthRequests', 'api', 'GET', 'A', 0);

INSERT IGNORE INTO `mas_api` (`api_name`, `api_path`, `prefix`, `api_type`, `api_creation`, `is_control_access`)
VALUES ('getAllAuthRequests', '/list/get/getAllAuthRequests', 'api', 'GET', 'A', 0);

INSERT IGNORE INTO `map_api_query` (`api_id`, `query_id`)
SELECT a.api_id, q.query_id FROM mas_api a JOIN mas_custom_queries q
ON q.query_name = 'getAuthRequests' WHERE a.api_name = 'getAuthRequests';

INSERT IGNORE INTO `map_api_query` (`api_id`, `query_id`)
SELECT a.api_id, q.query_id FROM mas_api a JOIN mas_custom_queries q
ON q.query_name = 'getAllAuthRequests' WHERE a.api_name = 'getAllAuthRequests';

-- 4. Sample data to test the dashboard
INSERT IGNORE INTO `hospital_employee_login` (`employee_code`, `mobile_number`)
VALUES ('E123', '9876543210');

INSERT IGNORE INTO `hospital_authorization_requests`
  (`employee_code`, `hospital_name`, `relation_name`, `from_date`, `to_date`, `amount`, `status`)
VALUES
  ('E123', 'Apollo Hospital', 'Self',   '2025-01-01', '2025-01-05', 25000, 'Approved'),
  ('E123', 'AIIMS Raipur',    'Spouse', '2025-03-10', '2025-03-15', 18500, 'Pending'),
  ('E123', 'City Hospital',   'Child',  '2025-05-20', '2025-05-22',  9200, 'Rejected');
