'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Character } from '@/prisma/generated/client';

interface CharacterFormDialogProps {
  storyId: string;
  character?: Character;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CharacterFormDialog({ storyId, character, children, open, onOpenChange }: CharacterFormDialogProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Use internal state only if not controlled from parent
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    const apiEndpoint = character ? `/api/stories/${storyId}/characters/${character.id}` : `/api/stories/${storyId}/characters`;
    const method = character ? 'PATCH' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save character.');
      
      toast.success(`Character ${character ? 'updated' : 'created'}.`);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error('Could not save character.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{character ? 'Edit Character' : 'Add a New Character'}</DialogTitle>
          <DialogDescription>
            Define a character in your story. Their persona will help the AI generate dialogue later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={character?.name || ''} required autoFocus/>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="persona">Persona</Label>
            <Textarea
              id="persona"
              name="persona"
              placeholder="e.g., A grizzled, cynical detective with a hidden heart of gold. Speaks in short, clipped sentences."
              defaultValue={character?.persona || ''}
              rows={5}
            />
          </div>
          <Button type="submit" disabled={isSaving} className="mt-2">
            {isSaving ? 'Saving...' : 'Save Character'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}