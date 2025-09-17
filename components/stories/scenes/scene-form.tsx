'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MessageSquarePlus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Character, Scene } from '@/prisma/generated/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pusher from 'pusher-js';
import { useDebouncedCallback } from 'use-debounce';

interface SceneFormProps {
  storyId: string;
  scene?: Scene | null;
  characters?: Character[];
  onSuccess?: () => void;
}

export function SceneForm({ storyId, scene, characters = [], onSuccess }: SceneFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(scene?.title || '');
  const [content, setContent] = useState(scene?.content || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced function to broadcast content changes to other users
  const broadcastContent = useDebouncedCallback((newContent: string, socketId: string) => {
    fetch('/api/realtime/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channel: `presence-story-${storyId}-scene-${scene?.id}`,
            event: 'text-update',
            data: { content: newContent },
            socketId: socketId,
        })
    });
  }, 500); // Broadcast changes every 500ms while typing

  // Effect to set up and tear down the Pusher connection
  useEffect(() => {
    if (!scene?.id) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: '/api/pusher/auth',
    });

    const channelName = `presence-story-${storyId}-scene-${scene.id}`;
    const channel = pusherClient.subscribe(channelName);

    // Listen for incoming text updates from other users
    channel.bind('text-update', (data: { content: string }) => {
        // Preserve cursor position while updating content
        const el = textareaRef.current;
        if (el) {
            const selectionStart = el.selectionStart;
            const selectionEnd = el.selectionEnd;
            setContent(data.content);
            // Restore cursor position after update
            el.setSelectionRange(selectionStart, selectionEnd);
        } else {
            setContent(data.content);
        }
    });

    return () => {
        pusherClient.unsubscribe(channelName);
        pusherClient.disconnect();
    };
  }, [storyId, scene?.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const pusherSocketId = (window as any).pusher?.connection.socket_id;
    if (pusherSocketId) {
        broadcastContent(e.target.value, pusherSocketId);
    }
  };


  const handleGenerateDescription = async () => {
    if (!title) {
        toast.error('Please provide a title to generate a description.');
        return;
    }

    setIsAiLoading(true);
    setContent(''); // Clear previous content

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

       // KEY FIX: Improved error handling
       if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to start generation stream.');
      }

      if (!response.body) {
        throw new Error('The response body is empty.');
      }

      // Manually read the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        setContent((prevContent) => prevContent + chunk);
      }

    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description.');
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleGenerateDialogue = async () => {
    if (!selectedCharacterId) {
        toast.error('Please select a character to generate dialogue.');
        return;
    }
    const character = characters.find(c => c.id === selectedCharacterId);
    // KEY FIX: Add more robust checks to prevent errors
    if (!character || !character.name || !title) {
      toast.error('A character and scene title are required to generate dialogue.');
      console.error("Missing data for dialogue generation:", { character, title });
      return;
  }

    setIsAiLoading(true);

    try {
        const response = await fetch('/api/ai/generate-dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                characterName: character.name,
                characterPersona: character.persona || 'A character in the story.', // Ensure persona is never null
                sceneTitle: title,
                sceneContent: content || '', // Ensure content is never null
              }),
        });

         // KEY FIX: Improved error handling
         if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to start dialogue stream.');
      }

        if (!response.body) throw new Error('Response body is empty.');

        // Prepend dialogue with character name and formatting
        const formattedPreamble = `\n\n${character.name.toUpperCase()}:\n"`;
        setContent(prev => prev + formattedPreamble);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            setContent(prev => prev + chunk);
        }
        setContent(prev => prev + '"'); // Add closing quote

    } catch (error) {
        console.error('Error generating dialogue:', error);
        toast.error('Failed to generate dialogue.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const apiEndpoint = scene 
      ? `/api/scenes/${scene.id}` 
      : `/api/stories/${storyId}/scenes`;
    
    const method = scene ? 'PATCH' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) throw new Error('Failed to save the scene.');
      
      toast.success(`Scene ${scene ? 'updated' : 'created'} successfully!`);
      router.refresh();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the scene.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input 
            id="title" 
            name="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
        />
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="content">Content</Label>
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateDescription}
                disabled={isAiLoading}
            >
                <Sparkles className="mr-2 h-4 w-4" />
                {isAiLoading ? 'Generating...' : 'Generate with AI'}
            </Button>
        </div>
        <Textarea
          ref={textareaRef}
          id="content"
          name="content"
          placeholder="Start writing your scene... Collaborators will see your changes in real-time."
          value={content}
          onChange={handleContentChange}
          rows={10}
        />
      </div>

      {/* NEW UI for Dialogue Generation */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Select onValueChange={setSelectedCharacterId} value={selectedCharacterId}>
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Select a character..." />
          </SelectTrigger>
          <SelectContent>
            {characters.map(character => (
                <SelectItem key={character.id} value={character.id}>
                    {character.name}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
            type="button"
            variant="outline"
            onClick={handleGenerateDialogue}
            disabled={isAiLoading || !selectedCharacterId}
            className="col-span-1"
        >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            {isAiLoading ? 'Writing...' : 'Dialogue'}
        </Button>
      </div>

      <Button type="submit" disabled={isSaving || isAiLoading} className="mt-4">
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}