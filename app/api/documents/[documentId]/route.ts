import { auth } from '@/app/auth';
import { canEditStory } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {

  const {documentId} = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    if (!documentId) {
        return new NextResponse('Document ID is required', { status: 400 });
    }

    // First, find the document in our database to get its URL
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // KEY SECURITY CHECK: Verify edit permission before deleting
    const hasPermission = await canEditStory(session.user.id, document.storyId);
    if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // 1. Delete the actual file from Vercel Blob storage
    await del(document.url);

    // 2. Delete the record from our database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content is a standard success response for DELETE
    
  } catch (error) {
    console.error('[DOCUMENT_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}