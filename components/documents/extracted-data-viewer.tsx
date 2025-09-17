'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ExtractedDataViewerProps {
  storyId: string;
  extractedData: string | null;
}

interface ExtractedEntities {
  characters: Array<{ name: string; description: string; }>;
  locations: Array<{ name: string; description: string; }>;
  plotPoints: Array<{ summary: string; description: string; }>;
}

export function ExtractedDataViewer({ storyId, extractedData }: ExtractedDataViewerProps) {
  const router = useRouter();
  const [data, setData] = useState<ExtractedEntities | null>(null);
  // Track which items have been successfully added to prevent duplicate clicks
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (extractedData) {
      try {
        const parsedData = JSON.parse(extractedData);
        setData(parsedData);
      } catch (error) {
        console.error("Failed to parse extracted data:", error);
        toast.error("Could not read AI suggestions from this document.");
      }
    }
  }, [extractedData]);

  const handleAddItem = async (item: { name?: string; summary?: string }, type: 'character' | 'asset') => {
    const itemName = item.name || item.summary;
    if (!itemName) return;

    // Create a unique key for the item to track its "added" state
    const itemKey = `${type}-${itemName}`;
    if (addedItems.has(itemKey)) return;

    let apiEndpoint = '';
    let payload = {};

    if (type === 'character') {
      apiEndpoint = `/api/stories/${storyId}/characters`;
      payload = { name: item.name, persona: (item as any).description };
    } else {
      apiEndpoint = `/api/stories/${storyId}/assets`;
      payload = { 
        name: itemName, 
        content: (item as any).description,
        type: 'TEXT_SNIPPET' // Locations and Plot Points become text assets
      };
    }
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Failed to add ${type}.`);
      
      toast.success(`"${itemName}" has been added to your library.`);
      setAddedItems(prev => new Set(prev).add(itemKey));
      router.refresh(); // Refreshes server components, useful if other parts of the app show counts, etc.

    } catch (error) {
      console.error(error);
      toast.error(`Could not add "${itemName}" to your library.`);
    }
  };

  if (!data) {
    return <p className="text-sm text-muted-foreground p-4">No suggestions available for this document.</p>;
  }

  return (
    <div className="space-y-6 p-4 bg-secondary/50 rounded-lg">
      {data.characters?.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Suggested Characters</h4>
          <div className="space-y-2">
            {data.characters.map((char, index) => (
              <SuggestedItem key={`char-${index}`} item={char} type="character" onAdd={handleAddItem} addedItems={addedItems} />
            ))}
          </div>
        </div>
      )}
      {data.locations?.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Suggested Locations (as Assets)</h4>
          <div className="space-y-2">
            {data.locations.map((loc, index) => (
              <SuggestedItem key={`loc-${index}`} item={loc} type="asset" onAdd={handleAddItem} addedItems={addedItems} />
            ))}
          </div>
        </div>
      )}
      {data.plotPoints?.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Suggested Plot Points (as Assets)</h4>
          <div className="space-y-2">
            {data.plotPoints.map((pp, index) => (
              <SuggestedItem key={`pp-${index}`} item={pp} type="asset" onAdd={handleAddItem} addedItems={addedItems} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// A helper sub-component for displaying each suggestion
function SuggestedItem({ item, type, onAdd, addedItems }: { item: any; type: 'character' | 'asset'; onAdd: Function; addedItems: Set<string> }) {
    const itemName = item.name || item.summary;
    const itemKey = `${type}-${itemName}`;
    const isAdded = addedItems.has(itemKey);

    return (
        <Card className="flex items-center justify-between p-3">
            <div>
                <p className="font-semibold">{itemName}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onAdd(item, type)} disabled={isAdded}>
                {isAdded ? (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Added
                    </>
                ) : (
                    <>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add to Library
                    </>
                )}
            </Button>
        </Card>
    )
}