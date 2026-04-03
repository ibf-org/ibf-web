<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel" alt="Vercel" />
</p>

# IBF — Innovators Bridge Foundry

**Connecting Founders, Students & Innovators.**

IBF is a full-stack platform where **startup founders** post projects and recruit talent, and **students** discover opportunities, apply for roles, and collaborate — all in one place.

> **Live:** [ibf-tech.vercel.app](https://ibf-tech.vercel.app)

---

## ✨ Features

| Founders | Students | Shared |
|----------|----------|--------|
| Create and manage startup profiles | Browse and discover projects | Real-time chat (Stream) |
| Post projects with multiple roles | Apply for roles with one click | Community messaging |
| Review & accept/reject applications | Track application status | Public user profiles (`/u/username`) |
| Team management dashboard | Personal dashboard & stats | Full-text search (Algolia) |
| Project analytics | Portfolio / profile editor | Email notifications (Resend) |

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Framer Motion |
| **Auth** | [Clerk](https://clerk.com) (OAuth, webhooks, session claims) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security) |
| **Real-time Chat** | [Stream](https://getstream.io) |
| **Search** | [Algolia](https://algolia.com) |
| **Email** | [Resend](https://resend.com) |
| **Analytics** | [PostHog](https://posthog.com) |
| **Error Tracking** | [Sentry](https://sentry.io) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
ibf-web/
├── app/
│   ├── (auth)/           # Sign-in / Sign-up (Clerk)
│   ├── (founder)/        # Founder portal — dashboard, projects, team
│   ├── (student)/        # Student portal — discover, applications
│   ├── (general)/        # Shared pages — chat, community
│   ├── (marketing)/      # Marketing / landing pages
│   ├── about/            # About page
│   ├── faq/              # FAQ page
│   ├── u/                # Public user profiles
│   ├── api/              # API routes (REST)
│   │   ├── applications/ # Apply, accept, reject, withdraw
│   │   ├── auth/         # Auth sync
│   │   ├── chat/         # Stream token & seed
│   │   ├── notifications/# Unread count
│   │   ├── onboarding/   # Role selection & profile setup
│   │   ├── profile/      # Profile CRUD
│   │   ├── projects/     # Project CRUD & browse
│   │   ├── search/       # Algolia sync
│   │   ├── upload/       # File uploads
│   │   └── webhooks/     # Clerk webhooks
│   ├── globals.css       # Design system tokens
│   ├── layout.tsx        # Root layout (Clerk + Stream + Lenis)
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Header, Sidebar, Footer
│   ├── providers/        # Context providers (Lenis, Stream)
│   ├── shared/           # Navbar, reusable components
│   └── ui/               # Radix-based UI primitives
├── lib/
│   ├── supabase.ts       # Supabase client (browser)
│   ├── supabase-admin.ts # Supabase admin client (server)
│   ├── stream.ts         # Stream Chat client
│   ├── stream-server.ts  # Stream server-side helpers
│   ├── algolia.ts        # Algolia search client
│   ├── email.ts          # Resend email templates
│   ├── security.ts       # Input validation & sanitization
│   ├── notifications.ts  # Notification helpers
│   └── utils.ts          # Shared utilities (cn, formatDate, etc.)
├── types/
│   └── supabase.ts       # Database type definitions
├── supabase/
│   └── migrations/       # SQL migration files
├── middleware.ts          # Auth guards & role-based routing
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind theme extensions
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.18
- **npm** ≥ 9
- Accounts on: [Supabase](https://supabase.com), [Clerk](https://clerk.com), [Stream](https://getstream.io), [Algolia](https://algolia.com), [Resend](https://resend.com)

### 1. Clone the repository

```bash
git clone git@github.com:ibf-org/ibf-web.git
cd ibf-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your API keys. See the [Environment Variables](#-environment-variables) section below.

### 4. Set up the database

Run the SQL migrations in your Supabase project (in order):

```
supabase/migrations/001_ibf_schema.sql
supabase/migrations/002_team_updates.sql
supabase/migrations/003_startups_table.sql
supabase/migrations/20240404_community_messages.sql
supabase/migrations/20240404_security_policies.sql
```

### 5. Configure Clerk webhook

Set up a webhook in your Clerk dashboard pointing to:
```
https://your-domain.com/api/webhooks/clerk
```

Subscribe to the `user.created` and `user.updated` events.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (server-only) |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook signing secret |
| `NEXT_PUBLIC_STREAM_API_KEY` | ✅ | Stream Chat API key |
| `STREAM_SECRET_KEY` | ✅ | Stream Chat secret (server-only) |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | ✅ | Algolia application ID |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | ✅ | Algolia search-only API key |
| `ALGOLIA_ADMIN_KEY` | ✅ | Algolia admin key (server-only) |
| `RESEND_API_KEY` | ✅ | Resend email API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | ⬜ | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | ⬜ | PostHog host URL |
| `SENTRY_DSN` | ⬜ | Sentry DSN for error tracking |
| `NEXT_PUBLIC_APP_URL` | ✅ | Canonical app URL |
| `SEED_SECRET` | ⬜ | One-time chat channel seed secret |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-only.

---

## 🌿 Branch Strategy

| Branch | Purpose | Deploys to |
|--------|---------|-----------|
| `main` | Production-ready code | Vercel Production |
| `staging` | Pre-production testing | Vercel Preview |
| `develop` | Active development | Vercel Preview |

```
feature/xyz  →  develop  →  staging  →  main
```

- **Feature branches**: Branch from `develop`, name as `feature/description`
- **Bug fixes**: Branch from `main`, name as `fix/description`
- **Hotfixes**: Branch from `main`, name as `hotfix/description`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

---

## 📦 Deployment (Vercel)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete deployment guide.

**Quick deploy:**

1. Import `ibf-org/ibf-web` in Vercel
2. Set **Framework Preset** to `Next.js`
3. Add all environment variables from `.env.local.example`
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy 🚀

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Branch naming conventions
- Commit message format
- Pull request workflow
- Code style rules

---

## 📄 License

This project is proprietary software owned by IBF (Innovators Bridge Foundry).
All rights reserved.

---

<p align="center">
  Built with ❤️ by the <strong>IBF Team</strong>
</p>
