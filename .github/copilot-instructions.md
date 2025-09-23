# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a React + Vite project with HMR (Hot Module Replacement) and ESLint integration.
- The codebase is organized with clear separation of concerns: UI components, pages, API logic, assets, and styles.
- TypeScript is used for API logic (`src/api/*.ts`), while UI is primarily in JavaScript/JSX.

## Key Directories & Files
- `src/components/`: Reusable React components (e.g., `Navbar.jsx`, `Sidebar.jsx`, `MapView.jsx`).
- `src/pages/`: Top-level route pages (e.g., `Home.jsx`, `Login.jsx`, `Register.jsx`).
- `src/api/`: API client logic, types, and example usage (`account.ts`, `client.ts`, `events.ts`, `types.ts`).
- `src/data/`: Static data (e.g., `randomEvent.json`).
- `src/styles/`: CSS modules for each page/component and global styles.
- `vite.config.js`: Vite build configuration.
- `eslint.config.js`: ESLint rules (expand as needed for production).

## Developer Workflows
- **Start Dev Server:** `npm run dev` (Vite HMR, fast refresh)
- **Build for Production:** `npm run build`
- **Preview Production Build:** `npm run preview`
- **Lint:** `npm run lint` (uses ESLint config)
- No test framework is present; add tests in `src/__tests__/` if needed.

## Patterns & Conventions
- **Component Structure:** Use functional components and hooks. Keep logic in hooks or API files, not in UI components.
- **Styling:** Use CSS modules for page/component-specific styles. Global styles in `src/styles/global.css`.
- **API Integration:** Centralize API calls in `src/api/`. Use TypeScript types for request/response validation.
- **Error Handling:** Use `ErrorBoundary.jsx` for UI error boundaries.
- **Routing:** Page components in `src/pages/` are intended for top-level routes.
- **Assets:** Store images and SVGs in `src/assets/` or `public/`.

## Integration Points
- **External:** Vite plugins for React, ESLint, Babel/SWC (see `vite.config.js`).
- **Internal:** API logic in TypeScript, UI in JS/JSX, CSS modules for styling.

## Examples
- To add a new page: create a component in `src/pages/`, add route logic as needed.
- To add a new API endpoint: update `src/api/client.ts` and types in `src/api/types.ts`.
- To add a new style: create a CSS file in `src/styles/` and import it in the relevant component.

## References
- See `README.md` for Vite/React basics.
- See `src/api/EXAMPLE_USAGE.md` for API usage patterns.

---
_If any conventions or workflows are unclear, please ask for clarification or provide feedback to improve these instructions._
