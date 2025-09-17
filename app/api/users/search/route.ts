import { NextResponse } from "next/server";
import { canEditStory } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/auth";

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
    const session = await auth();
    const {storyId} = await params
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only editors/owners can add new members
    const hasAccess = await canEditStory(session.user.id, storyId);
    if (!hasAccess) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId, role } = await req.json();

    const newMember = await prisma.storyMember.create({
        data: {
            storyId: storyId,
            userId: userId,
            role: role
        }
    });

    return NextResponse.json(newMember, { status: 201 });
}

export async function GET(req: Request) {
    
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const emailQuery = searchParams.get('email');

        if (!emailQuery) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                email: {
                    contains: emailQuery,
                    mode: 'insensitive'
                },
                id: { not: session.user.id }
            },
            take: 5,
            select: { id: true, name: true, email: true, image: true }
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error("[USERS_SEARCH_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
