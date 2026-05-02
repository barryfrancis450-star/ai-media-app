# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations proxy (gpt-image-1 for image generation)

## Artifacts

### AI Media Generator (`/`)
- **Frontend**: React + Vite (`artifacts/ai-media-generator/`)
- **Backend**: Express API server (`artifacts/api-server/`)
- **Database table**: `generated_images` — stores all generated images (prompt, size, b64_json, createdAt)
- **Pages**:
  - `/` — Generator: prompt input, style chips, dimension picker, image generation + preview
  - `/gallery` — Gallery: view all past images with delete and stats

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## OpenAI Integration

Uses Replit AI Integrations proxy — no API key required. Env vars:
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — auto-set by Replit
- `AI_INTEGRATIONS_OPENAI_API_KEY` — auto-set by Replit (dummy for SDK compatibility)

Image generation: `POST /api/openai/images/generate` → `generateImageBuffer()` from `@workspace/integrations-openai-ai-server/image`

## API Endpoints

- `GET /api/healthz` — health check
- `POST /api/openai/images/generate` — generate AI image (prompt, size, style)
- `GET /api/openai/images` — list all generated images
- `DELETE /api/openai/images/:id` — delete an image
- `GET /api/openai/images/stats` — generation statistics

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
