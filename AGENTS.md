# Repository Guidelines

## Project Structure & Module Organization

This is an Ionic Angular app with Capacitor native projects. Application code lives in `src/app`, with route configuration in `src/app/app.routes.ts` and page-level folders such as `src/app/home/`. Global styles are in `src/global.scss`, theme tokens are in `src/theme/variables.scss`, and environment files are in `src/environments/`. Static web assets belong in `src/assets`; generated web output goes to `www/`. Native platform projects are kept under `android/` and `ios/`.

Always consult `docs/PRD.md` and `docs/DESIGN.md` before making implementation or design decisions, and keep changes aligned with those documents.

## Build, Test, and Development Commands

- `ionic serve` runs the Ionic development server with live reload in the browser.
- `ionic build` creates the web build in `www/`.
- `ionic build --watch` rebuilds the web app continuously.
- `ionic capacitor sync` builds the web app, copies it into both native projects, and updates native dependencies and plugins. Pass `android` or `ios` to sync only one platform.
- `npx cap run android` or `npx cap run ios` syncs, builds, and deploys the native app to a selected device or emulator.
- `npx cap open android` or `npx cap open ios` opens the native project in Android Studio or Xcode.
- `npm test` runs the Vitest unit test suite through Angular's unit-test builder.
- `npm run lint` checks TypeScript and Angular templates with ESLint.

## Testing Guidelines

Unit tests use Vitest with jsdom through Angular's experimental unit-test builder. Place specs beside the code under test using the `*.spec.ts` suffix, as in `home.page.spec.ts`. Use Vitest APIs for spies, mocks, and timers. Run `npm test` before submitting behavior changes, and use the CI-style Angular test configuration when adding automation: `npx ng test --configuration ci`.

Angular 20.3 requires Node.js 20.19+ or 22.12+. Prefer an LTS release; the test and application builders are not reliable with the unsupported Node.js 25 runtime.

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
