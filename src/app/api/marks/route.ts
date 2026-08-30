// BottleResult — Marks Update API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { updateMark } from '@/lib/data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseCode, studentCode, subjectCode, theoryMarks, practicalMarks, isAbsent, reason, updatedBy } = body;

    if (!caseCode || !studentCode || !subjectCode) {
      return NextResponse.json(
        { success: false, error: 'caseCode, studentCode, and subjectCode are required' },
        { status: 400 }
      );
    }

    const res = updateMark({
      caseCode,
      studentCode,
      subjectCode,
      theoryMarks,
      practicalMarks,
      isAbsent,
      reason: reason || 'Administrative correction',
      updatedBy,
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
