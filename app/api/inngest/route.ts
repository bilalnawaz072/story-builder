import { inngest } from '@/lib/inngest/client';
import { processDocument } from '@/lib/inngest/functions';
import { serve } from 'inngest/next';


// Create an API that serves all of our Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocument, // We will create this function next
  ],
});