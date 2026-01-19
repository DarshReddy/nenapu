# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Threads of Nenapu** - A frontend-only web application for custom Kanjeevaram silk saree design and visualization. Users customize saree parts (body, border, pallu) with colors, patterns, and zari types, then generate AI-powered motifs and final visualizations directly via Google Gemini API.

## Tech Stack

- **Frontend**: React 19, Shadcn/ui (Radix UI), Tailwind CSS
- **AI Integration**: Google Gemini 2.0 Flash API (called directly from browser)
- **Deployment**: Free hosting on Vercel, Netlify, or GitHub Pages

## Development Commands

### Frontend (from `/frontend`)
```bash
yarn install        # First time setup
yarn start          # Dev server on port 3000
yarn build          # Production build
yarn test           # Run tests
```

## Architecture

```
/frontend
├── src/
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui primitives (48+ components)
│   │   ├── SareeCustomizer.jsx  # Main container, manages state
│   │   ├── SareeVisualizer.jsx  # Live saree preview
│   │   ├── ControlPanel.jsx     # User controls
│   │   ├── DesignAccordion.jsx  # Accordion-based design picker
│   │   └── FinalizeModal.jsx    # Final design generation modal
│   ├── services/
│   │   └── geminiService.js     # Centralized Gemini API calls
│   ├── hooks/
│   └── lib/utils.js             # cn() helper for classnames
```

## Key Patterns

### Frontend State Structure
```javascript
sareeState = {
  zari: 'Gold',  // Global zari setting
  body:   { color, pattern, motifUrl },
  border: { color, pattern, motifUrl },
  pallu:  { color, pattern, motifUrl }
}
```

### Gemini Service Layer
- `generateMotifs(prompt, count, section, keyword)` - Generate 4 design motifs
- `generateSareePreview(prompt, sareeState, images)` - Update live preview with multimodal input
- `finalizeDesign(prompt, sareeState)` - Generate final fashion photograph
- All functions handle base64 image conversion and error fallbacks

### Path Alias
Frontend uses `@/` alias mapping to `src/` (configured in craco.config.js and jsconfig.json)

## Environment Variables

**Frontend** (`.env` file):
- `REACT_APP_GOOGLE_API_KEY` - Google Gemini API key (get from https://aistudio.google.com/app/apikey)
- `ENABLE_HEALTH_CHECK` - Optional: Enable webpack health monitoring

## Design System

Custom theme with South Indian luxury palette:
- Primary colors: gold (`#D4AF37`), maroon (`#C62828`), cream
- Configured in `tailwind.config.js` with CSS variables in `index.css`
- Dark mode support via next-themes

## Getting Started

1. Get API key: https://aistudio.google.com/app/apikey
2. Copy `.env.example` to `.env` and add your key
3. Run `yarn install && yarn start`
4. Deploy for free on Vercel, Netlify, or GitHub Pages (see DEPLOYMENT.md)
