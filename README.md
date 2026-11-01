# jarvis_abhesh

`jarvis_abhesh` is a responsive, full-stack AI chat application powered by
Google Gemini. It provides a polished conversational interface for coding,
technical architecture, learning, writing, and general-purpose questions.

The application combines a React and TypeScript frontend with an Express
backend. Gemini requests are handled server-side so the API key is never
exposed to the browser.

## Features

- Multi-turn conversations with local browser persistence
- Gemini-powered responses using `gemini-3.5-flash-lite`
- Server-Sent Events (SSE) response delivery
- Configurable assistant persona and system instructions
- Conversation creation, renaming, deletion, and switching
- Regenerate the latest assistant response
- Markdown and GitHub Flavored Markdown rendering
- Syntax-highlighted code blocks with copy support
- Suggested follow-up prompts
- Export conversations as Markdown or JSON
- Light and dark themes
- Responsive desktop and mobile layouts
- Health endpoint for checking server and API-key configuration
- Request timeout and user-facing Gemini error handling

## Technology stack

- React 19
- TypeScript
- Vite
- Express
- Google Gemini SDK (`@google/genai`)
- Tailwind CSS
- Motion
- Lucide React
- React Markdown and Remark GFM

## Project structure

```text
.
├── server.ts                 # Express server and Gemini API routes
├── index.html                # Browser entry document
├── vite.config.ts            # Vite and Tailwind configuration
├── src/
│   ├── App.tsx               # Main application state and chat workflow
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles and theme variables
│   ├── components/           # Chat UI components
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Constants, persistence, and helpers
├── metadata.json             # Application metadata
└── .env.example              # Environment variable template
```

## Requirements

- Node.js 20 or newer
- npm
- A Google Gemini API key

## Getting started

Install dependencies:

```bash
npm install
```

If npm reports a peer-dependency conflict in the current dependency tree, use:

```bash
npm install --legacy-peer-deps
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the Gemini API key in `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The default model is configured in `server.ts` as:

```env
GEMINI_MODEL=gemini-3.5-flash-lite
```

`GEMINI_MODEL` is optional. Do not commit `.env` or share API keys in source
control, screenshots, logs, or chat messages. If a key has been exposed,
revoke it and create a replacement in Google AI Studio.

## Run locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The development server runs Express and Vite together. Vite serves the React
application, while Express handles `/api` requests.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Vite middleware |
| `npm run build` | Create a production frontend build in `dist/` |
| `npm run start` | Start the Express server |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm run clean` | Remove generated build artifacts |

## API endpoints

### `GET /api/health`

Returns server status, whether a Gemini API key is configured, and the active
model.

Example:

```bash
curl http://localhost:3000/api/health
```

### `POST /api/chat/stream`

Generates an assistant response from a conversation history. The response is
delivered as SSE events:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain server-sent events."
    }
  ],
  "systemInstruction": "Answer clearly and concisely."
}
```

Events contain either a response chunk, a completion marker, or an error:

```text
data: {"chunk":"..."}

data: {"done":true}
```

### `POST /api/chat/title`

Creates a short conversation title from a user message and assistant
response. If Gemini is unavailable, the server returns a local fallback title.

### `POST /api/chat/suggestions`

Generates three short follow-up suggestions. A static set of suggestions is
returned when Gemini is unavailable.

## Error handling

The server validates request payloads before calling Gemini and reports
configuration, authentication, rate-limit, unavailable-model, and timeout
errors to the client. Gemini requests use a bounded timeout so the interface
does not remain indefinitely in a loading state.

The frontend displays assistant errors in the conversation and allows the user
to retry or regenerate a response.

## Deployment

The app requires a server runtime because Gemini calls are made by Express.
For a hosting provider such as Vercel, Render, Railway, or a similar
platform:

1. Build the project with `npm run build`.
2. Configure `GEMINI_API_KEY` as a platform environment secret.
3. Configure `GEMINI_MODEL` only if a different supported model is required.
4. Ensure the deployment starts `server.ts` with the project start command.
5. Never commit `.env`, API keys, or generated secrets.

For production deployments, use HTTPS and configure the platform's domain and
environment variables before sending real user traffic.

## Security notes

- Keep Gemini credentials on the server.
- Keep `.env` files out of version control.
- Rotate any key that has been exposed.
- Do not log request credentials or full sensitive conversations.
- Restrict and monitor API usage in Google AI Studio.

## License

No license has been specified for this project yet.
