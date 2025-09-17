'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SceneForm } from '../stories/scenes/scene-form';
import { Character } from '@/prisma/generated/client';

interface CreateSceneNodeButtonProps {
  storyId: string;
  characters: Character[];
}

export function CreateSceneNodeButton({ storyId ,characters  }: CreateSceneNodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Scene
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Scene</DialogTitle>
        </DialogHeader>
        <SceneForm storyId={storyId} characters={characters} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}