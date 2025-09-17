import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
    const {storyId} = await params;
  try {
    const body = await req.json();
    const { name, persona } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    // TODO: Validate that story belongs to user

    const character = await prisma.character.create({
      data: {
        name,
        persona,
        storyId: storyId,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('[CHARACTERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}