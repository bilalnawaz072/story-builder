import { auth } from '@/app/auth';
import { canEditStory } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // KEY SECURITY CHECK: Verify user has edit permission for this story
  const hasPermission = await canEditStory(session.user.id, params.storyId);
  if (!hasPermission) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { storyId } = await params;
    const body = await req.json();
    const { title , content } = body;
    

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new NextResponse('Title is required', { status: 400 });
    }

    if (!storyId) {
        return new NextResponse('Story ID is required', { status: 400 });
    }

    // TODO: Verify the story belongs to the current user

    const scene = await prisma.scene.create({
      data: {
        title,
        content,
        storyId: storyId,
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error("[SCENES_POST]", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

