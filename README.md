# RevisionAI

RevisionAI is a study companion chatbot that helps learners review material, quiz themselves, and explore topics conversationally. The assistant delivers contextual hints, suggested follow-up prompts, and reminders so students can iterate on their understanding quickly without leaving the chat window.

## Project Overview

The application provides an interactive chat experience backed by the OpenAI API. Users can start new conversations, revisit previous sessions, and request targeted study aids such as summaries, flashcards, and practice questions. Streaming completions make every response feel responsive, while local persistence ensures nothing is lost between browser sessions.

## Tech Stack

- **Next.js & React** – UI and routing layer for the single-page study experience.
- **TypeScript** – Type-safe client and server code.
- **Tailwind CSS** – Utility-first styling for rapid UI iteration.
- **OpenAI Node SDK** – Server-side access to chat completion and streaming APIs.
- **Vercel Deployment** – Optimized hosting with edge-ready API routes.

> _Note:_ If you adopt a different deployment target or UI framework, update this section to reflect the actual setup.

## Getting Started

### Prerequisites

- Node.js 18 or later
- Your preferred package manager (npm, pnpm, or yarn)
- An OpenAI API key with access to the desired models

### Installation

```bash
# clone the repository
 git clone <repository-url>
 cd RevisionAI

# install dependencies (swap for pnpm/yarn if preferred)
 npm install
```

### Environment Configuration

Copy the provided example environment file and update the values with your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your OpenAI credentials and any optional overrides. See [`.env.example`](.env.example) for the full list of variables.

The project recognizes the following variables:

- `OPENAI_API` (required): Secret key used to authenticate OpenAI requests.
- `OPENAI_MODEL` (optional): Default model identifier to request when none is supplied by the UI.
- `NEXT_PUBLIC_APP_URL` (optional): Fully qualified URL used when constructing callbacks or sharing links from the client.

## Development Commands

Common scripts exposed by the project:

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server at `http://localhost:3000`. |
| `npm run lint` | Run linting to enforce project conventions. |
| `npm run test` | Execute automated tests (unit/integration). |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build locally. |

If you prefer pnpm or yarn, substitute the package manager accordingly.

## Feature Summary

- **Conversational Study Sessions** – Multi-turn dialogue tailored to course material or user-uploaded notes.
- **Adaptive Prompt Suggestions** – Recommended follow-ups surface in the command palette as you interact with the assistant.
- **Streaming Responses** – Messages stream token-by-token so learners can start reading answers immediately.
- **Persistent History** – Conversation history and preferences are saved in `localStorage`, letting students pick up where they left off after a refresh.
- **Command Palette Productivity** – Use keyboard shortcuts to jump between actions: `Cmd/Ctrl + K` opens the palette, arrow keys navigate, and `Enter` confirms. `Shift + Enter` inserts a line break inside the composer.
- **Session Management** – Start fresh sessions, rename threads, or clear saved history when beginning a new study topic.
- **Accessibility & Responsiveness** – Keyboard-first navigation and responsive layouts support studying on laptops, tablets, or phones.

## User Experience Notes

- **Local Storage Persistence:** The app writes conversation metadata and settings to `localStorage`. Clearing your browser storage or using a private window will remove saved sessions. Provide a "Reset" or "Clear history" command when you need a clean slate.
- **Command Palette Shortcuts:** Press `Cmd/Ctrl + K` to open the palette, use `Tab` or the arrow keys to focus actions, and hit `Enter` to execute. Inside the composer, `Cmd/Ctrl + Enter` sends the message, while `Shift + Enter` inserts a newline.
- **Streaming Behaviour:** Responses stream in real time. A typing indicator and progressively rendered message show the assistant's thinking. If network connectivity drops mid-stream, the UI presents a retry option to resume from the last partial completion.

## Deployment

1. Build the app with `npm run build`.
2. Configure production environment variables on your hosting provider (e.g., Vercel, Netlify).
3. Deploy using your platform's CLI or Git-based integration.

For Vercel deployments, ensure `OPENAI_API` (and any other secrets) are added via `vercel env pull` / `vercel env add` before promoting to production.

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes, run linting/tests, and ensure the development server works locally.
3. Submit a pull request with a summary of the updates and screenshots/GIFs showcasing UI changes.

## License

This project is distributed under the MIT License. See `LICENSE` for details (add the file if it is not yet present).

