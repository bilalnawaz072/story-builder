import { inngest } from '@/lib/inngest/client';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const { storyId } = await params
    const body = await req.json();
    const { name, url } = body;

    if (!name || !url) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name,
        url,
        storyId: storyId,
      },
    });

    await inngest.send({
      name: 'document/uploaded',
      data: {
        documentId: document.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('[DOCUMENTS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}