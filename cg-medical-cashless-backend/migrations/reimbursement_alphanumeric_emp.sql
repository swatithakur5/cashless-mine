-- =====================================================================
-- Allow alphanumeric employee codes (e.g. "E123") everywhere the
-- logged-in hospital employee_code is stored, and seed a demo employee
-- for E123 so the page works when logging in with that code.
--
--   mysql -u root -proot cg_medical_cashless < migrations/reimbursement_alphanumeric_emp.sql
-- =====================================================================

USE `cg_medical_cashless`;

SET FOREIGN_KEY_CHECKS = 0;

-- Columns that receive the logged-in employee code (was bigint -> varchar).
ALTER TABLE `mr_emp_basic_details`               MODIFY `emp_code`   varchar(50) NOT NULL;
ALTER TABLE `mr_emp_basic_details`               MODIFY `created_by` varchar(50) NOT NULL DEFAULT '';
ALTER TABLE `mr_emp_family_details`              MODIFY `emp_code`   varchar(50) NOT NULL;
ALTER TABLE `mr_emp_family_details`              MODIFY `created_by` varchar(50) NOT NULL DEFAULT '';

ALTER TABLE `mr_emp_medical_reimbursement_apply` MODIFY `emp_code`   varchar(50) NOT NULL;
ALTER TABLE `mr_emp_medical_reimbursement_apply` MODIFY `created_by` varchar(50) NOT NULL;

ALTER TABLE `mr_emp_medical_reimbursement_apply_details` MODIFY `created_by` varchar(50) NOT NULL;

ALTER TABLE `mr_emp_medical_remiburement_doc_details` MODIFY `emp_code`   varchar(50) NOT NULL;
ALTER TABLE `mr_emp_medical_remiburement_doc_details` MODIFY `created_by` varchar(50) NOT NULL;

ALTER TABLE `medical_reimbursement_applications` MODIFY `emp_id`         varchar(50) DEFAULT NULL;
ALTER TABLE `medical_reimbursement_applications` MODIFY `last_action_by` varchar(50) DEFAULT NULL;

-- Demo employee for hospital login code "E123" (+ family for the patient dropdown).
INSERT INTO `mr_emp_basic_details`
  (`emp_code`,`actual_emp_code`,`ddo_code`,`actual_ddo_code`,`name_en`,`doj`,`dob`,`ekarmik_designation_code`,`mobile_no`,`dor`,`permanent_address`,`created_by`,`ip_address`)
VALUES
  ('E123','E123',417008,'0417008','ANIL KUMAR SAHU','2007-04-01','1984-06-15',2388,9876500123,'2044-06-30','Raipur, Chhattisgarh','E123','::1')
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);

INSERT INTO `mr_emp_family_details` (`emp_code`,`name`,`relation`,`date_of_birth`,`created_by`,`ip_address`)
SELECT * FROM (
  SELECT 'E123' emp_code, 'SEEMA SAHU' name, 'WIFE' relation, DATE '1987-01-20' dob, 'E123' cb, '::1' ip
  UNION ALL SELECT 'E123','RAMLAL SAHU','FATHER',DATE '1958-03-10','E123','::1'
  UNION ALL SELECT 'E123','PHOOLBAI SAHU','MOTHER',DATE '1961-09-05','E123','::1'
  UNION ALL SELECT 'E123','AYUSH SAHU','SON',DATE '2014-11-12','E123','::1'
) t
WHERE NOT EXISTS (SELECT 1 FROM `mr_emp_family_details` WHERE emp_code = 'E123');

SET FOREIGN_KEY_CHECKS = 1;
