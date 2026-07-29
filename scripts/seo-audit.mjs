#!/usr/bin/env node
/**
 * On-page SEO audit for the built site in dist/.
 * Checks every generated HTML page for the fundamentals search engines care about.
 * Exits non-zero if any ERROR-level finding exists.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'dist'
const SITE = 'https://emojimaker.cc'

const pages = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.html')) pages.push(p)
  }
}
walk(DIST)

const findings = [] // {level, page, msg}
const add = (level, page, msg) => findings.push({ level, page, msg })

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return m ? m[1] : null
}
const metaContent = (html, key, val) => {
  const re = new RegExp(`<meta[^>]+${key}\\s*=\\s*"${val}"[^>]*>`, 'i')
  const m = html.match(re)
  return m ? attr(m[0], 'content') : null
}
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

const titles = new Map()
const descriptions = new Map()

for (const file of pages) {
  const html = readFileSync(file, 'utf8')
  const rel = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/')
  const isNoindex = /<meta[^>]+name="robots"[^>]+noindex/i.test(html)

  // lang + viewport
  if (!/<html[^>]+lang="en"/i.test(html)) add('ERROR', rel, 'missing <html lang>')
  if (!metaContent(html, 'name', 'viewport')) add('ERROR', rel, 'missing viewport meta')

  // title
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1]?.trim()
  if (!title) add('ERROR', rel, 'missing <title>')
  else {
    if (title.length < 25 || title.length > 65) add('WARN', rel, `title length ${title.length} (aim 25-65): "${title}"`)
    if (titles.has(title)) add('ERROR', rel, `duplicate title with ${titles.get(title)}`)
    titles.set(title, rel)
  }

  // meta description
  const desc = metaContent(html, 'name', 'description')
  if (!desc) add('ERROR', rel, 'missing meta description')
  else {
    if (desc.length < 70 || desc.length > 165) add('WARN', rel, `description length ${desc.length} (aim 70-165)`)
    if (descriptions.has(desc)) add('ERROR', rel, `duplicate description with ${descriptions.get(desc)}`)
    descriptions.set(desc, rel)
  }

  // h1
  const h1s = html.match(/<h1[\s>]/gi) || []
  if (h1s.length !== 1) add('ERROR', rel, `${h1s.length} <h1> tags (must be exactly 1)`)

  // canonical
  const canon = (html.match(/<link[^>]+rel="canonical"[^>]*>/i) || [])[0]
  const canonHref = canon ? attr(canon, 'href') : null
  if (!canonHref) add('ERROR', rel, 'missing canonical')
  else if (!isNoindex && canonHref !== SITE + rel) add('ERROR', rel, `canonical mismatch: ${canonHref} vs expected ${SITE + rel}`)

  // OG / twitter
  for (const [k, v] of [['property', 'og:title'], ['property', 'og:description'], ['property', 'og:image'], ['property', 'og:url'], ['name', 'twitter:card']]) {
    if (!metaContent(html, k, v)) add('ERROR', rel, `missing ${v}`)
  }

  // JSON-LD validity + FAQ consistency
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  if (!isNoindex && ldBlocks.length === 0) add('WARN', rel, 'no JSON-LD structured data')
  for (const [, raw] of ldBlocks) {
    try {
      const data = JSON.parse(raw)
      const nodes = data['@graph'] ?? [data]
      const faq = nodes.find((n) => n['@type'] === 'FAQPage')
      if (faq) {
        const visibleQs = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/gi)].map((m) => stripTags(m[1]))
        for (const q of faq.mainEntity.map((e) => e.name)) {
          if (!visibleQs.some((v) => v === stripTags(q))) add('ERROR', rel, `FAQ schema question not visible on page: "${q}"`)
        }
        for (const e of faq.mainEntity) {
          if (/<[a-z][^>]*>/i.test(e.acceptedAnswer.text)) add('WARN', rel, `FAQ schema answer contains HTML: "${e.name}"`)
        }
      }
    } catch (err) {
      add('ERROR', rel, `invalid JSON-LD: ${err.message}`)
    }
  }

  // images need alt
  for (const img of html.match(/<img[^>]*>/gi) || []) {
    if (attr(img, 'alt') === null) add('ERROR', rel, `img missing alt: ${img.slice(0, 80)}`)
  }

  // internal links resolve
  for (const a of html.match(/<a[^>]+href="\/[^"]*"[^>]*>/gi) || []) {
    const href = attr(a, 'href')
    if (!href || href.startsWith('//')) continue
    const clean = href.split('#')[0].split('?')[0]
    if (/\.(png|svg|xml|txt|ico|webp|jpg)$/.test(clean)) {
      if (!existsSync(join(DIST, clean))) add('ERROR', rel, `broken asset link ${href}`)
    } else {
      const target = join(DIST, clean, 'index.html')
      if (!existsSync(target)) add('ERROR', rel, `broken internal link ${href}`)
    }
  }
}

// sitemap checks
const smIndex = join(DIST, 'sitemap-index.xml')
if (!existsSync(smIndex)) add('ERROR', '/', 'sitemap-index.xml missing')
else {
  const sm0 = join(DIST, 'sitemap-0.xml')
  const sm = existsSync(sm0) ? readFileSync(sm0, 'utf8') : ''
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  for (const file of pages) {
    const rel = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/')
    const html = readFileSync(file, 'utf8')
    const noindex = /<meta[^>]+name="robots"[^>]+noindex/i.test(html)
    const inMap = urls.includes(SITE + rel)
    if (noindex && inMap) add('ERROR', rel, 'noindex page present in sitemap')
    if (!noindex && !inMap && !rel.includes('404')) add('ERROR', rel, 'indexable page missing from sitemap')
  }
}

// robots.txt
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : ''
if (!robots.includes('sitemap-index.xml')) add('ERROR', '/', 'robots.txt missing sitemap reference')

// report
const errors = findings.filter((f) => f.level === 'ERROR')
const warns = findings.filter((f) => f.level === 'WARN')
console.log(`\nSEO audit: ${pages.length} pages checked — ${errors.length} errors, ${warns.length} warnings\n`)
for (const f of findings) console.log(`  [${f.level}] ${f.page} — ${f.msg}`)
if (!findings.length) console.log('  All checks passed ✔')
process.exit(errors.length ? 1 : 0)
