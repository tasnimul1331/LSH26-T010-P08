// BottleResult — Checking Items API Endpoint
import { NextResponse, type NextRequest } from 'next/server';
import { getCheckingItems, resolveCheckingItem } from '@/lib/data-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseCode = searchParams.get('caseCode') || undefined;
  const type = searchParams.get('type') || undefined;
  const severity = searchParams.get('severity') || undefined;
  const resolvedParam = searchParams.get('resolved');
  const resolved = resolvedParam === 'true' ? true : resolvedParam === 'false' ? false : undefined;

  const items = getCheckingItems({
    caseCode: caseCode === 'ALL' ? undefined : caseCode,
    type: type === 'ALL' ? undefined : type,
    severity: severity === 'ALL' ? undefined : severity,
    resolved,
  });

  return NextResponse.json({
    success: true,
    total: items.length,
    data: items,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, resolvedBy } = body;

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId is required' }, { status: 400 });
    }

    const res = resolveCheckingItem(itemId, resolvedBy || 'Admin');
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
