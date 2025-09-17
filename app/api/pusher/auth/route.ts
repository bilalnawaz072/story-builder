import { auth } from "@/app/auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.formData();
    const socketId = data.get('socket_id') as string;
    const channel = data.get('channel_name') as string;

    const userData = {
        user_id: session.user.id,
        user_info: {
            name: session.user.name,
            image: session.user.image,
        },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
    return NextResponse.json(authResponse);
}