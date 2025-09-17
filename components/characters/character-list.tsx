'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Character } from '@/prisma/generated/client';
import { CharacterFormDialog } from './character-form-dialog';
import { useStoryRole } from '../providers/story-role-provider';

interface CharacterListProps {
  initialCharacters: Character[];
  storyId: string;
}

export function CharacterList({ initialCharacters, storyId }: CharacterListProps) {
  const { role } = useStoryRole();
  const isViewer = role === 'VIEWER'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Character Library</h2>
        {/* KEY FIX: Hide the "Add" button for viewers */}
        {!isViewer && (
          <CharacterFormDialog storyId={storyId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Character
            </Button>
          </CharacterFormDialog>
        )}
      </div>
      {initialCharacters.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">This story has no characters yet.</p>
          <p className="text-sm text-muted-foreground">Add one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialCharacters.map((character) => (
            <CharacterCard key={character.id} character={character} storyId={storyId} isViewer={isViewer} />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({ character, storyId, isViewer }: { character: Character, storyId: string, isViewer: boolean }) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters/${character.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete.");

      toast.success('Character deleted.');
      router.refresh();
      setIsDeleteAlertOpen(false);
    } catch (error) {
      toast.error('Could not delete character.');
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>{character.name}</CardTitle>
          {
            !isViewer && (
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setIsEditDialogOpen(true); setIsDropdownOpen(false); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setIsDeleteAlertOpen(true); setIsDropdownOpen(false); }} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-4 h-[80px]">
            {character.persona || "No persona defined."}
          </p>
        </CardContent>
      </Card>

      <CharacterFormDialog
        storyId={storyId}
        character={character}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this character. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}