import { prisma } from "./prisma";

/**
 * Checks if a user has permission to view a story.
 * A user can view if they are the owner OR a member.
 */
export async function canViewStory(userId: string, storyId: string): Promise<boolean> {
    const story = await prisma.story.findFirst({
        where: {
            id: storyId,
            OR: [
                { ownerId: userId },
                { members: { some: { userId: userId } } }
            ]
        }
    });
    return !!story;
}

/**
 * Checks if a user has permission to edit a story.
 * A user can edit if they are the owner OR a member with the role of EDITOR.
 */
export async function canEditStory(userId: string, storyId: string): Promise<boolean> {
    const story = await prisma.story.findFirst({
        where: {
            id: storyId,
            OR: [
                { ownerId: userId },
                { members: { some: { userId: userId, role: { in: ['OWNER', 'EDITOR'] } } } }
            ]
        }
    });
    return !!story;
}