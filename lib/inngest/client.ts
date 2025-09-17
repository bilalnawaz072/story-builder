import { Inngest } from 'inngest';

// Define the custom event we'll be using
type Events = {
  'document/uploaded': {
    data: {
      documentId: string;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({ id: 'narrative-engine' });