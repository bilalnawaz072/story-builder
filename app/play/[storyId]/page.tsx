import { notFound } from "next/navigation";
import { StoryPlayer } from "@/components/player/story-player";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface PlayerPageProps {
    params: { storyId: string };
    searchParams: { scene?: string };
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
    const { storyId } = await params;
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    return {
        title: story?.title || "An Interactive Story",
        description: story?.description || "A story powered by Narrative Engine.",
    };
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
    const { storyId } = await params;
    const { scene } = await searchParams; // KEY FIX: Await searchParams to access scene

    // Fetch all choices related to this story
    const choices = await prisma.choice.findMany({
        where: {
            sourceScene: {
                storyId: storyId,
            },
        },
    });

    // Fetch the story and its scenes together
    const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: {
            scenes: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!story || story.scenes.length === 0) {
        return notFound();
    }

    // Determine the starting scene
    const targetSceneIds = new Set(choices.map((c) => c.targetSceneId));
    let startScene = story.scenes.find((s) => !targetSceneIds.has(s.id));

    if (!startScene) {
        startScene = story.scenes[0];
    }

    const initialSceneId = scene || startScene.id; // Use awaited scene value

    return (
        <StoryPlayer
            story={story}
            scenes={story.scenes}
            choices={choices}
            initialSceneId={initialSceneId}
        />
    );
}