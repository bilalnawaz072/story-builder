/**
 * Creates a structured prompt for generating a scene description.
 * @param title The title of the scene.
 * @returns A formatted string to be used as a prompt for the AI model.
 */
export const getSceneDescriptionPrompt = (title: string): string => {
    return `You are a master storyteller and world-builder. Your task is to write a short, evocative, and descriptive passage for a scene in a story.
  
    The scene is titled: "${title}"
  
    Write a single, compelling paragraph that sets the scene, establishing the atmosphere, environment, and mood. Be creative, engaging, and use rich sensory details. Do not include the title in your response.`;
  };
  
/**
 * NEW: Creates a prompt for generating character dialogue.
 * @param characterName The name of the character speaking.
 * @param characterPersona A description of the character's personality and voice.
 * @param sceneTitle The title of the current scene for context.
 * @param sceneContent The existing content of the scene for context.
 * @returns A formatted string prompt for the AI.
 */
export const getDialoguePrompt = (
    characterName: string, 
    characterPersona: string, 
    sceneTitle: string,
    sceneContent: string
): string => {
  // KEY FIX: Provide a default if persona is missing.
  const persona = characterPersona || 'A character in the story.';

  return `You are an expert dialogue writer. Your task is to write a short, in-character line of dialogue.

  **Character Details:**
  - Name: ${characterName}
  - Persona: ${persona}

  **Scene Context:**
  - Scene Title: ${sceneTitle}
  - Existing Scene Content: """
    ${sceneContent || 'The scene is just beginning.'}
    """

  Based on the character's persona and the scene context, write a single, impactful line of dialogue for ${characterName}.

  **Rules:**
  - Only write the line of dialogue itself.
  - Do not include quotation marks.
  - Do not include the character's name or any stage directions (e.g., "he said angrily").
  - The dialogue should be no more than two sentences.`;
};


/**
 * NEW: Creates a prompt for generating a full plot outline.
 * @param premise The user's initial story idea.
 * @returns A formatted string prompt for the AI.
 */
export const getPlotOutlinePrompt = (premise: string): string => {
    return `You are a professional narrative designer and plot architect for interactive stories. Your task is to take a user's story premise and generate a simple, branching plot outline.
  
    **User's Premise:**
    """
    ${premise}
    """
  
    **Your Task:**
    1.  Create a short story outline with 4 to 6 scenes.
    2.  The outline must have at least one branching point where a choice leads to different scenes.
    3.  Arrange the scenes logically on a 2D canvas in your mind. The story should generally flow from left to right.
    4.  Provide the output as a single, valid JSON object and nothing else. Do not include any explanatory text before or after the JSON block.
  
    **JSON Structure Specification:**
    The JSON object must have two top-level keys: "scenes" and "choices".
  
    1.  \`scenes\`: An array of scene objects. Each scene object must have:
        - \`id\`: A unique, temporary string ID (e.g., "scene-1", "scene-2").
        - \`title\`: A short, compelling title for the scene.
        - \`position\`: An object with \`x\` and \`y\` coordinates for placing it on a canvas.
  
    2.  \`choices\`: An array of choice objects. Each choice object must have:
        - \`sourceId\`: The temporary ID of the scene where the choice is made.
        - \`targetId\`: The temporary ID of the scene the choice leads to.
        - \`text\`: The text describing the choice.
  
    **Example JSON Output:**
    \`\`\`json
    {
      "scenes": [
        { "id": "scene-1", "title": "The Inciting Incident", "position": { "x": 0, "y": 200 } },
        { "id": "scene-2", "title": "The Investigation", "position": { "x": 300, "y": 200 } },
        { "id": "scene-3", "title": "A Dangerous Lead", "position": { "x": 600, "y": 100 } },
        { "id": "scene-4", "title": "A Safe Bet", "position": { "x": 600, "y": 300 } }
      ],
      "choices": [
        { "sourceId": "scene-1", "targetId": "scene-2", "text": "Follow the first clue." },
        { "sourceId": "scene-2", "targetId": "scene-3", "text": "Confront the suspect." },
        { "sourceId": "scene-2", "targetId": "scene-4", "text": "Report to the captain." }
      ]
    }
    \`\`\`
    `;
  };


/**
 * NEW: Creates a prompt for extracting entities from a document.
 * @param documentContent The full text content of the document.
 * @returns A formatted string prompt for the AI.
 */
export const getEntityExtractionPrompt = (documentContent: string): string => {
  // We'll truncate the content to avoid exceeding token limits for this example.
  // In a production app, you might use a more advanced model or chunking strategy.
  const contentSnippet = documentContent.substring(0, 8000);

  return `You are a literary analyst AI. Your task is to read the following document content and extract key entities.

  **Document Content:**
  """
  ${contentSnippet}
  """

  **Your Task:**
  Based on the document content, extract the following entities:
  1.  **Characters:** Identify up to 5 key individuals mentioned by name. For each, provide a brief, one-sentence description based on their context in the document.
  2.  **Locations:** Identify up to 5 significant locations mentioned. For each, provide a brief, one-sentence description.
  3.  **Plot Points:** Identify up to 5 major events or key plot developments. For each, provide a one-sentence summary.

  **Output Format:**
  You MUST return your response as a single, valid JSON object. Do not include any text or formatting before or after the JSON block. The JSON object must have three top-level keys: "characters", "locations", and "plotPoints".

  **Example JSON Output:**
  \`\`\`json
  {
    "characters": [
      { "name": "John Smith", "description": "A retired police detective mentioned on page 5." }
    ],
    "locations": [
      { "name": "The Old Warehouse", "description": "The site of the initial discovery." }
    ],
    "plotPoints": [
      { "summary": "A mysterious package is delivered.", "description": "This event kicks off the main conflict." }
    ]
  }
  \`\`\`
  `;
};