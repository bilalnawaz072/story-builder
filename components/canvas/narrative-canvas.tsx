'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  addEdge,
  OnEdgesDelete,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'sonner';
import SceneNode from './scene-node';
import { Character, Choice, Scene } from '@/prisma/generated/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PlotGenerator } from './plot-generator';
import { useStoryRole } from '../providers/story-role-provider';
import Pusher from 'pusher-js'; // Import Pusher client

interface NarrativeCanvasProps {
  storyId: string;
  scenes: Scene[];
  choices: Choice[];
  characters: Character[];
}

const nodeTypes = { scene: SceneNode };

export function NarrativeCanvas({ storyId, scenes: initialScenes, choices: initialChoices, characters }: NarrativeCanvasProps) {
  const router = useRouter();
  const { role } = useStoryRole();
  const isViewer = role === 'VIEWER';

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newChoiceConnection, setNewChoiceConnection] = useState<Connection | null>(null);
  const { setViewport } = useReactFlow(); // Hook to control the canvas view
  const [pusherClient, setPusherClient] = useState<Pusher | null>(null);

  // Effect for initializing and cleaning up Pusher connection
  useEffect(() => {
    // Initialize Pusher
    const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth', // Use our auth endpoint
    });
    setPusherClient(client);

    // Subscribe to the story's private presence channel
    const channelName = `presence-story-${storyId}`;
    const channel = client.subscribe(channelName);

    // Bind to events
    channel.bind('node-move', (data: { id: string, position: { x: number, y: number } }) => {
      setNodes((nds) => nds.map(node => {
        if (node.id === data.id) {
          return { ...node, position: data.position };
        }
        return node;
      }));
    });

    // We will bind to 'node-add', 'edge-add', etc. in the future.

    // Clean up on unmount
    return () => {
      client.unsubscribe(channelName);
      client.disconnect();
      setPusherClient(null);
    };
  }, [storyId, setNodes, setViewport]);

  useEffect(() => {
    const newNodes: Node[] = initialScenes.map((scene) => ({
      id: scene.id,
      type: 'scene',
      position: { x: scene.positionX, y: scene.positionY },
      data: { label: scene.title, scene: scene, characters: characters },
    }));

    const newEdges: Edge[] = initialChoices.map((choice) => ({
      id: choice.id,
      source: choice.sourceSceneId,
      target: choice.targetSceneId,
      label: choice.text,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialScenes, initialChoices, setNodes, setEdges, characters]);

  const onConnect = useCallback((params: Connection) => {
    setNewChoiceConnection(params);
  }, []);

  const handleCreateChoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newChoiceConnection) return;

    const formData = new FormData(e.currentTarget);
    const choiceText = formData.get('choiceText') as string;

    if (!choiceText || choiceText.trim() === '') {
      toast.error('Choice text cannot be empty.');
      return;
    }

    try {
      const response = await fetch('/api/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: choiceText,
          sourceSceneId: newChoiceConnection.source,
          targetSceneId: newChoiceConnection.target,
        }),
      });

      if (!response.ok) throw new Error('Failed to create choice.');

      toast.success('Choice created!');
      setNewChoiceConnection(null);
      // This refresh will now correctly trigger the useEffect hook above
      router.refresh();
    } catch (error) {
      toast.error('Could not create choice.');
    }
  }

  const onEdgesDelete: OnEdgesDelete = useCallback(async (edgesToDelete) => {
    try {
      await Promise.all(edgesToDelete.map(edge =>
        fetch(`/api/choices/${edge.id}`, { method: 'DELETE' })
      ));

      toast.success('Choice(s) deleted.');
      // This refresh will now correctly trigger the useEffect hook above
      router.refresh();

    } catch (error) {
      toast.error('An error occurred while deleting choices.');
    }
  }, [router]);

  const onNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
    try {
      const response = await fetch(`/api/scenes/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionX: node.position.x,
          positionY: node.position.y,
        }),
      });
      if (!response.ok) throw new Error('Failed to save node position');
    } catch (error) {
      console.error(error);
      toast.error('Could not save node position.');
    }
  }, []);

  
  const broadcastEvent = useCallback((event: string, data: any) => {
    if (!pusherClient) return;
    fetch('/api/realtime/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `presence-story-${storyId}`,
        event,
        data,
        socketId: pusherClient.connection.socket_id,
      })
    });
  }, [pusherClient, storyId]);

  const onNodeDrag = useCallback(async (event: React.MouseEvent, node: Node) => {
    broadcastEvent('node-move', { id: node.id, position: node.position });
  }, [broadcastEvent]);





  // KEY CHANGE: Conditional Rendering
  if (initialScenes.length === 0) {
    return <PlotGenerator storyId={storyId} />;
  }




  return (
    <div style={{ height: 'calc(100vh - 200px)' }} className="border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        nodesDraggable={!isViewer}
        nodesConnectable={!isViewer}
        edgesFocusable={!isViewer}
        panOnDrag={!isViewer} // Optionally lock panning too
        nodeTypes={nodeTypes}
        fitView
        onNodeDrag={onNodeDrag}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>

      {/* Dialog for creating a new choice */}
      <Dialog open={!!newChoiceConnection} onOpenChange={(isOpen) => !isOpen && setNewChoiceConnection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Choice</DialogTitle>
            <DialogDescription>
              Enter the text that the player will see for this choice. This will appear as a label on the connection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateChoice}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="choiceText">Choice Text</Label>
                <Input id="choiceText" name="choiceText" autoFocus />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={() => setNewChoiceConnection(null)}>Cancel</Button>
              <Button type="submit">Create Choice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}