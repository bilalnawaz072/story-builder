import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { choiceId: string } }
) {
    const { choiceId } = await params;
  if (!choiceId) {
    return new NextResponse('Choice ID is required', { status: 400 });
  }
  try {
    // TODO: Validate that the choice belongs to the user's story
    await prisma.choice.delete({
      where: { id: choiceId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[CHOICE_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}