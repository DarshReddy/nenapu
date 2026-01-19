# Threads of Nenapu - Deployment Guide

This is a frontend-only React application that can be deployed for free on various platforms.

## Prerequisites

1. Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Node.js 16+ and Yarn installed

## Local Development

```bash
cd frontend
yarn install
cp .env.example .env
# Edit .env and add your REACT_APP_GOOGLE_API_KEY
yarn start
```

## Free Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from frontend directory:
```bash
cd frontend
vercel
```

3. Add environment variable in Vercel Dashboard:
   - Go to your project settings
   - Add `REACT_APP_GOOGLE_API_KEY` with your Gemini API key

4. Redeploy to apply environment variable

### Option 2: Netlify

1. Build the project:
```bash
cd frontend
yarn build
```

2. Deploy via Netlify CLI or drag-and-drop:
   - Install CLI: `npm i -g netlify-cli`
   - Deploy: `netlify deploy --prod --dir=build`

3. Add environment variable in Netlify Dashboard:
   - Go to Site settings → Environment variables
   - Add `REACT_APP_GOOGLE_API_KEY` with your Gemini API key

4. Rebuild and deploy

### Option 3: GitHub Pages

1. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/nenapu"
```

2. Install gh-pages:
```bash
yarn add -D gh-pages
```

3. Add to `package.json` scripts:
```json
"predeploy": "yarn build",
"deploy": "gh-pages -d build"
```

4. Deploy:
```bash
yarn deploy
```

**Note**: GitHub Pages doesn't support environment variables at build time. You'll need to:
- Either: Build locally with `.env` file, then deploy the built files
- Or: Use GitHub Actions to inject secrets during build

## Important Notes

- The Google Gemini API key will be visible in browser since this is a frontend-only app
- Only use for internal team access, not public production
- Consider implementing a backend proxy if you need to secure the API key for public use

## Tech Stack

- React 19
- Tailwind CSS + Shadcn/ui
- Google Gemini 2.0 Flash API
- Lucide React Icons
