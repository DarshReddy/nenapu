# GitHub Copilot Instructions - Threads of Nenapu

## Project Overview
Full-stack Kanjeevaram silk saree customization web app. Users customize three saree sections (body, border, pallu) with colors/patterns, generate AI motifs via Google Gemini 2.0 Flash, and receive final visualizations.

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

### Backend Architecture (`backend/server.py`)
- Single-file FastAPI app with `/api` prefix via `APIRouter`
- All endpoints prefixed with `/api` (e.g., `/api/generate-motifs`)
- Gemini integration uses multimodal content with base64 images
- MongoDB via Motor (async driver) for tracking client status
- Graceful fallback: Returns placeholder images on AI failures

### Key API Endpoints
1. **`POST /api/generate-motifs`**: Generates 4 design motifs per request
   - Returns: `{motifs: [base64DataURLs], section, keyword}`
2. **`POST /api/generate-saree-preview`**: Updates live preview with new designs
   - Accepts: `{prompt, sareeState, images: {body?, border?, pallu?}}`
   - Multimodal: Sends reference images + text to Gemini
3. **`POST /api/finalize-design`**: Generates final fashion photograph
4. **`GET/POST /api/status`**: Health check + MongoDB client tracking

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

### Image Handling Convention
- Frontend sends base64 data URLs to backend
- `imageUrlToBase64()` helper in `SareeCustomizer.jsx` converts local URLs
- Backend extracts base64 from `data:image/png;base64,xxx` format
- Gemini API requires `types.Part.from_bytes(data, mime_type)`

### Error Handling Strategy
Backend returns placeholders on failures (e.g., `placehold.co` URLs) instead of 500 errors. Frontend receives valid responses and shows toast notifications via `sonner`.

## Development Workflows

### Starting Development Servers
```bash
# Terminal 1 - Frontend (port 3000)
cd frontend && yarn start

# Terminal 2 - Backend (default port 8000)
cd backend && python server.py
# OR with auto-reload:
uvicorn server:app --reload
```

### Environment Variables Required
**Backend `.env`**:
```
GOOGLE_API_KEY=<gemini-api-key>
MONGO_URL=<mongodb-connection-string>
DB_NAME=nenapu
CORS_ORIGINS=http://localhost:3000
```

**Frontend `.env`** (create if missing):
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Health Check Plugin (Optional)
Set `ENABLE_HEALTH_CHECK=true` in frontend to activate webpack health monitoring at `/health` and `/health/compilation`. Plugin tracks compile times, errors, warnings via `WebpackHealthPlugin`.

## Tech Stack Specifics

### Frontend Dependencies
- React 19 with functional components + hooks
- Tailwind CSS with HSL CSS variables (`tailwind.config.js`)
- Form validation: React Hook Form + Zod (not yet implemented)
- Icons: `lucide-react`
- Toast notifications: `sonner`
- Build tool: Create React App + CRACO (for config customization)

### Backend Dependencies
- FastAPI with Pydantic v2 models (`ConfigDict` for MongoDB compatibility)
- Motor (async MongoDB driver, not pymongo)
- Google GenAI SDK (`google-genai` package, not `google-generativeai`)
- Uses `genai.Client()` not `GenerativeModel`

## Common Gotchas

1. **Logging**: Backend uses `logging.getLogger(__name__)` at module level. Always log motif generation progress and errors.

2. **MongoDB _id Handling**: Use `ConfigDict(extra="ignore")` in Pydantic models and exclude `_id` in queries: `.find({}, {"_id": 0})`

3. **CORS Configuration**: Backend CORS_ORIGINS must include frontend URL for local dev

4. **Gemini Model Name**: Use `gemini-2.0-flash-exp-image-generation` with `response_modalities=['TEXT', 'IMAGE']`

5. **CSS Variables**: Theme colors defined in `index.css` as CSS vars, referenced in `tailwind.config.js` via `hsl(var(--primary))`

## File Modification Guidelines

- **Adding UI Components**: Use `npx shadcn@latest add <component>` to add new Shadcn components
- **State Updates**: Always use functional setState with spread operators to preserve nested state
- **API Changes**: Update both route handler AND corresponding Pydantic model in `server.py`
- **Styling**: Prefer Tailwind utility classes; use `cn()` for conditional classes

## Testing & Debugging

- Frontend: React DevTools for component state inspection
- Backend: FastAPI auto-docs at `http://localhost:8000/docs`
- Network: Check browser DevTools Network tab for API responses with base64 images
- Logs: Backend logs include motif generation progress and error details

## Design System Colors
South Indian luxury palette:
- Primary: Gold (`#D4AF37`)
- Secondary: Deep maroon (`#C62828`, `#4A0404`)
- Accent: Cream/beige
- Configured via HSL CSS variables for dark mode support
