import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string ,characterId: string } }
) {
    const {storyId} = await params;
    const {characterId} = await params;
  try {
    const body = await req.json();
    const { name, persona } = body;
    // TODO: Validate character belongs to user's story
    if (!characterId){
      return new NextResponse('Character ID is required', { status: 400 });
    }
    if (!storyId){
      return new NextResponse('Story ID is required', { status: 400 });
    }
    if (!name){
      return new NextResponse('Name is required', { status: 400 });
    }
    const character = await prisma.character.update({
      where: { id: characterId ,storyId:storyId },
      data: { name, persona },
    });
    return NextResponse.json(character);
  } catch (error) {
    console.error('[CHARACTER_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { characterId: string ,storyId: string} }
) {
    const {characterId} = await params;
    const {storyId} = await params;
  try {
    // TODO: Validate character belongs to user's story
    if (!characterId){
      return new NextResponse('Character ID is required', { status: 400 });
    }
    if(!storyId)
    {
      return new NextResponse('Story ID is required', { status: 400 });
    }
    await prisma.character.delete({
      where: { id: characterId ,storyId:storyId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error)
 {
    console.error('[CHARACTER_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}