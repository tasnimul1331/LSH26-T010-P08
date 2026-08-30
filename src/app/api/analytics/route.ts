// BottleResult — Analytics API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { getAnalyticsData } from '@/lib/analytics-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseCode = searchParams.get('caseCode') || undefined;

  const analytics = getAnalyticsData(caseCode === 'ALL' ? undefined : caseCode);

  return NextResponse.json({
    success: true,
    data: analytics,
  });
}
