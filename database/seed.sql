-- =====================================================
-- Absensi WFH - Data Awal (Seed)
-- Jalankan SETELAH schema.sql
--
-- Akun demo:
--   Admin HRD : admin@company.com  / admin123
--   Karyawan  : budi@company.com   / karyawan123
--               siti@company.com   / karyawan123 (wajib ganti password saat login pertama kali)
--               andi@company.com   / karyawan123 (nonaktif, tidak bisa login)
--
-- Semua data di bawah adalah data fiktif.
-- =====================================================

USE absensi_wfh;

-- -----------------------------------------------------
-- Data karyawan
-- INSERT IGNORE: kalau file ini dijalankan dua kali,
-- data yang sudah ada dilewati, bukan error.
-- -----------------------------------------------------
INSERT IGNORE INTO employees
  (employee_code, full_name, email, phone, department, position, join_date,
   domicile, birth_place, birth_date, gender, marital_status,
   identity_number, npwp_number, is_active)
VALUES
  ('EMP001', 'Admin HRD', 'admin@company.com', '081200000001',
   'Human Resources', 'HR Manager', '2024-01-01',
   'Jakarta Selatan', 'Jakarta', '1990-05-12', 'FEMALE', 'MARRIED',
   '3171000000000001', '0000000000000001', 1),

  ('EMP002', 'Budi Santoso', 'budi@company.com', '081200000002',
   'Engineering', 'Software Engineer', '2024-03-15',
   'Depok', 'Bandung', '1995-08-21', 'MALE', 'SINGLE',
   '3171000000000002', '0000000000000002', 1),

  ('EMP003', 'Siti Rahmawati', 'siti@company.com', '081200000003',
   'Finance', 'Accounting Staff', '2024-06-01',
   'Tangerang Selatan', 'Surabaya', '1997-11-03', 'FEMALE', 'MARRIED',
   '3171000000000003', NULL, 1),

  ('EMP004', 'Andi Pratama', 'andi@company.com', '081200000004',
   'Marketing', 'Marketing Staff', '2023-09-10',
   'Bekasi', 'Medan', '1993-02-17', 'MALE', 'DIVORCED',
   '3171000000000004', NULL, 0);

-- -----------------------------------------------------
-- Akun login
-- employee_id diambil lewat SELECT berdasarkan email,
-- jadi tidak bergantung pada nilai id auto increment.
-- -----------------------------------------------------
INSERT IGNORE INTO users (email, password_hash, role, employee_id, is_active, must_change_password)
SELECT e.email, s.password_hash, s.role, e.id, e.is_active, s.must_change_password
FROM employees e
JOIN (
  SELECT 'admin@company.com' AS email,
         '$2b$10$s75v8fcOnwdu/nJjtYRsvO9CIilR1KebNfrD.OiNXgLYibxTmprTC' AS password_hash,
         'ADMIN' AS role,
         0 AS must_change_password
  UNION ALL
  SELECT 'budi@company.com',
         '$2b$10$upU0VdhIYi755UkL8MSxxOXsN6dAPUolytSclmoD1AizyHmve6mhC', 'EMPLOYEE', 0
  UNION ALL
  SELECT 'siti@company.com',
         '$2b$10$upU0VdhIYi755UkL8MSxxOXsN6dAPUolytSclmoD1AizyHmve6mhC', 'EMPLOYEE', 1
  UNION ALL
  SELECT 'andi@company.com',
         '$2b$10$upU0VdhIYi755UkL8MSxxOXsN6dAPUolytSclmoD1AizyHmve6mhC', 'EMPLOYEE', 0
) AS s ON s.email = e.email;