import { notFound } from 'next/navigation';
import { canViewStory } from '@/lib/permissions';
import { StoryNav } from '@/components/stories/story-nav';
import { ShareStoryButton } from '@/components/stories/share-story-button';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { StoryRoleProvider } from '@/components/providers/story-role-provider';
import { Role } from '@/prisma/generated/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default async function StoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storyId: string };
}) {

  const {storyId} = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }
  const userId = session.user.id;

  const hasAccess = await canViewStory(userId, storyId);
  if (!hasAccess) {
    return notFound();
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      owner: true,
      members: {
        include: {
          user: true,
        }
      }
    }
  });

  if (!story) {
    return notFound();
  }

  let userRole: Role = 'VIEWER';
  if (story.ownerId === userId) {
    userRole = 'OWNER';
  } else {
    const member = story.members.find(m => m.userId === userId);
    if (member) {
      userRole = member.role;
    }
  }

  const isOwner = userRole === 'OWNER';



  return (
    <StoryRoleProvider role={userRole}>
      <div className="flex flex-col h-full">
        <header className="container mx-auto py-6 border-b">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{story.title}</h1>
                    <p className="text-muted-foreground">{story.description || 'Manage your story details.'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* The "Save Version" button from M19 has been removed */}
                    {isOwner && <ShareStoryButton story={story} />}
                    <Button asChild>
                        <Link href={`/play/${story.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> Preview
                        </Link>
                    </Button>
                </div>
            </div>
            <StoryNav storyId={story.id} />
        </header>
        <main className="flex-grow container mx-auto py-8">
          {children}
        </main>
      </div>
    </StoryRoleProvider>

  );
}