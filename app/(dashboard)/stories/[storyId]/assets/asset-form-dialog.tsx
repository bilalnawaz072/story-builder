'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Asset, AssetType } from '@/prisma/generated/client';

interface AssetFormDialogProps {
  storyId: string;
  asset?: Asset;
  children?: React.ReactNode;
  // Add props to control the dialog state from outside
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AssetFormDialog({ storyId, asset, children, open, onOpenChange }: AssetFormDialogProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>(asset?.type || 'TEXT_SNIPPET');
  
  // Reset assetType when editing a different asset
  useEffect(() => {
    if (asset?.type) {
        setAssetType(asset.type);
    }
  }, [asset]);

  // Use internal state only if not controlled from parent
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
        name: formData.get('name'),
        content: formData.get('content'),
        type: assetType,
    };
    
    const apiEndpoint = asset ? `/api/assets/${asset.id}` : `/api/stories/${storyId}/assets`;
    const method = asset ? 'PATCH' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save asset.');
      
      toast.success(`Asset ${asset ? 'updated' : 'created'}.`);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Could not save asset.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit Asset' : 'Add a New Asset'}</DialogTitle>
          <DialogDescription>
            Assets are reusable pieces of information for your story.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input id="name" name="name" defaultValue={asset?.name || ''} placeholder="e.g., Old Forest Description" required />
            </div>

            <div className="grid gap-2">
                <Label>Asset Type</Label>
                <RadioGroup defaultValue={assetType} onValueChange={(value: AssetType) => setAssetType(value)} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TEXT_SNIPPET" id="r1" />
                        <Label htmlFor="r1">Text Snippet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="IMAGE_URL" id="r2" />
                        <Label htmlFor="r2">Image URL</Label>
                    </div>
                </RadioGroup>
            </div>
          
            <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                {assetType === 'TEXT_SNIPPET' ? (
                    <Textarea id="content" name="content" defaultValue={asset?.content || ''} placeholder="A dense, ancient forest where sunlight rarely touches the ground..." rows={6} required />
                ) : (
                    <Input id="content" name="content" type="url" defaultValue={asset?.content || ''} placeholder="https://example.com/image.png" required />
                )}
            </div>
          <Button type="submit" disabled={isSaving} className="mt-2">
            {isSaving ? 'Saving...' : 'Save Asset'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}