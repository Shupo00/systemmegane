# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` grouped by domain; shared utilities in `src/lib/`.
- Tests: `tests/` mirroring `src/` (e.g., `src/foo/bar.ts` → `tests/foo/bar.test.ts` or `tests/foo/test_bar.py`).
- Scripts: `scripts/` for dev/build automation (bash or PowerShell, cross‑platform where possible).
- Assets: `assets/` (images, fixtures); generated files go to `dist/` or `build/`.
- Docs & CI: `README.md`, `AGENTS.md`, and workflows in `.github/workflows/`.

## Build, Test, and Development Commands
- Install: prefer repo scripts when present: `./scripts/setup` (or `scripts\\setup.ps1` on Windows).
- Dev server: `./scripts/dev` (or `npm run dev` / `uv run app.py` depending on stack).
- Build: `./scripts/build` (or `npm run build`, `make build`). Produces `dist/` or `build/`.
- Test: `./scripts/test` (or `npm test`, `pytest -q`). Add `--coverage` when supported.
Document any stack-specific command in `scripts/README.md` if added.

## Coding Style & Naming Conventions
- Indentation: 2 spaces for JS/TS; 4 spaces for Python.
- Naming: classes `PascalCase`, functions/vars `camelCase`, Python modules `snake_case`, files in JS/TS `kebab-case`.
- Lint/format: use project tooling when available (e.g., `npm run lint`, `npm run format`, or `ruff`/`black`). Add an `.editorconfig` to enforce basics.

## Testing Guidelines
- Frameworks: Jest/Vitest for JS/TS; Pytest for Python.
- Location: place tests in `tests/` with one-to-one mirrors of `src/`.
- Naming: JS/TS `*.test.ts` or `*.spec.ts`; Python `test_*.py`.
- Coverage: target ≥80%. Run with `npm test -- --coverage` or `pytest --cov=src`.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat: add auth middleware`, `fix: handle null user`). Keep messages imperative and scoped.
- PRs: include purpose, linked issues (`Closes #123`), screenshots for UI, and notes on testing/edge cases. Keep PRs small and focused.
- CI: ensure all checks pass before requesting review.

## Security & Configuration Tips
- Never commit secrets. Store local config in `.env.local`; provide safe defaults in `.env.example`.
- Validate inputs at boundaries; log without sensitive data. Review dependencies regularly.

