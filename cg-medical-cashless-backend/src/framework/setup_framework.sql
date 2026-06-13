-- ============================================================================
-- Metadata-driven framework: master tables (simplified, standalone)
-- Run this ONCE against your admin DB (or the business DB if you have only one).
-- These are trimmed versions of the reimbursement tables in sql4.sql, without the
-- large foreign-key graph, keeping only what src/framework/* actually reads.
-- ============================================================================

-- One row per dynamic API path.
CREATE TABLE IF NOT EXISTS `mas_api` (
  `api_id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `api_name`          VARCHAR(150) NOT NULL,
  `api_path`          VARCHAR(150) NOT NULL,   -- e.g. /list/get/getAuthRequests
  `prefix`            VARCHAR(50)  NOT NULL,   -- first URL segment, e.g. api
  `api_type`          ENUM('GET','POST','PUT','DELETE') NOT NULL DEFAULT 'GET',
  `api_creation`      ENUM('A','M') NOT NULL DEFAULT 'M',  -- A = auto (metadata), M = manual fn
  `is_control_access` TINYINT NOT NULL DEFAULT 0,          -- 1 = enforce designation permission
  `api_hit_count`     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`api_id`),
  UNIQUE KEY `uq_api_path_prefix` (`api_path`, `prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- The query definitions (the actual SQL, stored as JSON).
CREATE TABLE IF NOT EXISTS `mas_custom_queries` (
  `query_id`      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `query_name`    VARCHAR(200) NOT NULL,
  `query_object`  LONGTEXT NOT NULL CHECK (json_valid(`query_object`)),
  `base_database` VARCHAR(50) NOT NULL,        -- logical key into config/db.js dbkeyMap, e.g. cg_main
  PRIMARY KEY (`query_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Links an API to the query it should run.
CREATE TABLE IF NOT EXISTS `map_api_query` (
  `api_id`   INT UNSIGNED NOT NULL,
  `query_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`api_id`, `query_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OPTIONAL: per-designation access control (only needed when is_control_access = 1).
CREATE TABLE IF NOT EXISTS `map_designation_api` (
  `api_id`         INT UNSIGNED NOT NULL,
  `designation_id` INT NOT NULL,
  `access_type`    ENUM('A','S','C') NOT NULL DEFAULT 'A',  -- All / Self / Custom
  `custom_value`   LONGTEXT NULL,
  PRIMARY KEY (`api_id`, `designation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- API 1: Hospital Dashboard — authorization requests for a given employee
--   GET /api/list/get/getAuthRequests?employee_code=E123
--   GET /api/list/get/getAuthRequests?employee_code=E123&status=Approved
-- ============================================================================

INSERT INTO `mas_custom_queries` (`query_name`, `base_database`, `query_object`) VALUES (
  'getAuthRequests',
  'cg_main',
  '{
     "query_name": "getAuthRequests",
     "base": "SELECT hel.employee_code, har.id, har.hospital_name, har.relation_name, har.from_date, har.to_date, har.amount, har.status FROM hospital_employee_login hel INNER JOIN hospital_authorization_requests har ON hel.employee_code = har.employee_code $where",
     "params": [],
     "permission": { "A": {} },
     "other": {
       "employee_code": { "where": "hel.employee_code = ?", "params": ["employee_code"] },
       "status":        { "where": "har.status = ?",        "params": ["status"] }
     }
   }'
);

INSERT INTO `mas_api` (`api_name`, `api_path`, `prefix`, `api_type`, `api_creation`, `is_control_access`)
VALUES ('getAuthRequests', '/list/get/getAuthRequests', 'api', 'GET', 'A', 0);

INSERT INTO `map_api_query` (`api_id`, `query_id`)
SELECT a.api_id, q.query_id
FROM mas_api a
JOIN mas_custom_queries q ON q.query_name = 'getAuthRequests'
WHERE a.api_name = 'getAuthRequests';

-- ============================================================================
-- API 2: All authorization requests (admin view), filterable by status
--   GET /api/list/get/getAllAuthRequests
--   GET /api/list/get/getAllAuthRequests?status=Pending
-- ============================================================================

INSERT INTO `mas_custom_queries` (`query_name`, `base_database`, `query_object`) VALUES (
  'getAllAuthRequests',
  'cg_main',
  '{
     "query_name": "getAllAuthRequests",
     "base": "SELECT har.id, har.employee_code, har.hospital_name, har.relation_name, har.from_date, har.to_date, har.amount, har.status FROM hospital_authorization_requests har $where ORDER BY har.id DESC",
     "params": [],
     "permission": { "A": {} },
     "other": {
       "status": { "where": "har.status = ?", "params": ["status"] }
     }
   }'
);

INSERT INTO `mas_api` (`api_name`, `api_path`, `prefix`, `api_type`, `api_creation`, `is_control_access`)
VALUES ('getAllAuthRequests', '/list/get/getAllAuthRequests', 'api', 'GET', 'A', 0);

INSERT INTO `map_api_query` (`api_id`, `query_id`)
SELECT a.api_id, q.query_id
FROM mas_api a
JOIN mas_custom_queries q ON q.query_name = 'getAllAuthRequests'
WHERE a.api_name = 'getAllAuthRequests';
