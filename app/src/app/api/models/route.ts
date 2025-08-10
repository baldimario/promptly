import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let models: { id: string; value: string; label: string; promptCount: number }[] = [];
    if ((prisma as any).model?.findMany) {
      try {
        // @ts-expect-error delegate available after generate
        const stored = await prisma.model.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { prompts: true } } }
        });
        models = stored.map((m: any) => ({
          id: m.id,
          value: m.slug,
          label: m.name,
          promptCount: m._count?.prompts || 0
        }));
      } catch (err: any) {
        if (err?.code !== 'P2021') {
          console.warn('Model table query failed (returning empty list):', err);
        }
      }
    } else {
      console.warn('prisma.model delegate missing – likely prisma generate not run in this container. Returning empty list.');
    }
    return NextResponse.json({ models });
  } catch (e) {
  console.error('Error fetching models', e);
    return NextResponse.json({ models: [] });
  }
}
