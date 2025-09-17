import { inngest } from './client';
import { del } from '@vercel/blob';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getEntityExtractionPrompt } from '@/lib/ai/prompts';
import { prisma } from '../prisma';

export const processDocument = inngest.createFunction(
  // KEY FIX: Changed 'timeout' to 'timeouts'
  { id: 'process-document-content', timeouts: {
    start:"7s"
  } },
  { event: 'document/uploaded' },
  async ({ event }) => {
    const { documentId } = event.data;

    // 1. Mark document as PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
        throw new Error(`Document with ID ${documentId} not found.`);
    }

    try {
        console.log(`Processing document: ${document.name}`);
        
        // 2. Fetch the document content from Vercel Blob
        const response = await fetch(document.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch document from ${document.url}`);
        }
        const content = await response.text();
        
        // 3. Call the AI to extract entities
        const prompt = getEntityExtractionPrompt(content);
        const { text: aiResponse } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: prompt,
        });

        // 4. Parse the AI's JSON response
        const jsonBlock = aiResponse.match(/```json\n([\s\S]*?)\n```/)?.[1] || aiResponse;
        JSON.parse(jsonBlock);

        // 5. Mark document as COMPLETED and save the extracted data
        await prisma.document.update({
            where: { id: documentId },
            data: { 
                status: 'COMPLETED',
                extractedData: jsonBlock,
            },
        });

        return { success: true, message: `Document ${documentId} processed and entities extracted.` };

    } catch (error) {
        console.error('Failed to process document:', error);
        
        // 6. If anything goes wrong, mark as FAILED
        await prisma.document.update({
            where: { id: documentId },
            data: { status: 'FAILED' },
        });
        
        throw error;
    }
  }
);