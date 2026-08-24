/**
 * Fire a GA4 event via gtag, if analytics is loaded.
 *
 * No-ops during SSR and whenever gtag is absent — which is the case in dev and
 * preview (placeholder PUBLIC_GTAG_ID means BaseLayout never injects the GA
 * snippet). So every call site is safe without guards.
 *
 * Value events worth marking as "key events" in GA4: export_png, export_svg, copy.
 */
type Params = Record<string, string | number | boolean>

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Params) => void
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', event, params)
}
