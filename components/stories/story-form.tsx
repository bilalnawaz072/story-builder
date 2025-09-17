'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Story } from '@/prisma/generated/client';

interface StoryFormProps {
  story: Story;
  onSuccess?: () => void;
}

export function StoryForm({ story, onSuccess }: StoryFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
    };

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update story.');
      
      toast.success('Story details updated!');
      router.refresh();
      if (onSuccess) onSuccess();

    } catch (error) {
      toast.error('Could not update story.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={story.title} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="A brief description of your story."
          defaultValue={story.description || ''}
        />
      </div>
      <Button type="submit" disabled={isSaving} className="mt-2">
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}