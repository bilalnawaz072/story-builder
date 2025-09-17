import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getPlotOutlinePrompt } from '@/lib/ai/prompts';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60; // Extend the timeout for this complex generation

interface SceneData {
    id: string;
    title: string;
    position: { x: number; y: number };
}
interface ChoiceData {
    sourceId: string;
    targetId: string;
    text: string;
}
interface PlotOutline {
    scenes: SceneData[];
    choices: ChoiceData[];
}

export async function POST(req: Request) {
    try {
        const { premise, storyId } = await req.json();

        if (!premise || !storyId) {
            return new NextResponse('Premise and Story ID are required', { status: 400 });
        }

        const prompt = getPlotOutlinePrompt(premise);

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: prompt,
        });
        
        // Find the JSON block in the response
        const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
        const outline: PlotOutline = JSON.parse(jsonBlock);

        // --- Manual Validation (since we are not using Zod) ---
        if (!outline.scenes || !Array.isArray(outline.scenes) || !outline.choices || !Array.isArray(outline.choices)) {
            throw new Error("Invalid JSON structure from AI response.");
        }

        // --- Database Transaction ---
        const idMap = new Map<string, string>(); // Maps temporary AI IDs to new database IDs

        await prisma.$transaction(async (tx) => {
            // 1. Create all scenes
            for (const sceneData of outline.scenes) {
                const newScene = await tx.scene.create({
                    data: {
                        title: sceneData.title,
                        positionX: sceneData.position.x,
                        positionY: sceneData.position.y,
                        storyId: storyId,
                    }
                });
                idMap.set(sceneData.id, newScene.id);
            }

            // 2. Create all choices using the mapped IDs
            const choicesToCreate = outline.choices.map(choiceData => {
                const sourceDbId = idMap.get(choiceData.sourceId);
                const targetDbId = idMap.get(choiceData.targetId);

                if (!sourceDbId || !targetDbId) {
                    throw new Error(`Invalid source or target ID in choice: ${choiceData.text}`);
                }
                return {
                    text: choiceData.text,
                    sourceSceneId: sourceDbId,
                    targetSceneId: targetDbId,
                };
            });
            
            if (choicesToCreate.length > 0) {
                await tx.choice.createMany({
                    data: choicesToCreate
                });
            }
        }, {
            // Give the transaction up to 20 seconds to complete
            timeout: 20000, 
        });

        return new NextResponse('Plot outline generated successfully', { status: 201 });

    } catch (error: any) {
        console.error("[GENERATE_OUTLINE_POST]", error);
        return new NextResponse(`Error generating outline: ${error.message}`, { status: 500 });
    }
}