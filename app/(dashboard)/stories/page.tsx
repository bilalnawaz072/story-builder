import { auth } from '@/app/auth';
import { CreateStoryButton } from '@/components/stories/create-story-button';
import { StoryCard } from '@/components/stories/story-card';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function StoriesPage() {

  const session = await auth();
  
  if (!session?.user?.id) {
    return redirect('/login');
  }

  const userId = session.user.id;


  const stories = await prisma.story.findMany({
    where: {
        // KEY CHANGE: Fetch stories where the user is the owner OR is a member
        OR: [
            { ownerId: userId },
            { members: { some: { userId: userId } } }
        ]
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
        <CreateStoryButton />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
        {stories.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p>You don't have any stories yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}