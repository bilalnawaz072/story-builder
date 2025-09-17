import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getDialoguePrompt } from '@/lib/ai/prompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { characterName, characterPersona, sceneTitle, sceneContent } = await req.json();

    // if (!characterName || !sceneTitle) {
    //   return new Response('Missing required fields', { status: 400 });
    // }

    const prompt = getDialoguePrompt(characterName, characterPersona || '', sceneTitle, sceneContent || '');

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('[GENERATE_DIALOGUE_POST]', error);
    return new Response('An error occurred while generating dialogue.', { status: 500 });
  }
}