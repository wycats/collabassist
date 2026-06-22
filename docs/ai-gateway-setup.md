# Vercel AI Gateway Setup

Collabassist defaults to deterministic fake card generation so the prototype, tests, and demos work without credentials.

The stabilized card loop uses AI SDK 6 stable. AI SDK 7 beta should stay deferred until the loop is solid and we intentionally migrate the server card-generator adapter.

To use live model generation through Vercel AI Gateway:

1. Use Node 26 as declared in `.prototools`.
2. Install dependencies with `pnpm install`.
3. Install or use the project Vercel CLI:
   ```bash
   pnpm exec vercel --version
   ```
4. Log in and link the project:
   ```bash
   pnpm exec vercel login
   pnpm exec vercel link
   ```
5. Enable AI Gateway in the linked Vercel project dashboard.
6. Pull local env:
   ```bash
   pnpm exec vercel env pull .env.local
   ```
7. Set:
   ```bash
   CARD_GENERATOR_MODE=gateway
   AI_GATEWAY_MODEL=anthropic/claude-sonnet-4.6
   ```

`AI_GATEWAY_API_KEY` may be used instead of OIDC for non-Vercel environments.
