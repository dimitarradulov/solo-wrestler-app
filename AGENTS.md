# Repository Guidelines

## Project Structure & Module Organization

This is an Ionic Angular app with Capacitor native projects. Application code lives in `src/app`, with route configuration in `src/app/app.routes.ts` and page-level folders such as `src/app/home/`. Global styles are in `src/global.scss`, theme tokens are in `src/theme/variables.scss`, and environment files are in `src/environments/`. Static web assets belong in `src/assets`; generated web output goes to `www/`. Native platform projects are kept under `android/` and `ios/`.

Always consult `docs/PRD.md` and `docs/DESIGN.md` before making implementation or design decisions, and keep changes aligned with those documents.

## Build, Test, and Development Commands

- `npm start` runs the Angular dev server for local browser development.
- `npm run build` creates a production Angular build in `www/`.
- `npm run watch` rebuilds continuously with the development configuration.
- `npm test` runs the Jasmine/Karma unit test suite.
- `npm run lint` checks TypeScript and Angular templates with ESLint.

Use `npx cap sync` after web builds when native Capacitor projects need updated web assets or plugin changes.

## Testing Guidelines

Unit tests use Jasmine with Karma. Place specs beside the code under test using the `*.spec.ts` suffix, as in `home.page.spec.ts`. Run `npm test` before submitting behavior changes, and use the CI-style Angular test configuration when adding automation: `npx ng test --configuration ci`.

## Commit & Pull Request Guidelines

Use concise imperative commit messages such as `Add workout timer page` or `Fix home page test setup`. Keep commits focused on one logical change.

Pull requests should include a short summary, test results, linked issues when applicable, and screenshots or screen recordings for visible UI changes. Mention any Capacitor platform impact, especially changes requiring `npx cap sync`, Android Studio, or Xcode follow-up.

## Security & Configuration Tips

Do not commit secrets or local signing credentials. Keep environment-specific values in `src/environments/` or platform configuration files designed for that purpose, and document required local setup in the PR when it affects other contributors.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage labels use the default five-role vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain documentation layout. See `docs/agents/domain.md`.
