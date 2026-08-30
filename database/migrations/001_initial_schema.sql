-- BottleResult — Initial Database Schema Migration
-- Run this against your Supabase PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'VIEWER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CASES
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_code TEXT NOT NULL UNIQUE,
  problem_id TEXT NOT NULL DEFAULT 'P08',
  schema_version TEXT NOT NULL DEFAULT '2.1',
  name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IMPORTED', 'CALCULATED', 'CHECKING', 'VERIFIED', 'PUBLISHED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, name)
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  has_practical BOOLEAN NOT NULL DEFAULT FALSE,
  is_compulsory BOOLEAN NOT NULL DEFAULT FALSE,
  max_marks INTEGER NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  theory_max INTEGER CHECK (theory_max IS NULL OR theory_max >= 0),
  practical_max INTEGER CHECK (practical_max IS NULL OR practical_max >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, code)
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_code TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  optional_subject_id UUID REFERENCES subjects(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, student_code)
);

-- ============================================================
-- MARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  theory_marks NUMERIC CHECK (theory_marks IS NULL OR theory_marks >= 0),
  practical_marks NUMERIC CHECK (practical_marks IS NULL OR practical_marks >= 0),
  is_absent BOOLEAN NOT NULL DEFAULT FALSE,
  raw_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================================
-- RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  gpa NUMERIC NOT NULL DEFAULT 0 CHECK (gpa >= 0 AND gpa <= 5),
  letter_grade TEXT NOT NULL DEFAULT 'F',
  total_marks NUMERIC NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  result_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (result_status IN ('DRAFT', 'CALCULATED', 'CHECKING', 'VERIFIED', 'PUBLISHED')),
  calculation_version TEXT NOT NULL DEFAULT '1.0.0',
  calculated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  verification_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id)
);

-- ============================================================
-- SUBJECT RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subject_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  total_marks NUMERIC NOT NULL DEFAULT 0,
  grade_point NUMERIC NOT NULL DEFAULT 0,
  letter_grade TEXT NOT NULL DEFAULT 'F',
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  is_compulsory BOOLEAN NOT NULL DEFAULT FALSE,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  failure_reason TEXT,
  calculation_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(result_id, subject_id)
);

-- ============================================================
-- CHECKING ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS checking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('OPTIONAL_LOW', 'PRACTICAL_FAILURE', 'ABSENT', 'COMPULSORY_FAILURE', 'DATA_ERROR')),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'WARNING')),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GRADING RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS grading_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  min_mark NUMERIC,
  max_mark NUMERIC,
  grade_point NUMERIC,
  letter_grade TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_case_id ON students(case_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject_id ON marks(subject_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_case_id ON results(case_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON results(result_status);
CREATE INDEX IF NOT EXISTS idx_results_verification_token ON results(verification_token);
CREATE INDEX IF NOT EXISTS idx_subject_results_result_id ON subject_results(result_id);
CREATE INDEX IF NOT EXISTS idx_checking_items_student_id ON checking_items(student_id);
CREATE INDEX IF NOT EXISTS idx_checking_items_result_id ON checking_items(result_id);
CREATE INDEX IF NOT EXISTS idx_checking_items_type ON checking_items(type);
CREATE INDEX IF NOT EXISTS idx_checking_items_resolved ON checking_items(resolved);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grading_rules_case_id ON grading_rules(case_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON marks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grading_rules_updated_at BEFORE UPDATE ON grading_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'VIEWER')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE checking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_rules ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cases: authenticated users can read, admins can manage
CREATE POLICY "Authenticated users can view cases" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage cases" ON cases FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Classes: authenticated users can read
CREATE POLICY "Authenticated users can view classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Subjects: authenticated users can read
CREATE POLICY "Authenticated users can view subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Students: authenticated users can read
CREATE POLICY "Authenticated users can view students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage students" ON students FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Marks: authenticated users can read, admins/teachers can manage
CREATE POLICY "Authenticated users can view marks" ON marks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage marks" ON marks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER'))
);

-- Results: public can read published, authenticated can read all
CREATE POLICY "Public can view published results" ON results FOR SELECT TO anon USING (result_status = 'PUBLISHED');
CREATE POLICY "Authenticated users can view results" ON results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage results" ON results FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Subject Results: same as results
CREATE POLICY "Public can view published subject results" ON subject_results FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM results WHERE results.id = subject_results.result_id AND results.result_status = 'PUBLISHED')
);
CREATE POLICY "Authenticated users can view subject results" ON subject_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subject results" ON subject_results FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Checking Items: authenticated can read, admins can manage
CREATE POLICY "Authenticated users can view checking items" ON checking_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage checking items" ON checking_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Audit Logs: admins can read
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Grading Rules: authenticated can read, admins can manage
CREATE POLICY "Authenticated users can view grading rules" ON grading_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage grading rules" ON grading_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN'))
);

-- Public access for cases/students/subjects for published result lookups
CREATE POLICY "Public can view cases" ON cases FOR SELECT TO anon USING (status = 'PUBLISHED');
CREATE POLICY "Public can view classes for published cases" ON classes FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = classes.case_id AND cases.status = 'PUBLISHED')
);
CREATE POLICY "Public can view subjects for published cases" ON subjects FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = subjects.case_id AND cases.status = 'PUBLISHED')
);
CREATE POLICY "Public can view students for published cases" ON students FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cases WHERE cases.id = students.case_id AND cases.status = 'PUBLISHED')
);
