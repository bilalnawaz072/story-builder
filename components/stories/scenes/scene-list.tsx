'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, GripVertical, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Scene, Story } from '@/prisma/generated/client';

interface SceneListProps {
  story: Story;
  initialScenes: Scene[];
}

export function SceneList({ story, initialScenes }: SceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const router = useRouter();

  const handleAddScene = async (e: FormEvent) => {
    e.preventDefault();
    if (newSceneTitle.trim() === '') {
      toast.error('Scene title cannot be empty.');
      return;
    }

    const response = await fetch(`/api/stories/${story.id}/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSceneTitle }),
    });

    if (response.ok) {
      toast.success('Scene added!');
      setNewSceneTitle('');
      router.refresh();
      window.location.reload(); // Force reload to ensure fresh data
    } else {
      toast.error('Failed to add scene.');
    }
  };

  const onDeleteScene = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;

    const response = await fetch(`/api/scenes/${sceneId}`, { method: 'DELETE' });

    if (response.ok) {
        toast.success('Scene deleted!');
        setScenes(scenes.filter(s => s.id !== sceneId)); // Optimistic UI update
        // No router.refresh() needed for deletion with optimistic update to feel faster
    } else {
        toast.error('Failed to delete scene.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scenes.map((scene) => (
            <div key={scene.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span>{scene.title}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><span className="sr-only">Open menu</span>...</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                        <Edit className="mr-2 h-4 w-4" /><span>Edit (coming soon)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:bg-red-100 focus:text-red-700" onClick={() => onDeleteScene(scene.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {scenes.length === 0 && <p className="text-center text-muted-foreground py-4">This story has no scenes yet.</p>}
        </div>
        <form onSubmit={handleAddScene} className="mt-6 flex gap-2">
          <Input 
            placeholder="New scene title..." 
            value={newSceneTitle}
            onChange={(e) => setNewSceneTitle(e.target.value)}
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" /> Add Scene
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}