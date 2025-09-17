import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  const {documentId} = await params
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // 1. Delete the file from Vercel Blob
    await del(document.url);

    // 2. Delete the record from our database
    await prisma.document.delete({
      where: { id: params.documentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}