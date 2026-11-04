-- =====================================================
-- Absensi WFH - Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS absensi_wfh
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE absensi_wfh;

-- -----------------------------------------------------
-- employees: data master karyawan (employee-service)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  employee_code   VARCHAR(20)  NOT NULL UNIQUE,
  full_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(100) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  department      VARCHAR(50),
  position        VARCHAR(50),
  join_date       DATE,

  -- Data pribadi
  domicile        VARCHAR(255) NULL,
  birth_place     VARCHAR(100) NULL,
  birth_date      DATE         NULL,
  gender          VARCHAR(10)  NULL COMMENT 'MALE | FEMALE',
  marital_status  VARCHAR(20)  NULL COMMENT 'SINGLE | MARRIED | DIVORCED | WIDOWED',
  identity_number VARCHAR(16)  NULL COMMENT 'NIK KTP, 16 digit',
  npwp_number     VARCHAR(16)  NULL COMMENT 'NPWP, 15 atau 16 digit',

  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uq_employees_identity_number (identity_number)
);

-- -----------------------------------------------------
-- users: akun login, termasuk admin HRD (auth-service)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  employee_id   INT          NOT NULL UNIQUE,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  must_change_password TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_employee FOREIGN KEY (employee_id)
    REFERENCES employees(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- attendances: data absensi WFH (attendance-service)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS attendances (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT           NOT NULL,
  attendance_date  DATE          NOT NULL,
  check_in_time    DATETIME      NOT NULL,
  photo_path       VARCHAR(255)  NOT NULL COMMENT 'Path relatif file foto, bukan isi foto',
  latitude         DECIMAL(10,7) NULL,
  longitude        DECIMAL(10,7) NULL,
  location_address VARCHAR(255)  NULL,
  notes            VARCHAR(255),
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendances_employee FOREIGN KEY (employee_id)
    REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT uq_attendance_per_day UNIQUE (employee_id, attendance_date)
);