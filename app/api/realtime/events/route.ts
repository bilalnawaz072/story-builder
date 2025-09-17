import { auth } from "@/app/auth";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { channel, event, data, socketId } = await req.json();

        if (!channel || !event || !data || !socketId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Trigger the event on the Pusher channel, excluding the sender
        await pusherServer.trigger(channel, event, data, { socket_id: socketId });

        return new NextResponse("Event broadcasted", { status: 200 });

    } catch (error) {
        console.error("[REALTIME_EVENTS_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}