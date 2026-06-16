## TypeScript

- Use strict type checking.
- Prefer type inference when the type is obvious.
- Avoid `any`; use `unknown` when a value's type is uncertain.
- Keep source files focused on one concept.
- Prefer smaller files when a file starts mixing unrelated concepts.

## Angular Naming

- Separate words in file names with hyphens: `user-profile.ts`.
- Name test files after the code under test with `.spec.ts`: `user-profile.spec.ts`.
- Match file names to the primary TypeScript identifier inside the file.
- Avoid overly generic names such as `helpers.ts`, `utils.ts`, and `common.ts`.
- Use the same base name for a component's TypeScript, template, and style files:
  `user-profile.ts`, `user-profile.html`, `user-profile.scss`.
- If a component needs multiple style files, add descriptive words to the file name.

## Project Structure

- Keep Angular UI code under `src/`.
- Keep configuration, scripts, and other non-UI code outside `src/`.
- Bootstrap the app from `src/main.ts`.
- Group a component's TypeScript, template, styles, and tests in the same directory.
- Keep unit tests beside the code under test instead of using a broad `tests/` folder.
- Organize directories by feature area or domain concept.
- Avoid type-only folders such as `components/`, `directives/`, or `services/`.
- Split directories when they become hard to scan.
- Prefer one component, directive, service, or focused concept per file.

## Dependency Injection

- Prefer the `inject()` function over constructor parameter injection.
- Keep injected dependencies grouped near the top of the class.
- Use `providedIn: 'root'` for singleton services.
- Design services around one clear responsibility.

## Components And Directives

- Keep components and directives focused on presentation and UI behavior.
- Move reusable validation, transformation, and domain logic out of components.
- Group Angular-specific class members near the top:
  injected dependencies, inputs, outputs, queries, then other properties.
- Define properties before methods.
- Use `input()` and `output()` functions for new inputs and outputs.
- Mark properties initialized by `input()`, `model()`, `output()`, and queries as `readonly`.
- Use `protected` for members that are only read by the component template.
- Use directive selectors with the app-specific prefix.
- Use camelCase attribute selectors for attribute directives.
- Put host bindings in the `host` object of `@Component` or `@Directive`.
- Do not use `@HostBinding` or `@HostListener` for new code.
- Keep components small and focused on a single responsibility.

## Templates

- Keep template expressions simple.
- Move complex template logic into TypeScript, usually with `computed()`.
- Use native control flow: `@if`, `@for`, and `@switch`.
- Prefer `class` and `style` bindings over `ngClass` and `ngStyle`.
- Use the async pipe for observable values rendered in templates.
- Do not assume browser globals such as `new Date()` are available in templates.
- Use `NgOptimizedImage` for static images when it applies.
- `NgOptimizedImage` does not apply to inline base64 images.

## Event Handling

- Name event handlers for the action they perform, not for the triggering event.
- Prefer names such as `saveUserData()` over vague names such as `handleClick()`.
- For keyboard events, use Angular key modifiers where they make the template clearer.
- If event logic is necessarily complex, delegate from a generic handler to focused methods.

## Lifecycle Hooks

- Keep lifecycle methods simple.
- Move long lifecycle logic into well-named methods and call them from the hook.
- Implement Angular lifecycle interfaces such as `OnInit` when adding lifecycle hooks.

## State Management

- Use signals for local component state.
- Use `computed()` for derived state.
- Keep state transformations pure and predictable.
- Use `set()` or `update()` to change signal values.

## Forms

- Prefer reactive forms over template-driven forms unless there is a specific reason.
- Keep form validation rules testable and outside templates when they become non-trivial.

## Accessibility

- All UI changes must pass AXE checks.
- Follow WCAG AA minimums, including focus management, color contrast, and ARIA usage.
