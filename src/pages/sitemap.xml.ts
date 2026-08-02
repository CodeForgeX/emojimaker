import type { APIRoute } from 'astro'
import { SITE } from '../lib/site'

/**
 * Flat sitemap listing every page in one <urlset>.
 * GSC has a long-standing habit of failing to read index+chunk sitemaps
 * ("couldn't read this sitemap") even when they validate; a single flat
 * file at the conventional /sitemap.xml path sidesteps it entirely.
 * Routes are enumerated from src/pages at build time, so new pages are
 * included automatically. The @astrojs/sitemap index remains available
 * at /sitemap-index.xml as a secondary.
 */
import { COMBO_CATEGORIES } from '../data/combinations'

const pageFiles = import.meta.glob('./**/*.astro')

const EXCLUDE = new Set(['404'])

const staticRoutes = Object.keys(pageFiles)
  .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, '').replace(/\/?index$/, ''))
  .filter((route) => !EXCLUDE.has(route) && !route.includes('['))

// dynamic routes expanded from their data sources
const dynamicRoutes = COMBO_CATEGORIES.map((c) => `emoji-combinations/${c.slug}`)

const routes = [...staticRoutes, ...dynamicRoutes].sort((a, b) => a.length - b.length)

export const GET: APIRoute = () => {
  const urls = routes
    .map((route) => {
      const loc = route === '' ? `${SITE.url}/` : `${SITE.url}/${route}/`
      return `<url><loc>${loc}</loc></url>`
    })
    .join('')
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls +
    '</urlset>'
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
