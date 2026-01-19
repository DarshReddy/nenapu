# Image Generation Setup Guide

## Current Implementation

The app is configured with **excellent prompt engineering** for consistent 5:1 saree generation, using:
- **Fast Model** (`gemini-1.5-flash`) for live previews
- **Quality Model** (`gemini-1.5-pro`) for final high-quality output

However, standard Gemini models (`@google/generative-ai` package) only support **text generation**, not direct image generation.

## Solution Options

### Option 1: Google Imagen API (Recommended)

Google's official image generation service via Vertex AI:

```bash
npm install @google-cloud/aiplatform
```

**Update `geminiService.js`**:
```javascript
import {PredictionServiceClient} from '@google-cloud/aiplatform';

const client = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

// In generateSareePreview function:
const [response] = await client.predict({
  endpoint: `projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration@005`,
  instances: [
    {
      prompt: fullPrompt,
    },
  ],
  parameters: {
    sampleCount: 1,
    aspectRatio: "16:9", // Closest to 5:1
  },
});

const imageUrl = `data:image/png;base64,${response.predictions[0].bytesBase64Encoded}`;
```

**Pros**: Official Google solution, high quality, multimodal support
**Cons**: Requires GCP setup, not fully frontend-only

### Option 2: Stability AI (Stable Diffusion)

```bash
npm install stability-ai
```

```javascript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STABILITY_API_KEY}`,
  },
  body: JSON.stringify({
    text_prompts: [{ text: fullPrompt }],
    cfg_scale: 7,
    width: 1536,
    height: 320, // 5:1 aspect ratio (approx)
    samples: 1,
  }),
});
```

**Pros**: Good quality, relatively affordable
**Cons**: Requires separate API key, usage costs

### Option 3: OpenAI DALL-E

```bash
npm install openai
```

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: fullPrompt,
  size: "1792x1024", // Closest supported size
  quality: "hd",
  n: 1,
});

const imageUrl = response.data[0].url;
```

**Pros**: High quality, easy integration
**Cons**: Limited aspect ratio options, higher cost

### Option 4: Replicate (Multiple Models)

```bash
npm install replicate
```

```javascript
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    input: {
      prompt: fullPrompt,
      width: 1536,
      height: 320,
    }
  }
);
```

**Pros**: Access to many models, flexible
**Cons**: Requires account, usage-based pricing

## Quick Integration Steps

1. **Choose your image generation service** (e.g., Stability AI for balance of quality/cost)

2. **Install the SDK**:
```bash
cd frontend
npm install stability-ai
```

3. **Add API key to `.env`**:
```
REACT_APP_STABILITY_API_KEY=your_key_here
```

4. **Update `geminiService.js`** - Replace placeholder returns with actual API calls

5. **Test thoroughly** with the excellent prompts already configured!

## Current Prompts (Already Optimized!)

✅ **Base Prompt Template**: Ensures consistent 5:1 saree layout
✅ **Section-Specific Descriptions**: Body, border, pallu with patterns
✅ **Multimodal Image References**: Passes selected designs as context
✅ **Quality Instructions**: Studio lighting, texture details, professional photography
✅ **Fast/Quality Models**: Separate models for preview (speed) vs final (quality)

All prompts are **production-ready** - just connect to a real image generation API!

## Recommended Approach for Your Use Case

Since this is for **internal team use only**, I recommend:

1. **Imagen API via Vertex AI** - Best quality, official Google solution
2. Set up a **simple proxy backend** (Firebase Functions or Vercel Serverless) to keep API keys secure
3. Use the existing excellent prompts without modification

This gives you the best quality images while maintaining the frontend-only deployment model.
