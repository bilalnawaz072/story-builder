import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const { storyId } = await params;
    const body = await req.json();
    const { title, description } = body;
    // TODO: Add user ownership validation
    const story = await prisma.story.update({
      where: { id: storyId },
      data: { title, description },
    });
    return NextResponse.json(story);
  } catch (error) {
    console.error('[STORY_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string } }
) {
    const { storyId } = await params;
  try {
    // TODO: Add user ownership validation
    await prisma.story.delete({
      where: { id: storyId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[STORY_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}