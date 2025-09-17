import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getDialoguePrompt } from '@/lib/ai/prompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { characterName, characterPersona, sceneTitle, sceneContent } = await req.json();

    if (!characterName || !sceneTitle) {
      return new Response('Missing required fields: characterName and sceneTitle are required.', { status: 400 });
    }

    const prompt = getDialoguePrompt(characterName, characterPersona || '', sceneTitle, sceneContent || '');

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
      
      // KEY FIX: Add the missing providerOptions configuration.
      providerOptions: {
        google: {
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
      },
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('[GENERATE_DIALOGUE_POST]', error);
    return new Response('An error occurred while generating dialogue.', { status: 500 });
  }
}