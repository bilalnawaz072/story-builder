'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlotGeneratorProps {
    storyId: string;
}

export function PlotGenerator({ storyId }: PlotGeneratorProps) {
    const router = useRouter();
    const [premise, setPremise] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!premise.trim()) {
            toast.error('Please enter a premise for your story.');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-outline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ premise, storyId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to generate plot outline.');
            }

            toast.success('Plot outline generated successfully! Refreshing canvas...');
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create Your Story Outline</CardTitle>
                    <CardDescription>
                        Your story is a blank canvas. Provide a premise and let the AI architect an initial plot for you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Textarea
                            value={premise}
                            onChange={(e) => setPremise(e.target.value)}
                            placeholder="e.g., A detective in a cyberpunk city must solve a murder that implicates a powerful AI..."
                            rows={5}
                            disabled={isGenerating}
                        />
                        <Button type="submit" className="w-full" disabled={isGenerating}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating... This may take a moment.' : 'Generate Outline'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}