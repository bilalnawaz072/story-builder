import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StoryCanvasPageClient from './page-client';

export default async function StoryCanvasPage({ params }: { params: { storyId: string } }) {
  
  const {storyId} = await params;
  
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      scenes: {
        include: {
          choicesFrom: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      characters: {
        orderBy: {
            name: 'asc'
        }
      },
    },
  });

  if (!story) {
    notFound();
  }
  
  return <StoryCanvasPageClient story={story} />;
}