// BottleResult — Publish Status API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { updatePublishStatus } from '@/lib/data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseCode, studentCode, status, user } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
    }

    const res = updatePublishStatus({
      caseCode,
      studentCode,
      status,
      user: user || 'Administrator',
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
