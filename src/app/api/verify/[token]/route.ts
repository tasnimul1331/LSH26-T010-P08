// BottleResult — Verification API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { verifyResultByToken } from '@/lib/data-service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const verified = verifyResultByToken(token);

  if (!verified) {
    return NextResponse.json(
      { success: false, error: 'Verification token invalid or not published' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: verified,
  });
}
