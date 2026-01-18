# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Threads of Nenapu** - A full-stack web application for custom Kanjeevaram silk saree design and visualization. Users customize saree parts (body, border, pallu) with colors, patterns, and zari types, then generate AI-powered motifs and final visualizations.

## Tech Stack

- **Frontend**: React 19, Shadcn/ui (Radix UI), Tailwind CSS, React Hook Form + Zod
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **AI Integration**: Google Imagen 3.0 via Emergent API for image generation
- **Database**: MongoDB

## Development Commands

### Frontend (from `/frontend`)
```bash
yarn start          # Dev server on port 3000
yarn build          # Production build
yarn test           # Run tests
```

### Backend (from `/backend`)
```bash
pip install -r requirements.txt    # Install dependencies
python server.py                   # Start FastAPI server
# OR
uvicorn server:app --reload        # With auto-reload
```

## Architecture

```
/frontend
├── src/
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui primitives (48+ components)
│   │   ├── SareeCustomizer.jsx  # Main container, manages state
│   │   ├── SareeVisualizer.jsx  # Left panel - live saree preview
│   │   ├── ControlPanel.jsx     # Right panel - user controls
│   │   ├── DesignAccordion.jsx  # Accordion-based design picker
│   │   └── FinalizeModal.jsx    # Final design generation modal
│   ├── hooks/
│   └── lib/utils.js             # cn() helper for classnames

/backend
├── server.py                    # FastAPI app with all endpoints
└── requirements.txt
```

## Key Patterns

### Frontend State Structure
```javascript
sareeState = {
  body:   { color, pattern, zari, motifUrl },
  border: { color, pattern, zari, motifUrl },
  pallu:  { color, pattern, zari, motifUrl }
}
```

### API Endpoints (prefix: `/api`)
- `POST /api/generate-motifs` - Generate AI motifs for saree sections
- `POST /api/finalize-design` - Generate final saree visualization
- `GET/POST /api/status` - Health check and client tracking

### Path Alias
Frontend uses `@/` alias mapping to `src/` (configured in craco.config.js and jsconfig.json)

## Environment Variables

**Backend** (`.env` file):
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `CORS_ORIGINS` - Allowed origins (comma-separated)

**Frontend**:
- `REACT_APP_BACKEND_URL` - Backend API endpoint

## Design System

Custom theme with South Indian luxury palette:
- Primary colors: gold, maroon, cream
- Configured in `tailwind.config.js` with CSS variables in `index.css`
- Dark mode support via next-themes
