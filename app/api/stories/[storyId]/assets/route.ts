import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  const {storyId} = await params
  try {
    const body = await req.json();
    const { name, type, content } = body;

    if (!name || !type || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    // TODO: Validate user ownership of the story

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        content,
        storyId: storyId,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('[ASSETS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}