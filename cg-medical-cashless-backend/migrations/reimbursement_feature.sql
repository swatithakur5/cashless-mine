-- =====================================================================
-- Patient Treatment Information (Medical Reimbursement) feature
-- Ported from the `medical_reimbursement` database into `cg_medical_cashless`.
--
-- Run this against the cashless DB:
--   mysql -u root -proot cg_medical_cashless < migrations/reimbursement_feature.sql
--
-- Master data is a representative subset taken from the reimbursement dump
-- (sql4.sql). Treatment types, IPD types, procedure types, documents and
-- relations are seeded in full; districts/hospitals/procedures are seeded
-- with a working subset (Chhattisgarh). Add more rows from the dump anytime.
-- =====================================================================

USE `cg_medical_cashless`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- MASTER TABLES
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mr_mas_treatment_type` (
  `treatment_type_code` tinyint(3) unsigned NOT NULL,
  `treatment_type_name_en` varchar(50) NOT NULL,
  `treatment_type_short_name_en` varchar(50) NOT NULL,
  `treatment_type_name_hi` varchar(50) NOT NULL,
  PRIMARY KEY (`treatment_type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_treatment_type`
  (`treatment_type_code`,`treatment_type_name_en`,`treatment_type_short_name_en`,`treatment_type_name_hi`)
VALUES
  (1,'Outpatient Department','OPD','बाह्य रोगी विभाग'),
  (2,'Inpatient Department','IPD','अंतःरोगी विभाग')
ON DUPLICATE KEY UPDATE treatment_type_name_en = VALUES(treatment_type_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_ipd_type_details` (
  `ipd_type_code` tinyint(3) unsigned NOT NULL,
  `ipd_name_en` varchar(50) NOT NULL,
  `ipd_name_hi` varchar(50) NOT NULL DEFAULT '',
  `is_amount_count` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ipd_type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_ipd_type_details` (`ipd_type_code`,`ipd_name_en`,`ipd_name_hi`,`is_amount_count`)
VALUES
  (1,'Consultation','परामर्श',1),
  (2,'Room Rent','कक्ष शुल्क',1),
  (3,'Test','जांच',1),
  (4,'Surgery','शल्य चिकित्सा',1),
  (5,'Nursing','नर्सिंग सेवा',1),
  (6,'Medicine','दवा',0),
  (7,'Diet','आहार',1)
ON DUPLICATE KEY UPDATE ipd_name_en = VALUES(ipd_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_procedure_type` (
  `procedure_type_code` tinyint(3) unsigned NOT NULL,
  `procedure_type_name_en` varchar(150) NOT NULL,
  `procedure_type_name_hi` varchar(150) NOT NULL,
  PRIMARY KEY (`procedure_type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_procedure_type` (`procedure_type_code`,`procedure_type_name_en`,`procedure_type_name_hi`)
VALUES
  (2,'SKIN','त्वचा'),
  (3,'OPTHALMOLOGY','नेत्र रोग विज्ञान'),
  (4,'DENTAL','दंत चिकित्सा'),
  (5,'ENT','कान-नाक-गला (ईएनटी)'),
  (6,'HEAD AND NECK','सिर एवं गर्दन'),
  (7,'HEAD AND NECK CANCER','सिर एवं गर्दन का कैंसर'),
  (8,'BREAST','स्तन'),
  (9,'BIOPSIES','बायोप्सी'),
  (11,'ABDOMEN/GI SURGERY','उदर / जठरांत्र शल्य चिकित्सा'),
  (13,'CARDIOVASCULAR AND CARDIAC SURGERY & INVESTIGATIONS','हृदय एवं हृदय-वाहिका शल्य चिकित्सा एवं जांच'),
  (14,'OBSTETRICS AND GYNAECOLOGY','प्रसूति एवं स्त्री रोग'),
  (15,'NEPHROLOGY AND UROLOGY','नेफ्रोलॉजी एवं यूरोलॉजी'),
  (16,'NEURO SURGERY','न्यूरो सर्जरी'),
  (19,'ORTHOPEDICS','अस्थि रोग (ऑर्थोपेडिक्स)'),
  (41,'LABORATORY MEDICINE / BIO-CHEMISTRY','प्रयोगशाला चिकित्सा / बायोकेमिस्ट्री'),
  (45,'USG','अल्ट्रासाउंड (यूएसजी)'),
  (46,'X-RAY','एक्स-रे'),
  (47,'MRI','एमआरआई'),
  (48,'CT SCAN','सीटी स्कैन')
ON DUPLICATE KEY UPDATE procedure_type_name_en = VALUES(procedure_type_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_procedure_details` (
  `procedure_code` smallint(5) unsigned NOT NULL,
  `procedure_name_en` varchar(150) NOT NULL,
  `procedure_name_hi` varchar(150) NOT NULL,
  `non_nabh_nabl` varchar(255) NOT NULL,
  `nabh_nabl` varchar(255) NOT NULL,
  `procedure_type_code` tinyint(4) unsigned DEFAULT NULL,
  PRIMARY KEY (`procedure_code`),
  KEY `idx_proc_type` (`procedure_type_code`),
  KEY `idx_proc_name` (`procedure_name_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_procedure_details`
  (`procedure_code`,`procedure_name_en`,`procedure_name_hi`,`non_nabh_nabl`,`nabh_nabl`,`procedure_type_code`)
VALUES
  (1,'Consultation OPD','ओपीडी परामर्श','350','350',NULL),
  (2,'Consultation- for Inpatients','भर्ती मरीजों के लिए परामर्श','350','350',NULL),
  (3,'Dressings of wounds','घाव की ड्रेसिंग','255','300',NULL),
  (4,'Suturing of wounds with local anesthesia','लोकल एनेस्थीसिया में घाव की सिलाई','108','124',NULL),
  (5,'Aspiration Plural Effusion - Diagnostic','प्लूरल इफ्यूजन की जांच हेतु द्रव निकालना','595','700',NULL),
  (6,'Aspiration Plural Effusion - Therapeutic','प्लूरल इफ्यूजन के उपचार हेतु द्रव निकालना','595','700',NULL),
  (7,'Abdominal/Peritoneal Aspiration - Diagnostic','पेट के पानी की जांच हेतु एसाइटिक टैपिंग','595','700',NULL),
  (8,'Abdominal/Peritoneal Aspiration - Therapeutic','पेट के पानी का उपचार हेतु निष्कासन','640','750',NULL),
  (9,'Pericardial Aspiration','हृदय आवरण से द्रव निकालना','380','437',NULL),
  (10,'Joints Aspiration','जोड़ से द्रव निकालना','317','365',NULL),
  (11,'Biopsy Skin','त्वचा की बायोप्सी','230','265',2),
  (12,'Removal of Stitches/Sutures (7-12 sutures)','टांकों को हटाना (7–12 टांके)','170','200',NULL),
  (13,'Venesection','नस से रक्त निकालना','595','700',2),
  (14,'Phimosis Correction / Circumcision under LA','फाइमोसिस सुधार या लोकल एनेस्थीसिया में खतना','5100','6000',NULL),
  (15,'Sternal puncture','स्टर्नम पंचर','173','199',NULL),
  (16,'Injection / Sclerotherapy / Banding of Haemorrhoids','बवासीर में इंजेक्शन/स्क्लेरोथेरेपी/बैंडिंग','595','700',NULL),
  (17,'Injection for Varicose Veins','वैरिकोज वेन्स के लिए इंजेक्शन','595','700',NULL),
  (18,'Urinary bladder Catheterisation','मूत्राशय में कैथेटर डालना','595','700',NULL),
  (19,'Dilatation of Urethral Stricture','मूत्रमार्ग संकुचन का फैलाव','1955','2300',NULL),
  (20,'Incision & Drainage under LA (Large)','लोकल एनेस्थीसिया में बड़ा चीरा एवं पस निकासी','1955','2300',NULL),
  (22,'Peritoneal Dialysis','पेरिटोनियल डायलिसिस','1466','1686',NULL),
  (23,'Excision of Moles','तिल निकालना','345','397',2),
  (24,'Excision of Warts','मस्से निकालना','310','357',2),
  (25,'Excision of Molluscum contagiosum','मोलस्कम कॉन्टेजियोसम निकालना','130','150',2),
  (26,'Excision of Venereal Warts','जननांग मस्से निकालना','160','184',2),
  (27,'Excision of Corns','कॉर्न (घट्टे) निकालना','140','161',2),
  (30,'Subconjunctival injection in one eye','एक आंख में सबकंजंक्टाइवल इंजेक्शन','60','69',3),
  (31,'Subconjunctival injection in both eyes','दोनों आंखों में सबकंजंक्टाइवल इंजेक्शन','120','138',3),
  (32,'Pterygium Surgery','प्टेरिजियम सर्जरी','5500','6325',3),
  (35,'Removal of corneal foreign body','कॉर्निया में फंसी बाहरी वस्तु को निकालना','100','115',3)
ON DUPLICATE KEY UPDATE procedure_name_en = VALUES(procedure_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_district` (
  `district_code` smallint(6) unsigned NOT NULL,
  `district_name_en` varchar(255) NOT NULL,
  `district_id` int(11) NOT NULL,
  `state_code` smallint(6) NOT NULL,
  `state_name` varchar(255) NOT NULL,
  PRIMARY KEY (`district_code`),
  KEY `state_code` (`state_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_district` (`district_code`,`district_name_en`,`district_id`,`state_code`,`state_name`)
VALUES
  (374,'Bastar',45,22,'Chhattisgarh'),
  (375,'Bilaspur',40,22,'Chhattisgarh'),
  (376,'Dakshin Bastar Dantewada',61,22,'Chhattisgarh'),
  (377,'Dhamtari',59,22,'Chhattisgarh'),
  (378,'Durg',43,22,'Chhattisgarh'),
  (379,'Janjgir-Champa',54,22,'Chhattisgarh'),
  (380,'Jashpur',56,22,'Chhattisgarh'),
  (381,'Uttar Bastar Kanker',60,22,'Chhattisgarh'),
  (382,'Kabeerdham',57,22,'Chhattisgarh'),
  (383,'Korba',55,22,'Chhattisgarh'),
  (384,'Korea',53,22,'Chhattisgarh'),
  (385,'Mahasamund',58,22,'Chhattisgarh'),
  (386,'Raigarh',41,22,'Chhattisgarh'),
  (387,'Raipur',44,22,'Chhattisgarh'),
  (388,'Rajnandgaon',42,22,'Chhattisgarh'),
  (389,'Surguja',39,22,'Chhattisgarh'),
  (636,'Bijapur',63,22,'Chhattisgarh'),
  (637,'Narayanpur',62,22,'Chhattisgarh'),
  (642,'Sukma',64,22,'Chhattisgarh'),
  (643,'Kondagaon',65,22,'Chhattisgarh'),
  (644,'Balodabazar-Bhatapara',66,22,'Chhattisgarh'),
  (645,'Gariyaband',67,22,'Chhattisgarh'),
  (646,'Balod',69,22,'Chhattisgarh'),
  (647,'Mungeli',70,22,'Chhattisgarh'),
  (648,'Surajpur',71,22,'Chhattisgarh'),
  (650,'Bemetara',68,22,'Chhattisgarh')
ON DUPLICATE KEY UPDATE district_name_en = VALUES(district_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_hospital_details` (
  `hospital_code` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reg_no` varchar(30) NOT NULL,
  `hospital_name_en` varchar(255) NOT NULL,
  `district_name_en` varchar(50) NOT NULL,
  `district_code` smallint(3) unsigned NOT NULL,
  `district_id` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`hospital_code`),
  UNIQUE KEY `reg_no` (`reg_no`),
  KEY `idx_hosp_district` (`district_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_hospital_details` (`hospital_code`,`reg_no`,`hospital_name_en`,`district_name_en`,`district_code`,`district_id`)
VALUES
  (119,'BILA63715','Ladikar Hospital','BILASPUR',375,'7'),
  (120,'BILA91582','Sai Priya Hospital','BILASPUR',375,'7'),
  (121,'BILA9094','Gurukripa Medical Care Nursing Home','BILASPUR',375,'7'),
  (122,'BILA57821','Shiva Medicity','BILASPUR',375,'7'),
  (127,'BILA67882','Ganpati Hospital Bilaspur','BILASPUR',375,'7'),
  (460,'DURG64346','Sunshine Multispeciality Hospital','DURG',378,'10'),
  (461,'DURG91162','Sai Baba Eye Hospital Bhilai','DURG',378,'10'),
  (463,'DURG10205','Apex Superspeciality Hospital','DURG',378,'10'),
  (464,'DURG25888','Sai Jyoti Hospital','DURG',378,'10'),
  (1066,'RAIP06554','SCCH Unit II (Memon Healthcare Pvt Ltd)','RAIPUR',387,'11'),
  (1067,'RAIP51615','Gagan Hospital','RAIPUR',387,'11'),
  (1068,'RAIP6016','Vishwas ENT Care Centre','RAIPUR',387,'11'),
  (1069,'RAIP46730','Matruchhaya Medicare & Research Pvt. Ltd.','RAIPUR',387,'11'),
  (1072,'RAIP63738','C K Birla Healthcare Pvt Ltd','RAIPUR',387,'11'),
  (1073,'RAIP5242','Chhattisgarh Hospital & Research Centre','RAIPUR',387,'11'),
  (1075,'RAIP63181','Agrawal Heart and Multispeciality Hospital','RAIPUR',387,'11')
ON DUPLICATE KEY UPDATE hospital_name_en = VALUES(hospital_name_en);


CREATE TABLE IF NOT EXISTS `mr_mas_document_details` (
  `document_code` tinyint(4) unsigned NOT NULL AUTO_INCREMENT,
  `form_control_name` varchar(50) NOT NULL,
  `document_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL,
  PRIMARY KEY (`document_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_document_details`
  (`document_code`,`form_control_name`,`document_name`,`is_active`,`icon`,`title`,`is_required`)
VALUES
  (1,'refer_doc_file','Refer',0,'assignment','Refer Certificate',0),
  (2,'consultation_doc_file','Consultation',0,'medical_services','Consultation Document',0),
  (3,'test_doc_file','Test',0,'science','Test Report',0),
  (4,'bill_doc_file','Bill',0,'receipt_long','Bill Document',0),
  (5,'application_to_office_file','Application to Concerned Office for Medical Reimbursement',1,'description','Application',1),
  (6,'non_naxalite_certificate_file','Certificate for working in Non Naxalite area (by Police Dept)',1,'verified','Non Naxalite Certificate',1),
  (7,'mr_form_file','MR Form',1,'assignment','MR Form',1),
  (8,'information_letter_file','Information Letter to Department',1,'mail_outline','Information Letter',1),
  (9,'medicine_list_file','Medicine List (attested by competent authority)',1,'medication','Medicine List',1),
  (10,'cancer_report_file','If Cancer - Histo Pathology / Bone Marrow Report',1,'biotech','Cancer Report',0),
  (11,'dependent_certificate_file','Dependent Certificate',1,'family_restroom','Dependent Certificate',0),
  (12,'discharge_summary_file','Discharge Summary',1,'summarize','Discharge Summary',1),
  (13,'prolong_treatment_file','Prolong Treatment Certificate by Civil Surgeon',1,'local_hospital','Prolong Treatment',1)
ON DUPLICATE KEY UPDATE document_name = VALUES(document_name);


CREATE TABLE IF NOT EXISTS `mr_mas_relation` (
  `relation_code` tinyint(4) unsigned NOT NULL,
  `relation_name_en` varchar(50) NOT NULL,
  `relation_name_hi` varchar(50) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`relation_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_mas_relation` (`relation_code`,`relation_name_en`,`relation_name_hi`,`status`)
VALUES
  (1,'WIFE','पत्नी',1),(2,'SON','बेटा',1),(3,'DAUGHTER','बेटी',1),(4,'BROTHER','भाई',1),
  (5,'SISTER','बहन',1),(6,'FATHER','पिता',1),(7,'MOTHER','माँ',1),(8,'SELF','खुद',1),
  (9,'HUSBAND','पति',1),(10,'NEPHEW','भतीजा',1),(11,'NIECE','भतीजी',1),(12,'DAUGHTER IN LAW','बहू',1),
  (13,'GRAND SON','पोता',1),(14,'GRAND DAUGHTER','पोती',1),(15,'ADOPTED DAUGHTER','दत्तक पुत्री',1),
  (16,'ADOPTED SON','दत्तक पुत्र',1),(17,'GRAND MOTHER','दादी',1),(18,'COUSIN BROTHER','चचेरा भाई',1),
  (19,'GRAND FATHER','दादा',1),(20,'FRIEND','दोस्त',1),(21,'MOTHER IN LAW','सास',1),
  (22,'SON IN LAW','दामाद',1),(23,'FATHER IN LAW','ससुर',1)
ON DUPLICATE KEY UPDATE relation_name_en = VALUES(relation_name_en);


-- Designation lookup used by getEmpDetailsByEmpCode (joined on ekarmik_designation_code).
CREATE TABLE IF NOT EXISTS `deptwise_designation` (
  `designaton_code` int(11) unsigned NOT NULL DEFAULT 0,
  `name_en` varchar(200) DEFAULT NULL,
  `name_uni` varchar(255) DEFAULT NULL,
  `is_active` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`designaton_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `deptwise_designation` (`designaton_code`,`name_en`,`name_uni`,`is_active`)
VALUES
  (2388,'Chief Medical & Health Officer','मुख्य चिकित्सा एवं स्वास्थ्य अधिकारी',1),
  (1153,'Medical Officer','चिकित्सा अधिकारी',1)
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);


-- ---------------------------------------------------------------------
-- EMPLOYEE / FAMILY TABLES
-- emp_code 101 matches a hospital-login code already present in the
-- cashless DB so the page works after logging in as employee 101.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mr_emp_basic_details` (
  `emp_code` bigint(11) unsigned NOT NULL,
  `actual_emp_code` varchar(11) NOT NULL,
  `ddo_code` int(7) unsigned NOT NULL,
  `actual_ddo_code` varchar(7) NOT NULL DEFAULT '',
  `name_en` varchar(200) NOT NULL,
  `doj` date DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `ekarmik_designation_code` int(6) NOT NULL,
  `mobile_no` bigint(10) unsigned DEFAULT NULL,
  `dor` date DEFAULT NULL,
  `permanent_address` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(11) unsigned NOT NULL DEFAULT 0,
  `ip_address` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`emp_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_emp_basic_details`
  (`emp_code`,`actual_emp_code`,`ddo_code`,`actual_ddo_code`,`name_en`,`doj`,`dob`,`ekarmik_designation_code`,`mobile_no`,`dor`,`permanent_address`,`created_by`,`ip_address`)
VALUES
  (101,'0000000101',417008,'0417008','RAKESH KUMAR SHARMA','2005-06-01','1980-04-12',2388,9999999999,'2040-04-30','Raipur, Chhattisgarh',101,'::1'),
  (112,'0000000112',417008,'0417008','SUNITA VERMA','2008-07-15','1985-09-20',1153,8888888888,'2045-09-30','Bilaspur, Chhattisgarh',112,'::1')
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);


CREATE TABLE IF NOT EXISTS `mr_emp_family_details` (
  `family_code` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `emp_code` bigint(11) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `relation` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(11) unsigned NOT NULL DEFAULT 0,
  `ip_address` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`family_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mr_emp_family_details` (`emp_code`,`name`,`relation`,`date_of_birth`,`created_by`,`ip_address`)
VALUES
  (101,'GEETA SHARMA','WIFE','1983-02-10',101,'::1'),
  (101,'MOHAN SHARMA','FATHER','1955-11-05',101,'::1'),
  (101,'KAVITA SHARMA','MOTHER','1958-07-22',101,'::1'),
  (101,'AARAV SHARMA','SON','2010-03-18',101,'::1'),
  (112,'RAJESH VERMA','HUSBAND','1982-12-01',112,'::1'),
  (112,'PRIYA VERMA','DAUGHTER','2012-08-09',112,'::1');


-- ---------------------------------------------------------------------
-- TRANSACTION TABLES (populated by saveMedicalReimbursement)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mr_emp_medical_reimbursement_apply` (
  `application_code` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `emp_code` bigint(20) unsigned NOT NULL,
  `patient_name` varchar(50) NOT NULL DEFAULT '',
  `relation_code` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `total_amount` double unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(11) unsigned NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` bigint(11) unsigned DEFAULT NULL,
  `ip_address` varchar(50) NOT NULL DEFAULT '',
  `updated_ip_address` varchar(50) DEFAULT NULL,
  `relation_name` varchar(50) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `forward_stage` varchar(100) DEFAULT NULL,
  `current_stage` varchar(100) DEFAULT NULL,
  `disease_name` varchar(255) DEFAULT NULL,
  `reporting_officer_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`application_code`)
) ENGINE=InnoDB AUTO_INCREMENT=10000200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `mr_emp_medical_reimbursement_apply_details` (
  `application_details_code` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `application_code` int(10) unsigned NOT NULL,
  `treatment_type_code` tinyint(3) unsigned NOT NULL,
  `ipd_type_code` tinyint(4) DEFAULT NULL,
  `procedure_type_code` tinyint(3) unsigned DEFAULT NULL,
  `procedure_code` smallint(5) unsigned DEFAULT NULL,
  `district_code` smallint(5) unsigned NOT NULL,
  `hospital_code` int(10) unsigned NOT NULL,
  `receipt_no` varchar(50) NOT NULL DEFAULT '',
  `receipt_date` date DEFAULT NULL,
  `claim_amount` double NOT NULL DEFAULT 0,
  `quantity` int(11) DEFAULT NULL,
  `hospital_type` varchar(20) DEFAULT NULL,
  `is_recognised` char(1) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(11) unsigned NOT NULL,
  `ip_address` varchar(50) NOT NULL DEFAULT '',
  `treatment_from_date` date DEFAULT NULL,
  `treatment_to_date` date DEFAULT NULL,
  `total_days` int(11) DEFAULT NULL,
  `disease_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`application_details_code`),
  KEY `idx_appdetail_app` (`application_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `mr_emp_medical_remiburement_doc_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `application_code` int(11) unsigned NOT NULL,
  `emp_code` bigint(20) unsigned NOT NULL,
  `doc_type` int(11) unsigned NOT NULL,
  `doc_path` varchar(255) NOT NULL,
  `doc_name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(11) unsigned NOT NULL,
  `ip_address` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_doc_app` (`application_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `medical_reimbursement_applications` (
  `application_id` bigint(20) NOT NULL,
  `emp_id` bigint(20) DEFAULT NULL,
  `current_stage` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `pending_with` varchar(100) DEFAULT NULL,
  `previous_stage` varchar(100) DEFAULT NULL,
  `last_action_by` bigint(20) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
