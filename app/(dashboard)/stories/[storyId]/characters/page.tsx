import { CharacterList } from "@/components/characters/character-list";
import { prisma } from "@/lib/prisma";

interface CharactersPageProps {
    params: { storyId: string };
}

export default async function CharactersPage({ params }: CharactersPageProps) {
    const { storyId } = await params;
  
  const characters = await prisma.character.findMany({
    where: { storyId: storyId },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
        <CharacterList initialCharacters={characters} storyId={storyId} />
    </div>
  );
}