'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Edit, Trash2, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AssetFormDialog } from './asset-form-dialog';
import { Asset } from '@/prisma/generated/client';
import { useStoryRole } from '@/components/providers/story-role-provider';

interface AssetListProps {
  initialAssets: Asset[];
  storyId: string;
}

export function AssetList({ initialAssets, storyId }: AssetListProps) {
  const { role } = useStoryRole();
  const isViewer = role === 'VIEWER';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Asset Library</h2>
        {!isViewer && (
          <AssetFormDialog storyId={storyId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </Button>
          </AssetFormDialog>
        )}
      </div>
      {initialAssets.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">This story has no assets yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} storyId={storyId} isViewer={isViewer} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset, storyId, isViewer }: { asset: Asset, storyId: string, isViewer: boolean }) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  // NEW STATE to control the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      toast.success('Asset deleted.');
      setIsDeleteAlertOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Could not delete asset.');
      setIsDeleteAlertOpen(false);
    }
  };

  const AssetIcon = asset.type === 'IMAGE_URL' ? Image : FileText;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <AssetIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <CardTitle className="truncate">{asset.name}</CardTitle>
          </div>
          {/* Bind the dropdown's state */}
          {
            isViewer && (
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* KEY FIX: Manually control dialog and dropdown state */}
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
          {asset.type === 'IMAGE_URL' ? (
            <div className="aspect-video overflow-hidden rounded-md">
              <img src={asset.content} alt={asset.name} className="object-cover h-full w-full" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-4 h-[80px]">
              {asset.content}
            </p>
          )}
        </CardContent>
      </Card>

      {/* The dialogs are now controlled by the card's state */}
      <AssetFormDialog
        storyId={storyId}
        asset={asset}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}