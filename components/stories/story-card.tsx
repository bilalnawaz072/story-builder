'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { StoryForm } from './story-form';
import { Story } from '@/prisma/generated/client';

export function StoryCard({ story }: { story: Story }) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/stories/${story.id}`, { method: 'DELETE' });
      toast.success('Story deleted.');
      router.refresh();
      setIsDeleteAlertOpen(false);
    } catch (error) {
      toast.error('Could not delete story.');
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col">
          <div className="flex-grow">
              <Link href={`/stories/${story.id}`} className="block h-full hover:bg-accent transition-colors rounded-t-lg">
                  <CardHeader>
                      <CardTitle>{story.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                      {story.description || 'No description provided.'}
                      </CardDescription>
                  </CardHeader>
              </Link>
          </div>
          <div className="border-t px-4 py-2 flex justify-end">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setIsEditDialogOpen(true); setIsDropdownOpen(false); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setIsDeleteAlertOpen(true); setIsDropdownOpen(false); }} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Story</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Story Details</DialogTitle>
            </DialogHeader>
            <StoryForm story={story} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the story and all its scenes. This action cannot be undone.
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