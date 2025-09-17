import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, sourceSceneId, targetSceneId } = body;

    if (!text || !sourceSceneId || !targetSceneId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    // TODO: Validate that both scenes belong to the user's story

    const choice = await prisma.choice.create({
      data: {
        text,
        sourceSceneId,
        targetSceneId,
      },
    });

    return NextResponse.json(choice, { status: 201 });
  } catch (error) {
    console.error('[CHOICES_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}