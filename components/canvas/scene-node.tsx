'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Handle, Position, NodeProps } from 'reactflow';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Character, Scene } from '@/prisma/generated/client';
import { SceneForm } from '../stories/scenes/scene-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStoryRole } from '../providers/story-role-provider';

// The data prop will now contain the full scene object
type SceneNodeData = {
  label: string;
  scene: Scene;
  characters: Character[];
};

const SceneNode = memo(({ data, id: sceneId }: NodeProps<SceneNodeData>) => {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { role } = useStoryRole();
  const isViewer = role === 'VIEWER';


  const handleDelete = async () => {

    try {
      const response = await fetch(`/api/scenes/${sceneId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete scene');

      toast.success('Scene deleted.');
      router.refresh(); // Reload canvas from server
      setIsDeleteAlertOpen(false); // KEY FIX
    } catch (error) {
      toast.error('Could not delete scene.');
      setIsDeleteAlertOpen(false); // KEY FIX
    }
  };

  return (
    <>
      <Card className="w-64 shadow-md border-2 border-transparent hover:border-primary transition-colors">
        <Handle type="target" position={Position.Left} className="!bg-teal-500" />
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle className="text-base font-semibold">{data.label}</CardTitle>
          {
            isViewer && (
              <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setIsEditDialogOpen(true); setIsDropdownOpen(false) }}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => { setIsDeleteAlertOpen(true); setIsDropdownOpen(false) }} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        </CardHeader>
        {/* ADDED THIS SECTION to display content */}
        {data.scene.content && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {data.scene.content}
            </p>
          </CardContent>
        )}
        <Handle type="source" position={Position.Right} className="!bg-teal-500" />
      </Card>

      {/* Edit Scene Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scene</DialogTitle>
          </DialogHeader>
          <SceneForm
            storyId={data.scene.storyId}
            scene={data.scene}
            characters={data.characters}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scene and any choices connected to it.
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
});

SceneNode.displayName = 'SceneNode';
export default SceneNode;