# Deployment Guide — IBF Web

This guide covers deploying IBF to **Vercel** from the GitHub repository.

---

## 📋 Prerequisites

- A [Vercel](https://vercel.com) account
- The `ibf-org/ibf-web` GitHub repository connected to Vercel
- All third-party service accounts configured (Supabase, Clerk, Stream, Algolia, Resend)

---

## 🚀 Vercel Setup

### 1. Import the repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository**
3. Choose `ibf-org/ibf-web`
4. Set **Framework Preset** to **Next.js**
5. Set **Root Directory** to `./` (default)

### 2. Configure environment variables

Add **all** of the following in **Settings → Environment Variables**:

#### Required (Production + Preview)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-key
CLERK_SECRET_KEY=sk_live_your-key
CLERK_WEBHOOK_SECRET=whsec_your-secret

# Clerk redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Stream Chat
NEXT_PUBLIC_STREAM_API_KEY=your-stream-key
STREAM_SECRET_KEY=your-stream-secret

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-search-key
ALGOLIA_ADMIN_KEY=your-admin-key

# Resend
RESEND_API_KEY=re_your-key

# App URL (set to your production domain)
NEXT_PUBLIC_APP_URL=https://ibf-tech.vercel.app
```

#### Optional

```env
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project
SENTRY_ORG=your-org
SENTRY_PROJECT=ibf-web

# Chat seed (one-time use)
SEED_SECRET=your-random-secret
```

> **Tip:** Use different Clerk keys for Preview vs Production environments if you want test vs live auth.

### 3. Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Run `next build` (Turbopack)
3. Deploy the output to the edge

---

## 🌿 Branch → Environment Mapping

Configure this in **Vercel → Settings → Git**:

| Branch | Vercel Environment | URL |
|--------|-------------------|-----|
| `main` | Production | `ibf-tech.vercel.app` |
| `staging` | Preview | `staging-ibf-web-*.vercel.app` |
| `develop` | Preview | `develop-ibf-web-*.vercel.app` |

Every push to any branch creates a **Preview Deployment** automatically.

---

## 🔧 Build Configuration

The project uses these settings (auto-detected by Vercel):

| Setting | Value |
|---------|-------|
| **Build Command** | `next build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or 20.x |
| **Framework** | Next.js |

---

## 🔗 Post-Deployment Setup

### Clerk Webhook

After your first deploy, configure the Clerk webhook:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
4. Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET` in Vercel

### Supabase

Ensure your Supabase project allows connections from Vercel's IP ranges. In **Supabase Dashboard → Settings → API**:
- Verify the **anon key** and **service role key** match your env vars
- Ensure **Row-Level Security** policies are applied (see `supabase/migrations/`)

### Stream Chat (Optional seed)

To seed initial chat channels, hit the endpoint once after deploy:
```bash
curl -X POST https://your-domain.com/api/chat/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-SEED_SECRET-value"}'
```

### Custom Domain

1. Go to **Vercel → Settings → Domains**
2. Add your custom domain
3. Configure DNS (CNAME or A record as shown)
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## 🐛 Troubleshooting

### Build fails with TypeScript errors

```bash
# Run locally to see the exact errors
npx tsc --noEmit
npm run build
```

The project has `typescript.ignoreBuildErrors: false` — all type errors must be fixed before deploying.

### `SUPABASE_SERVICE_ROLE_KEY` is undefined

This key must be set as a **plain** (not `NEXT_PUBLIC_`) environment variable in Vercel. It's only available on the server side.

### Middleware deprecation warning

Next.js 16 shows a warning about `middleware.ts` being deprecated in favor of `proxy`. This is a **warning only** — the middleware still functions correctly. A future migration is planned.

### `eslint` configuration warning

If you see _"eslint configuration in next.config.ts is no longer supported"_, the `eslint` block has been removed from `next.config.ts`. Make sure you're on the latest commit.

### Preview deploys show wrong `NEXT_PUBLIC_APP_URL`

Set **environment-specific** values for `NEXT_PUBLIC_APP_URL`:
- **Production**: `https://ibf-tech.vercel.app`
- **Preview**: `https://$VERCEL_URL` (Vercel auto-injects this)

### Build hangs or OOM

Increase the build memory in **Vercel → Settings → General → Build & Development Settings**:
```
NODE_OPTIONS=--max-old-space-size=4096
```

---

## 📦 Manual Deployment

If you need to deploy outside Vercel:

```bash
# Build
npm run build

# Start production server
npm start
```

The app will start on port 3000 by default. Set `PORT` env var to change it.

---

<p align="center">
  📖 For more help, see the <a href="./README.md">README</a> or open an issue.
</p>
