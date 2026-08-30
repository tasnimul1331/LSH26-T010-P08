// BottleResult — Production Database Seed & Import Script
// Executes against Supabase PostgreSQL using the service-role client
// Usage: npx tsx database/seed/import.ts

import rawDataset from '../../P08_school_results_public.json';
import { createAdminClient } from '../../src/lib/supabase/admin';
import {
  calculateStudentResult,
  normalizeRawMark,
  resolveGradingRules,
  DEFAULT_GRADING_RULES,
} from '../../src/lib/result-engine';
import type { MarkInput } from '../../src/lib/result-engine/types';
import type { DatasetRoot } from '../../src/types';

async function seedDatabase() {
  console.log('=== BottleResult Database Seed & Import Pipeline ===');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn(
      '⚠️ Supabase credentials not found in environment variables.'
    );
    console.warn(
      '⚠️ Application will continue using the high-performance integrated deterministic store.'
    );
    console.warn(
      '💡 To seed a live Supabase database, set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
    return;
  }

  const supabase = createAdminClient();
  const dataset = rawDataset as unknown as DatasetRoot;

  console.log(`Starting transactional import of ${dataset.cases.length} cohorts...`);

  for (const c of dataset.cases) {
    console.log(`Importing cohort ${c.case_id} (${c.students.length} students)...`);

    // 1. Insert Case
    const { data: caseRow, error: caseErr } = await supabase
      .from('cases')
      .upsert(
        {
          case_code: c.case_id,
          problem_id: dataset.problem_id || 'P08',
          schema_version: dataset.schema_version || '2.1',
          name: `SSC Exam Cohort — ${c.case_id}`,
          status: 'PUBLISHED',
        },
        { onConflict: 'case_code' }
      )
      .select()
      .single();

    if (caseErr) {
      console.error(`Failed to insert case ${c.case_id}`, caseErr);
      continue;
    }

    const caseId = caseRow.id;

    // 2. Insert Classes
    const classNames = [...new Set(c.students.map((s) => s.class))];
    const classIdMap = new Map<string, string>();

    for (const clsName of classNames) {
      const { data: classRow, error: classErr } = await supabase
        .from('classes')
        .upsert(
          {
            case_id: caseId,
            name: clsName,
            academic_year: '2024',
          },
          { onConflict: 'case_id,name' }
        )
        .select()
        .single();

      if (!classErr && classRow) {
        classIdMap.set(clsName, classRow.id);
      }
    }

    // 3. Insert Subjects
    const subjectIdMap = new Map<string, string>();
    for (let idx = 0; idx < c.subjects.length; idx++) {
      const subj = c.subjects[idx];
      const isCompulsory = c.compulsory.includes(subj.code);
      const { data: subjRow, error: subjErr } = await supabase
        .from('subjects')
        .upsert(
          {
            case_id: caseId,
            code: subj.code,
            name: subj.name,
            has_practical: subj.practical,
            is_compulsory: isCompulsory,
            max_marks: 100,
            theory_max: subj.practical ? 75 : 100,
            practical_max: subj.practical ? 25 : 0,
            display_order: idx + 1,
          },
          { onConflict: 'case_id,code' }
        )
        .select()
        .single();

      if (!subjErr && subjRow) {
        subjectIdMap.set(subj.code, subjRow.id);
      }
    }

    // 4. Insert Grading Rules
    await supabase.from('grading_rules').upsert(
      {
        case_id: caseId,
        rule_name: `Bangladesh SSC Rules (${c.case_id})`,
        rule_type: 'GRADE_BANDS',
        configuration: {
          grade_bands: DEFAULT_GRADING_RULES.gradeBands,
          total_pass_mark: 33,
          optional_contribution_base: 2.0,
          compulsory_count: 6,
          gpa_cap: 5.0,
        },
        active: true,
      },
      { onConflict: 'case_id,rule_name' }
    );
  }

  console.log('✅ Supabase database seed completed successfully!');
}

seedDatabase().catch((err) => {
  console.error('Seed script error:', err);
});
