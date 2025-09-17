import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/prisma/generated/client";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    storyId: string;
    memberId: string; // This is the ID of the StoryMember record
  };
}


// Handler to UPDATE a member's role
export async function PATCH(req: Request, { params }: RouteParams) {
    const {storyId,memberId} = await params

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const story = await prisma.story.findUnique({ where: { id: storyId } });
        // Security Check: Only the story owner can change roles.
        if (!story || story.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { role } = await req.json() as { role: Role };
        if (!role || !Object.values(Role).includes(role) || role === 'OWNER') {
            return NextResponse.json({ error: "Invalid role provided" }, { status: 400 });
        }

        const updatedMember = await prisma.storyMember.update({
            where: { id: memberId, storyId: storyId },
            data: { role: role }
        });

        return NextResponse.json(updatedMember);

    } catch (error) {
        console.error("[MEMBER_PATCH]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Handler to DELETE a member
export async function DELETE(req: Request, { params }: RouteParams) {
    const {storyId,memberId} = await params

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const story = await prisma.story.findUnique({ where: { id: storyId } });
        // Security Check: Only the story owner can remove members.
        if (!story || story.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.storyMember.delete({
            where: { id: memberId ,storyId: storyId }
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("[MEMBER_DELETE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}