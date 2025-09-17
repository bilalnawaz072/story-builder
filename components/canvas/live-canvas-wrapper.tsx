'use client';

import { ReactNode } from 'react';
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react';
import { Loader2 } from 'lucide-react';

export function LiveCanvasWrapper({ storyId, children }: { storyId: string; children: ReactNode }) {
  return (
    <RoomProvider 
        id={storyId} 
        initialPresence={{ cursor: null }}
    >
      <ClientSideSuspense fallback={
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}