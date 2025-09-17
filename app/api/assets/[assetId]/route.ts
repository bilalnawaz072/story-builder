import { auth } from '@/app/auth';
import { canEditStory } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


async function checkAssetPermissions(assetId: string, userId: string): Promise<boolean> {
  const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { storyId: true },
  });
  if (!asset) return false;
  return canEditStory(userId, asset.storyId);
}

export async function PATCH(
  req: Request,
  { params }: { params: { assetId: string } }
) {
  const {assetId} = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const hasPermission = await checkAssetPermissions(params.assetId, session.user.id);
  if (!hasPermission) return new NextResponse('Forbidden', { status: 403 });


  try {
    const body = await req.json();
    const { name, type, content } = body;
    // TODO: Validate user ownership

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: { name, type, content },
    });
    return NextResponse.json(asset);
  } catch (error) {
    console.error('[ASSET_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { assetId: string } }
) {

  const {assetId} = await params;
  const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const hasPermission = await checkAssetPermissions(params.assetId, session.user.id);
    if (!hasPermission) return new NextResponse('Forbidden', { status: 403 });

  try {
    // TODO: Validate user ownership
    await prisma.asset.delete({
      where: { id: assetId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ASSET_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}