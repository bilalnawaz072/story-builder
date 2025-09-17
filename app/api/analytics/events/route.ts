import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const eventData = await req.json();

        // Manual validation since we are not using Zod
        const { playthroughId, storyId, choiceId, sourceSceneId, targetSceneId } = eventData;
        if (!playthroughId || !storyId || !choiceId || !sourceSceneId || !targetSceneId) {
            return new NextResponse('Missing required analytics data.', { status: 400 });
        }

        // Use a transaction to perform both writes at once
        await prisma.$transaction([
            // 1. Create the raw event log
            prisma.analyticsEvent.create({
                data: {
                    playthroughId,
                    storyId,
                    choiceId,
                    sourceSceneId,
                    targetSceneId,
                }
            }),
            // 2. Upsert (update or create) the aggregate count
            prisma.choiceAnalytics.upsert({
                where: { choiceId: choiceId },
                update: {
                    clickCount: {
                        increment: 1 // Atomically increment the count
                    }
                },
                create: {
                    choiceId: choiceId,
                    storyId: storyId,
                    clickCount: 1, // First click!
                }
            })
        ]);

        return new NextResponse(null, { status: 202 });

    } catch (error) {
        console.error("[ANALYTICS_POST]", error);
        // This request should not fail the user's experience, so we still return a success-like status
        return new NextResponse(null, { status: 202 });
    }
}