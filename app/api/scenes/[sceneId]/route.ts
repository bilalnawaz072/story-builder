import { auth } from '@/app/auth';
import { canEditStory } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


async function checkPermissions(sceneId: string, userId: string): Promise<boolean> {
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    select: { storyId: true },
  });
  if (!scene) return false;
  return canEditStory(userId, scene.storyId);
}

export async function PATCH(
  req: Request,
  { params }: { params: { sceneId: string } }
) {
  const { sceneId } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const hasPermission = await checkPermissions(params.sceneId, session.user.id);
  if (!hasPermission) return new NextResponse('Forbidden', { status: 403 });


  try {
    // 1. Parse request body
    const body = await req.json();

    // ✅ Whitelist allowed fields (security best practice)
    const { title, content, order } = body;

    // 2. Find the scene to get its storyId
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      select: { storyId: true },
    });
    if (!scene) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // 3. Permission check
    const hasPermission = await canEditStory(session.user.id, scene.storyId);
    if (!hasPermission) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 4. Update scene (only allowed fields)
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(updatedScene, { status: 200 });
  } catch (error) {
    console.error('[SCENE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { sceneId: string } }
) {
  const { sceneId } = await params;

  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const hasPermission = await checkPermissions(params.sceneId, session.user.id);
  if (!hasPermission) return new NextResponse('Forbidden', { status: 403 });
 

  try {
    // 1. Find the scene to get its storyId
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      select: { storyId: true },
    });
    if (!scene) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // 2. KEY SECURITY CHECK: Use the storyId to verify permission
    const hasPermission = await canEditStory(session.user.id, scene.storyId);
    if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. If permission is granted, proceed with the deletion
    await prisma.scene.delete({
      where: { id: sceneId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SCENE_DELETE]", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}