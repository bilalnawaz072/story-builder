import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        ownerId: 'user_placeholder_id', // Hardcoded for now
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(stories);
  } catch (error) {
    console.error("[STORIES_GET]", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }



}

export async function POST(req: Request) {

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }


  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new NextResponse('Title is required', { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        title,
        description,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("[STORIES_POST]", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

