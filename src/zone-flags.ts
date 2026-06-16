/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 */
interface Window {
  __Zone_disable_customElements: boolean;
}

// eslint-disable-next-line no-underscore-dangle
window.__Zone_disable_customElements = true;
