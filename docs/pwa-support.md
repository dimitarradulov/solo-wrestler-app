# PWA Support Plan

## Assumptions

- Keep one Ionic Angular + Capacitor repo.
- Add PWA support to the existing web build.
- Do not change native iOS/Android behavior unless required for compatibility.
- Keep the first pass limited to installability, app shell caching, correct metadata, and production build verification.

## Steps

1. Baseline the current app.
   - Check `git status`.
   - Inspect `package.json`, `angular.json`, `src/main.ts`, `src/index.html`, `capacitor.config.ts`, and existing icon assets.
   - Confirm the current Angular/Ionic versions and bootstrap architecture.
   - Run `rtk npm run build`.

2. Add Angular PWA support.
   - Run `rtk ng add @angular/pwa`.
   - Review generated changes and keep them aligned with the app's existing architecture.

3. Wire service worker registration.
   - Confirm `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() })` is registered in the Angular bootstrap path.
   - Place the registration in the existing app config or bootstrap file, depending on the current architecture.

4. Add or refine `ngsw-config.json`.
   - Cache the app shell and static assets.
   - Keep caching conservative at first.
   - Do not try to cache YouTube videos, because they require network and are outside the app bundle.

5. Create or fix the web app manifest.
   - Add or update `src/manifest.webmanifest`.
   - Set the app name, short name, start URL, display mode, theme color, background color, and icons.
   - Use `standalone` display mode.

6. Fix icon asset handling.
   - Either move/copy icons into `src/assets/icons/` or add `src/icons` to Angular's asset list in `angular.json`.
   - Prefer the option that best matches the repo's existing asset structure.
   - Confirm manifest icon paths resolve in the production build.

7. Update `src/index.html` metadata.
   - Change the title from `Ionic App` to the real app name.
   - Fix the favicon path.
   - Add iOS PWA metadata:

     ```html
     <meta name="apple-mobile-web-app-capable" content="yes">
     <meta name="apple-mobile-web-app-title" content="Solo Wrestler">
     <meta name="apple-mobile-web-app-status-bar-style" content="default">
     ```

   - Add or verify the manifest link:

     ```html
     <link rel="manifest" href="manifest.webmanifest">
     ```

8. Review web/native boundaries.
   - Confirm native video logic still only runs outside web.
   - Keep the native app on the custom native player.
   - Keep the PWA/web path on the YouTube iframe modal.
   - Confirm haptics remain best-effort and the web fallback still works.

9. Build and verify generated output.
   - Run `rtk npm run build`.
   - Confirm the output contains:
     - `manifest.webmanifest`
     - `ngsw-worker.js`
     - `ngsw.json`
     - referenced icons
     - favicon

10. Run lint and tests.
    - Run `rtk npm run lint` if TypeScript, templates, or Angular config changed.
    - Run `rtk npm test` for behavioral changes.
    - If only static metadata or assets changed, the production build is the main required check.

11. Serve the production build locally.
    - Use a static server against the built output rather than `ionic serve`, because service workers require production-style output.
    - Example: `rtk npx http-server www`.
    - Confirm the app loads and the service worker registers.

12. Test installability on desktop.
    - Open the production build in Chrome or Edge.
    - Inspect the manifest in DevTools.
    - Inspect service worker registration in DevTools.
    - Run Lighthouse PWA checks if useful.

13. Deploy over HTTPS.
    - Use a static host such as Netlify, Vercel, Cloudflare Pages, Firebase Hosting, or another HTTPS-capable host.
    - iPhone PWA installation requires Safari over HTTPS, except for local development exceptions.

14. Test on the actual iPhone.
    - Open the deployed URL in Safari.
    - Use Share > Add to Home Screen.
    - Launch from the Home Screen icon.
    - Verify standalone mode has no Safari address bar.
    - Verify onboarding works.
    - Verify local progress persists after closing and reopening.
    - Verify active workouts work.
    - Verify timers and audio alerts work while the app is open.
    - Verify YouTube technique videos play acceptably.
    - Verify the offline app shell opens after a successful first load.

15. Document known PWA limitations.
    - YouTube videos require internet.
    - Haptics may be weaker or unavailable compared to native.
    - Background behavior is browser-controlled.
    - Progress is local to each device until backend sync is added.
    - Users must install manually from Safari.

16. Optional follow-up after first PWA support works.
    - Self-host fonts if offline visual consistency matters.
    - Add a small install prompt for non-iOS browsers.
    - Add backend or cloud sync if cross-device progress becomes important.
    - Add analytics or error reporting if the app will be shared with others.

## First-Pass Definition of Done

- The app is installable as a PWA.
- The app shell is cached after first load.
- Icons and metadata are correct.
- Production build passes.
- Core iPhone flows are manually tested from the Home Screen installation.
