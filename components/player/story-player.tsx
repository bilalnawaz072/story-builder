'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Choice, Scene, Story } from '@/prisma/generated/client';

interface StoryPlayerProps {
    story: Story;
    scenes: Scene[];
    choices: Choice[];
    initialSceneId: string;
}


export function StoryPlayer({ story, scenes, choices, initialSceneId }: StoryPlayerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);
    const [playthroughId, setPlaythroughId] = useState<string | null>(null);

    // This effect runs once when the player loads to generate a unique ID
    useEffect(() => {
        setPlaythroughId(crypto.randomUUID());
    }, []);

    // Re-sync state if the URL changes (e.g., browser back/forward buttons)
    useEffect(() => {
        const sceneFromUrl = searchParams.get('scene');
        if (sceneFromUrl && sceneFromUrl !== currentSceneId) {
            setCurrentSceneId(sceneFromUrl);
        }
    }, [searchParams, currentSceneId]);

    // Find the current scene object based on the ID
    const currentScene = useMemo(() => {
        return scenes.find(s => s.id === currentSceneId);
    }, [currentSceneId, scenes]);

    // Find the available choices for the current scene
    const availableChoices = useMemo(() => {
        return choices.filter(c => c.sourceSceneId === currentSceneId);
    }, [currentSceneId, choices]);

    const handleChoiceClick = (choice: Choice) => {
        // KEY ADDITION: Fire the analytics event before navigating
        if (playthroughId) {
            const eventData = {
                playthroughId,
                storyId: story.id,
                choiceId: choice.id,
                sourceSceneId: choice.sourceSceneId,
                targetSceneId: choice.targetSceneId,
                timestamp: new Date().toISOString(),
            };

            // This is a "fire-and-forget" request. We don't need to wait for it.
            // This ensures the analytics tracking doesn't slow down the user experience.
            fetch('/api/analytics/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
                keepalive: true, // Helps ensure the request is sent even if the user navigates away
            });
        }
        
        // The original navigation logic remains the same
        router.push(`/play/${story.id}?scene=${choice.targetSceneId}`, { scroll: false });
        setCurrentSceneId(choice.targetSceneId);
    };

    if (!currentScene) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary">
                <Card className="m-4">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>This part of the story could not be found.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild><a href={`/play/${story.id}`}>Return to the Beginning</a></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-secondary p-4 sm:p-6">
            <Card className="w-full max-w-2xl animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-center">{currentScene.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentScene.content || "<p>This scene is just beginning...</p>" }} 
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-6">
                {availableChoices.length > 0 ? (
                        availableChoices.map(choice => (
                            <Button 
                                key={choice.id} 
                                // Pass the full choice object to the handler
                                onClick={() => handleChoiceClick(choice)}
                                className="w-full"
                                variant="outline"
                            >
                                {choice.text}
                            </Button>
                        ))
                    ) : (
                        <p className="text-muted-foreground font-semibold">The End</p>
                    )}                </CardFooter>
            </Card>
            <footer className="mt-6 text-sm text-muted-foreground">
                A story by {story.title} | Powered by Narrative Engine
            </footer>
        </div>
    );
}