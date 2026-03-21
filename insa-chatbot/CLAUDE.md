# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16+ web application with a chatbot interface for TC Exchange, a student exchange program at INSA. The chatbot helps users find information about exchange destinations, partner universities, and application procedures.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Architecture

### Framework & Stack
- **Next.js 16+** with App Router (not Pages Router)
- **React 19** with TypeScript 5
- **Tailwind CSS v4** with PostCSS
- **ESLint 9** using flat config format (`eslint.config.mjs`)

### Project Structure

```
app/                    # Next.js App Router
├── page.tsx           # Home page with Chatbot component
├── layout.tsx         # Root layout with Geist font
└── globals.css        # Tailwind CSS imports

src/
├── components/
│   └── chatbot/
│       └── Chatbot.tsx    # Chatbot UI component (client-side)
├── utils/
│   └── chatbot.ts         # Keyword matching logic
└── data/
    └── chatbot/
        └── chatbotKnowledge.json  # Exchange destination database
```

### Key Implementation Details

**Chatbot Logic (`src/utils/chatbot.ts`)**: Simple keyword matching algorithm that:
- Takes user input and converts to lowercase
- Scores each knowledge base entry by keyword matches
- Returns the answer with highest score or a default fallback message

**Knowledge Base (`src/data/chatbot/chatbotKnowledge.json`)**: Large JSON file containing exchange destinations with fields:
- `country`, `universityName`, `location`, `url`
- `languages` (array)
- `exchangeType` (e.g., "Accord bilatéral")
- `description`, `shortName`

**Path Aliases**: `@/*` maps to root directory (defined in `tsconfig.json`)

### Dependencies to Note
- `groq-sdk` is installed but not currently used (placeholder for LLM integration)

### Styling
- Uses Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Fonts: Geist Sans and Geist Mono via `next/font/google`
