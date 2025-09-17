# Narrative Story Engine

[](https://opensource.org/licenses/MIT)
[](https://www.google.com/search?q=https://github.com/YOUR_USERNAME/narrative-story)
[](https://nextjs.org/)
[](https://www.typescriptlang.org/)
[](http://makeapullrequest.com)

An AI-powered, collaborative platform for creating, visualizing, and sharing complex, branching narratives. The Narrative Story Engine provides a visual canvas for writers, game designers, and creators to build interactive stories, supported by a powerful AI co-writer and real-time collaboration tools.

## Table of Contents

  - [Features](https://www.google.com/search?q=%23features)
  - [Tech Stack](https://www.google.com/search?q=%23tech-stack)
  - [Prerequisites](https://www.google.com/search?q=%23prerequisites)
  - [Installation](https://www.google.com/search?q=%23installation)
  - [Configuration](https://www.google.com/search?q=%23configuration)
  - [Running the Application](https://www.google.com/search?q=%23running-the-application)
  - [Project Structure](https://www.google.com/search?q=%23project-structure)
  - [Usage](https://www.google.com/search?q=%23usage)
  - [Contributing](https://www.google.com/search?q=%23contributing)
  - [License](https://www.google.com/search?q=%23license)
  - [Contact](https://www.google.com/search?q=%23contact)

## Features

The Narrative Story Engine is built with a rich feature set designed to streamline the creative writing process from conception to publication.

### Core Narrative Canvas

  - **Visual Storyboarding:** A drag-and-drop canvas where scenes are represented as nodes.
  - **Branching Narratives:** Create complex, non-linear stories by connecting scene nodes with directed edges, representing choices.
  - **Story & Scene Management:** Easily create stories and manage their scenes (add, edit, delete) in a simple, organized list view.
  - **Scene Content Editor:** A rich text editor to write the content for each scene node.

### Content & Asset Management

  - **Character Library:** Define a cast of characters with unique names and personas, available for use throughout your story.
  - **Reusable Asset Library:** Store and manage reusable text snippets, image URLs, and other assets to maintain consistency.

### AI Co-Writer Suite

  - **AI Gateway:** A secure backend service connecting to Google's Generative AI models.
  - **AI-Powered Scene Generation:** Automatically generate descriptive text for a scene based on its title or a simple prompt.
  - **AI-Powered Character Dialogue:** Select a character from your library and generate dialogue in their unique voice and persona.
  - **AI Plot Outline Generation:** Provide a premise and let the AI generate an initial network of connected scene nodes to kickstart your story.

### Document Intelligence

  - **Document Ingestion:** Upload source material (PDF, TXT) and associate it with your story.
  - **Asynchronous Processing:** A background job system processes large documents without blocking the UI.
  - **AI-Powered Entity Extraction:** Automatically extract key characters, locations, and plot points from uploaded documents.
  - **Library Population:** Extracted entities are used to create draft entries in the Character and Asset libraries for your approval.

### Real-Time Collaboration

  - **User Authentication:** Secure user accounts with login and registration. All stories and assets are scoped to the user.
  - **Team-Based Sharing:** Invite other users to collaborate on a story with distinct roles (e.g., Editor, Viewer).
  - **Real-Time Canvas Sync:** Changes on the narrative canvas (moving nodes, creating choices) are broadcast to all collaborators in real-time using WebSockets.
  - **Collaborative Text Editing:** Multiple users can edit scene content simultaneously, with changes reflected live.

### Version Control & Analytics

  - **Story Snapshots:** A system for saving immutable versions of your entire story graph.
  - **Version History:** A UI to view, compare, and revert to previous versions of your narrative.
  - **Interactive Player:** A shareable, read-only web player that allows readers to experience the story and make choices.
  - **Reader Analytics:** Track reader choices to gather data on popular story branches, engagement, and completion rates.
  - **Analytics Dashboard:** Visualize reader behavior with charts and insights to understand how your audience interacts with your story.

## Tech Stack

This project leverages a modern, full-stack TypeScript ecosystem to deliver a robust and performant user experience.

| Category            | Technology / Library                                                                |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Framework** | [Next.js](https://nextjs.org/) 15 (with Turbopack)                                  |
| **Language** | [TypeScript](https://www.typescriptlang.org/)                                       |
| **Database & ORM** | [MongoDB](https://www.mongodb.com/) with [Prisma](https://www.prisma.io/)             |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (v5)                                       |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/) with [Google AI](https://ai.google/)          |
| **Real-Time** | [Pusher](https://pusher.com/)                                                       |
| **Background Jobs** | [Inngest](https://www.inngest.com/)                                                 |
| **File Storage** | [Vercel Blob](https://vercel.com/storage/blob)                                      |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/) (implied) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4                                         |
| **State/Hooks** | `usehooks-ts`, `use-debounce`                                                       |
| **Visual Canvas** | [React Flow](https://reactflow.dev/)                                                |
| **Analytics Chart** | [Recharts](https://recharts.org/)                                                   |
| **Linting** | [ESLint](https://eslint.org/)                                                       |

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

  - [Node.js](https://nodejs.org/) (v20.x or higher)
  - [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
  - [Git](https://git-scm.com/)
  - A [MongoDB](https://www.mongodb.com/try/download/community) database instance (local or cloud-hosted, e.g., MongoDB Atlas).
  - A [Pusher](https://pusher.com/) account for real-time features.
  - A [Google AI API Key](https://ai.google.dev/) for AI features.

## Installation

Follow these steps to get the project running locally:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YOUR_USERNAME/narrative-story.git
    cd narrative-story
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    *or `yarn install` or `pnpm install`*

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

    Now, open `.env.local` and fill in the required values. See the [Configuration](https://www.google.com/search?q=%23configuration) section below for details.

4.  **Set up the database:**
    Push the Prisma schema to your MongoDB database. This will create the necessary collections and indexes.

    ```bash
    npx prisma db push
    ```

5.  **Generate Prisma Client:**
    Ensure the Prisma Client is up-to-date with your schema.

    ```bash
    npx prisma generate
    ```

## Configuration

Your `.env.local` file is crucial for connecting to external services.

```ini
# .env.local

# Prisma / MongoDB
# Your MongoDB connection string
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/your-db?retryWrites=true&w=majority"

# NextAuth.js
# A secret for signing tokens. Generate one here: https://generate-secret.vercel.app/32
AUTH_SECRET="your_auth_secret_here"
AUTH_URL="http://localhost:3000"

# Google AI
# Your API key from Google AI Studio
GOOGLE_API_KEY="your_google_ai_api_key"

# Pusher (for real-time collaboration)
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"
# The client key needs to be public
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"

# Vercel Blob (for file uploads)
# Create a token from your Vercel project dashboard
BLOB_READ_WRITE_TOKEN="your_vercel_blob_rw_token"

# Inngest (for background jobs)
# Get keys from your Inngest account
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"
```

## Running the Application

Use the following scripts to run the application:

  - **Development Mode:** Starts the development server with hot-reloading and Turbopack.

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

  - **Production Build:** Creates an optimized production build.

    ```bash
    npm run build
    ```

  - **Start Production Server:** Runs the application from the build output.

    ```bash
    npm run start
    ```

## Project Structure

The project follows a standard Next.js `app` directory structure.

```
narrative-story/
├── app/                      # Main application routes and logic
│   ├── (auth)/               # Auth routes (login, register)
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── stories/
│   ├── api/                  # API routes (auth, webhooks)
│   └── layout.tsx            # Root layout
├── components/               # Reusable UI components
│   ├── auth/
│   ├── canvas/
│   └── ui/                   # Shadcn/ui components
├── lib/                      # Helper functions, utilities, configs
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client instance
│   └── pusher.ts             # Pusher client/server instances
├── prisma/                   # Prisma schema and migrations
│   └── schema.prisma
├── public/                   # Static assets
├── .env.local                # Local environment variables (GitIgnored)
├── next.config.mjs           # Next.js configuration
└── package.json              # Project dependencies and scripts
```

## Usage

1.  **Register & Login:** Create an account to get started.
2.  **Create a Story:** From your dashboard, create a new story. Give it a title and a premise.
3.  **Generate an Outline:** Use the "AI Plot Outline" feature to generate a starting set of scene nodes on the canvas.
4.  **Build Your Narrative:**
      - Drag and drop nodes to organize your plot.
      - Click a node to open the editor and write its content. Use the AI to help generate text or dialogue.
      - Connect nodes by dragging from the handles to create choices and branches.
5.  **Collaborate:** Invite team members to your story to write and build together in real-time.
6.  **Preview & Share:** Use the interactive player to experience your story from a reader's perspective and share the link with others.
7.  **Analyze:** Check the analytics dashboard to see how readers are engaging with your narrative.



## License

This project is distributed under the MIT License. See `LICENSE.md` for more information.

