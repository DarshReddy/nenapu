# GitHub Copilot Instructions - Threads of Nenapu

## Project Overview
Frontend-only Kanjeevaram silk saree customization web app. Users customize three saree sections (body, border, pallu) with colors/patterns, generate AI motifs via Google Gemini 2.0 Flash API (called directly from browser), and receive final visualizations. Built for easy deployment on free hosting platforms (Vercel, Netlify, GitHub Pages).

## Architecture & Data Flow

### Frontend State Management
Single source of truth in `SareeCustomizer.jsx`:
```javascript
sareeState = {
  zari: 'Gold',  // Global setting
  body:   { color: '#hex', pattern: '', motifUrl: '' },
  border: { color: '#hex', pattern: '', motifUrl: '' },
  pallu:  { color: '#hex', pattern: '', motifUrl: '' }
}
```
State flows: `SareeCustomizer` → `ControlPanel` (mutations) + `SareeVisualizer` (display)

### Gemini Service Layer (`src/services/geminiService.js`)
- Centralized Google Gemini API integration
- Three main functions:
  1. `generateMotifs(prompt, count, section, keyword)` - Generate 4 design motifs
  2. `generateSareePreview(prompt, sareeState, images)` - Update live preview with multimodal input
  3. `finalizeDesign(prompt, sareeState)` - Generate final fashion photograph
- Graceful fallback: Returns placeholder images on API failures
- All functions handle base64 image encoding/decoding for Gemini API

### Image Handling Convention
- Gemini API requires `inlineData` format: `{data: Uint8Array, mimeType: string}`
- Frontend converts between base64 data URLs and byte arrays
- `base64ToBytes()` helper in geminiService handles conversions
- Components pass base64 data URLs, service converts for API

## Critical Development Patterns

### Path Aliasing
`@/components/ui/button` → `frontend/src/components/ui/button.jsx`
- Configured in `craco.config.js` (webpack alias) and `jsconfig.json` (IDE)
- Always use `@/` imports for src files

### Shadcn/ui Component Structure
48+ prebuilt components in `src/components/ui/`. Use composition pattern:
```jsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'  // For conditional classnames
```

### Gemini API Integration Pattern
All components import from `@/services/geminiService`:
```jsx
import { generateMotifs, generateSareePreview, finalizeDesign } from '@/services/geminiService';

// Usage
const data = await generateMotifs(prompt, 4, 'border', 'peacock');
// Returns: { motifs: [base64DataURLs], section, keyword }
```

### Error Handling Strategy
Service layer returns placeholders on failures (e.g., `placehold.co` URLs) instead of throwing errors. Components check for `data.error` and show toast notifications via `sonner`.

## Development Workflows

### Starting Development
```bash
cd frontend
yarn install          # First time only
yarn start           # Dev server on port 3000
```

### Environment Variables Required
Create `frontend/.env` from `.env.example`:
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

**Required**:
- `REACT_APP_GOOGLE_API_KEY` - Get from https://aistudio.google.com/app/apikey

**Optional**:
- `ENABLE_HEALTH_CHECK=true` - Activates webpack health monitoring at `/health`

### Deployment (Free Options)
**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# From frontend/ directory
vercel

# Add environment variable in Vercel dashboard:
# REACT_APP_GOOGLE_API_KEY = your_key
```

**Netlify**:
```bash
# Build
yarn build

# Deploy build/ folder
# Add REACT_APP_GOOGLE_API_KEY in Netlify environment variables
```

**GitHub Pages**:
```bash
# Add "homepage": "https://yourusername.github.io/repo" to package.json
yarn build
# Deploy build/ folder to gh-pages branch
```

## Tech Stack Specifics

### Dependencies
- React 19 with functional components + hooks
- Tailwind CSS with HSL CSS variables (`tailwind.config.js`)
- Shadcn/ui (Radix UI primitives)
- Icons: `lucide-react`
- Toast notifications: `sonner`
- Build tool: Create React App + CRACO (for config customization)
- AI: `google-genai` v1.57.0 SDK

### Gemini SDK Usage
**Package**: `google-genai` (NOT `google-generativeai`)
- Client: `new genai.Client({ apiKey })`
- Model: `gemini-2.0-flash-exp-image-generation`
- Config: `generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }`
- Response: Access via `response.candidates[0].content.parts[i].inlineData`

## Common Gotcas

1. **API Key Exposure**: Since this is frontend-only, API key is visible in browser. Acceptable for internal team use only.

2. **Gemini Response Format**: Images come as `inlineData.data` (Uint8Array), must convert to base64 for display:
   ```js
   const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
   const dataUrl = `data:${mimeType};base64,${base64}`;
   ```

3. **CSS Variables**: Theme colors defined in `index.css` as CSS vars, referenced in `tailwind.config.js` via `hsl(var(--primary))`

4. **Health Check Plugin**: Only activates when `ENABLE_HEALTH_CHECK=true` in .env

5. **State Updates**: Always use functional setState with spread operators to preserve nested state

## File Modification Guidelines

- **Adding UI Components**: Use `npx shadcn@latest add <component>` to add new Shadcn components
- **API Changes**: Update functions in `src/services/geminiService.js`
- **Styling**: Prefer Tailwind utility classes; use `cn()` for conditional classes
- **New Gemini Calls**: Follow existing pattern in geminiService with error handling and placeholders

## Testing & Debugging

- React DevTools for component state inspection
- Browser Console for Gemini API responses and errors
- Network tab to verify Gemini API calls (look for `generativelanguage.googleapis.com`)
- Service layer logs all API calls with `console.log/error`

## Design System Colors
South Indian luxury palette:
- Primary: Gold (`#D4AF37`)
- Secondary: Deep maroon (`#C62828`, `#4A0404`)
- Accent: Cream/beige
- Configured via HSL CSS variables for dark mode support
