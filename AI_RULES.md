# AI Rules - App Guidelines

## Tech Stack (5-10 bullet points)

- **React** – UI library; all components are built as React functional components with hooks.
- **TypeScript** – Strong typing across the codebase; prefer `tsx`/`.tsx` file extensions.
- **React Router** – Route management; keep all routes defined in `src/App.tsx`.
- **Vite** – Fast development server and build tool; hot-reload is enabled for ordinary edits.
- **shadcn/ui** – Prebuilt UI component library; always use shadcn/ui components for new UI work.
- **Tailwind CSS** – Utility-first styling; apply Tailwind classes extensively for layout, spacing, colors, and responsive design.
- **lucide-react** – Icon set; use lucide icons for all visual symbols.
- **Radix UI** – Underlying primitive components; shadcn/ui builds on Radix, so no direct Radix usage is needed unless custom.
- **React Hook Form** – Form management (if forms are introduced); keep form logic separate from UI components.
- **Zod** – Schema validation (if needed); pair with React Hook Form for type-safe validation.

## Library Usage Rules

| Category | What to Use | When to Avoid |
|----------|-------------|---------------|
| **UI Components** | shadcn/ui components (imported from `src/components/ui/`) | Do not re‑implement or copy component code from the library; create new components that wrap or extend shadcn/ui if needed. |
| **Styling** | Tailwind CSS classes (`className="..."`) | Do not write custom CSS files for layout/spacing; use Tailwind utilities. Inline styles are allowed only for dynamic values that cannot be expressed as utilities. |
| **Icons** | lucide-react icons (`<Icon name="..." />`) | Do not import from other icon packs; keep all icons under the lucide set for consistency. |
| **Forms** | React Hook Form + Zod (if validation is required) | Do not use uncontrolled components or manual state management for form inputs. |
| **Routing** | React Router (`<Route>`, `<Navigate>`, `useNavigate`) | Do not use hash‑based routing or manual URL manipulation; keep all routes in `src/App.tsx`. |
| **State Management** | Local React state (`useState`, `useReducer`) or context for app‑wide data; avoid global state libraries unless necessary. | Do not add Redux or Zustand unless the app explicitly requires complex cross‑component state. |
| **Animations** | Tailwind transition utilities (`transition`, `duration-300`) or simple CSS keyframes | Do not introduce large animation libraries; keep animations lightweight and CSS‑based. |
| **Icons & Images** | lucide-react for icons; use `src/assets/` for custom images, optimized via Vite. | Do not add external image CDNs without a performance justification. |
| **Dependencies** | Only add packages that are strictly required; before adding, check if an existing shadcn/ui component or Tailwind utility can fulfill the need. | Do not install packages “just in case”; each new dependency must be justified in a comment or TODO. |

## General Directives

- **Keep it simple** – Prefer a few lines of code over premature abstractions. Three similar lines are better than a premature helper function.
- **No backwards‑compatibility hacks** – If a variable or component is unused, delete it completely rather than renaming or adding deprecation comments.
- **Security first** – Avoid command injection, XSS, SQL injection, etc. Validate all user input at the system boundary (forms, API calls).
- **Respect the lock icon** – Any section marked “FO FREE DISTRIBUTION” with a lock indicates restricted access. Do not expose that content to unauthenticated users; the feature will be opened soon.
- **Follow the established folder structure** – Pages go in `src/pages/`, components in `src/components/`, and UI utilities in `src/components/ui/`.
- **Use hot reload** – Ordinary source, styling, and asset edits trigger hot reload; do not restart the development server unless explicitly required.

---

*These rules are intended to keep the codebase consistent, maintainable, and secure. Always refer to this file when adding new features or refactoring existing code.*