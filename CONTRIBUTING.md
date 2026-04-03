# Contributing to IBF

Thank you for your interest in contributing to **Innovators Bridge Foundry**! This document outlines the conventions and workflows we follow.

---

## 🌿 Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/student-portfolio` |
| Bug Fix | `fix/short-description` | `fix/login-redirect-loop` |
| Hotfix | `hotfix/short-description` | `hotfix/api-auth-crash` |
| Chore | `chore/short-description` | `chore/update-dependencies` |
| Docs | `docs/short-description` | `docs/api-reference` |

Always branch from `develop` for features and from `main` for hotfixes.

---

## ✍️ Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependency updates |
| `ci` | CI/CD pipeline changes |

### Examples

```bash
feat(auth): add role-based middleware redirects
fix(api): handle missing Supabase service key gracefully
docs(readme): add environment variable reference table
chore(deps): upgrade @clerk/nextjs to v7
```

---

## 🔄 Pull Request Workflow

### 1. Create a feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
```

### 2. Make your changes

- Follow the existing code style (TypeScript strict mode, Tailwind for styling)
- Keep components focused and reusable
- Add `'use client'` directive only when necessary
- Use `@/` path alias for imports

### 3. Test locally

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Dev server
npm run dev
```

### 4. Commit and push

```bash
git add .
git commit -m "feat(scope): what you did"
git push origin feature/my-feature
```

### 5. Open a Pull Request

- Target branch: `develop` (for features) or `main` (for hotfixes)
- Fill in the PR template
- Request at least one review
- Ensure the Vercel preview deployment succeeds

### 6. Merge

- Squash and merge into `develop`
- Delete the feature branch after merge

---

## 🎨 Code Style

### General

- **TypeScript**: Strict mode enabled — avoid `any`, use proper types
- **Imports**: Use `@/` alias (e.g., `import { cn } from '@/lib/utils'`)
- **Components**: PascalCase filenames (e.g., `ProjectCard.tsx`)
- **API routes**: kebab-case directories (e.g., `api/applications/`)

### React

- Use `'use client'` only for components that need browser APIs or hooks
- Prefer server components by default
- Use `async` components for data fetching on the server

### Styling

- Use Tailwind CSS utility classes
- Use design system tokens from `globals.css` (e.g., `bg-ibf-bg`, `text-ibf-heading`)
- Use Framer Motion for animations

### File Organization

```
components/
├── ui/           # Reusable primitives (Button, Dialog, etc.)
├── shared/       # Shared across portals (Navbar, etc.)
├── layout/       # Layout components (Sidebar, etc.)
└── providers/    # Context providers
```

---

## 🔒 Security

- **Never commit secrets** — all API keys go in `.env.local`
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (`lib/supabase-admin.ts`)
- Validate and sanitize all user input (see `lib/security.ts`)
- All API routes check authentication via Clerk middleware

---

## 📬 Need Help?

Open an issue or reach out to the team. We're happy to help!
