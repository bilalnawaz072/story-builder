'use client'; // This component must be a client component to use the hook

import { notFound } from 'next/navigation';
import { NarrativeCanvas } from '@/components/canvas/narrative-canvas';
import { prisma } from '@/lib/prisma';
import { CreateSceneNodeButton } from '@/components/canvas/create-scene-node-button';
import { Character, Choice, Scene, Story } from '@/prisma/generated/client';
import { useStoryRole } from '@/components/providers/story-role-provider';
import { ReactFlowProvider } from 'reactflow';

interface StoryCanvasPageProps {
  story: Story & { characters: Character[], scenes: (Scene & { choicesFrom: Choice[] })[] };
}

// This is a Server Component for the /stories/[storyId] page
export default function StoryCanvasPageClient({ story }: StoryCanvasPageProps) {
  const { role } = useStoryRole();
  const isViewer = role === 'VIEWER';

  const allChoices = story.scenes.flatMap(scene => scene.choicesFrom);


  return (
    <ReactFlowProvider>

    <div className="flex flex-col h-full">
        {!isViewer && (
            <div className="flex justify-end mb-4">
                <CreateSceneNodeButton 
                    storyId={story.id} 
                    characters={story.characters}
                />
            </div>
        )}
        <div className="flex-grow">
            <NarrativeCanvas 
                storyId={story.id} 
                scenes={story.scenes} 
                choices={allChoices} 
                characters={story.characters}
            />
        </div>
    </div>
    </ReactFlowProvider>

  );
}

