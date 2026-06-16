---
name: feature-folder-structure
description: Guide feature-based folder structure decisions for this Solo Wrestler Ionic Angular app. Use this whenever adding, moving, reviewing, or planning Angular/Ionic pages, routes, services, models, guards, stores, shared UI, or feature slices in src/app, especially when a user mentions folder structure, feature folders, core/shared/modules, routed pages, or where code should live.
---

# Feature Folder Structure

Use this skill to keep `src/app` organized around Solo Wrestler product features while respecting Ionic Angular standalone conventions.

The project is a standalone Ionic Angular app. Detect the current shape before editing, but expect Angular 20 style files such as `app.ts`, `app.html`, `app.scss`, and `app.routes.ts`, with page/component files named after their folder rather than using `.component` or `.page` suffixes unless the repo already uses that suffix nearby.

## Source Priorities

Read these first when making structure decisions:

1. `docs/PRD.md` for product scope and domain language.
2. `docs/DESIGN.md` for UI/component expectations.
3. `src/app/app.routes.ts` and nearby page folders for current routing and naming.
4. Existing files in the target feature area.

This skill follows the Angular Courses folder structure guide: split app code into non-business `core`, business feature domains, and genuinely reusable `shared` code; keep routed page code under `pages`; keep business-specific shared code near the related domain instead of in global `shared`.

## Target Shape

Use this target structure for new work:

```text
src/app/
  core/
    app-shell/
    first-launch/
    storage/
    timers/
    video/
  features/
    training/
      training.routes.ts
      pages/
        today/
        curriculum/
        active-workout/
        progress/
    about/
      pages/
        about/
  shared/
    components/
    pipes/
    utils/
  app.routes.ts
  app.ts
  app.html
  app.scss
```

Treat this as a direction, not a migration mandate. If the user asks for one screen or one bug fix, add the smallest compatible structure around that work.

## Placement Rules

### Root `src/app`

Keep only application shell files and top-level route configuration here:

- `app.ts`, `app.html`, `app.scss`, `app.spec.ts`
- `app.routes.ts`
- app-level config files if present

Do not add feature pages or domain services directly at the root.

### `core`

Put non-business app capabilities here when they support the whole app or app infrastructure:

- layout/app shell code that is not a product feature
- first-launch and safety-disclaimer gate
- local storage adapters
- timer/haptics/sound adapters
- in-app video modal infrastructure
- route guards and interceptors, if introduced

Create a focused folder when multiple files belong together:

```text
src/app/core/storage/
  workout-progress-store.ts
  workout-progress-store.spec.ts
```

For one-off technical utilities with narrow scope, a technical folder under `core` is acceptable:

```text
src/app/core/guards/
  first-launch-guard.ts
```

### `features`

Put business/product features here. In this repo, feature names should come from the PRD: `today`, `curriculum`, `active-workout`, `progress`, `about`, and later feature domains only when the product scope grows.

Use a domain folder when several pages share product concepts:

```text
src/app/features/training/
  training.routes.ts
  workout.model.ts
  curriculum-data.ts
  pages/
    today/
      today.ts
      today.html
      today.scss
      today.spec.ts
    curriculum/
      curriculum.ts
      curriculum.html
      curriculum.scss
      curriculum.spec.ts
    active-workout/
      active-workout.ts
      active-workout.html
      active-workout.scss
      active-workout.spec.ts
      components/
        drill-card.ts
        drill-card.html
        drill-card.scss
    progress/
      progress.ts
      progress.html
      progress.scss
      progress.spec.ts
```

Use a small feature folder for isolated product areas:

```text
src/app/features/about/
  pages/
    about/
      about.ts
      about.html
      about.scss
      about.spec.ts
```

Keep models, stores, guards, and data files at the lowest folder shared by their consumers. For example, a `drill.model.ts` used by Today, Curriculum, and Active Workout belongs in `features/training/`, not in `shared`.

### Routed Pages

For each routed page, put the page folder under the feature's `pages` folder. Colocate the route component, template, styles, spec, and page-only helpers in that page folder.

Use nested folders only when there is more than one file of that type or the component is clearly page-private:

```text
active-workout/
  active-workout.ts
  active-workout.html
  active-workout.scss
  active-workout.spec.ts
  components/
    drill-card.ts
    workout-timer.ts
  models/
    active-workout-view.model.ts
```

If a feature has only one route, it can be loaded directly from `app.routes.ts`. Add a `feature.routes.ts` file when a domain has multiple related routes or nested children.

### `shared`

Put only reusable, domain-neutral code here:

- presentational components that do not know wrestling curriculum concepts
- generic pipes
- generic utilities

Shared UI should accept neutral inputs such as `title`, `value`, `status`, or `durationSeconds`; it should not accept domain-specific names such as `workoutTitle` unless the component is intentionally part of a feature domain.

Do not put smart business state in `shared`. If code knows about workouts, drills, phases, progress, safety disclaimer state, or curriculum order, place it under `features/training` or `core`, depending on whether it is product-domain code or app infrastructure.

## Routing Guidance

Prefer standalone lazy routes:

```ts
{
  path: 'today',
  loadComponent: () =>
    import('./features/training/pages/today/today').then((m) => m.Today),
}
```

Use Ionic tab routes when implementing the PRD bottom tabs. Keep tab shell/layout in `core/app-shell` if it is non-business navigation chrome, and route child tab pages to their feature folders.

When creating a feature routes file, export `Routes` from that folder:

```ts
export const trainingRoutes: Routes = [
  {
    path: 'today',
    loadComponent: () =>
      import('./pages/today/today').then((m) => m.Today),
  },
];
```

## Naming Rules

Match the repo's Angular 20 style:

- Component/page class: `Today`, `Curriculum`, `ActiveWorkout`
- Component/page files: `today.ts`, `today.html`, `today.scss`, `today.spec.ts`
- Guards and interceptors keep their suffix with a hyphen: `first-launch-guard.ts`
- Models keep `.model.ts`: `workout.model.ts`
- Stores/services can use meaningful names: `workout-progress-store.ts`, `timer-controller.ts`

If an existing nearby feature uses suffixes such as `.page.ts` or `.component.ts`, match that local pattern instead of mixing styles inside the same area.

## Workflow

1. Read the PRD/design docs and current `src/app` shape.
2. Decide whether the code is app infrastructure, business feature code, or domain-neutral shared code.
3. Place new files at the lowest folder that owns the concept.
4. Add route files only when they reduce clutter or support multiple related routes.
5. Keep specs beside the files they test.
6. Avoid broad migrations unless the user explicitly asks for a restructure.
7. If moving files, update imports and route paths, then run `npm run lint` or the narrowest available verification.

## Review Checklist

- Does each file live near the feature or infrastructure concept it serves?
- Is global `shared` free of wrestling-specific business logic?
- Are routed pages colocated with templates, styles, specs, and page-private helpers?
- Are domain-level models/stores placed under `features/training` rather than at app root?
- Does the structure support the MVP screens in `docs/PRD.md` without adding speculative future modules?
- Are changes surgical enough for the user's request?
