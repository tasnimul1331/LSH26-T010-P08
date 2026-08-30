// BottleResult — Results API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { getStudents, getCases } from '@/lib/data-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseCode = searchParams.get('caseCode') || undefined;
  const status = searchParams.get('status') || undefined;

  let students = getStudents(caseCode);
  if (status) {
    students = students.filter((s) => s.result_status === status);
  }

  return NextResponse.json({
    success: true,
    total: students.length,
    data: students,
  });
}
