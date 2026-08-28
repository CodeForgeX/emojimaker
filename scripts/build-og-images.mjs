#!/usr/bin/env node
/**
 * Generates 1200×630 Open Graph images for every indexable page into
 * public/og/. Run locally and commit the output — no CI font/network
 * dependency. Faces are composed from the site's own Fluent Emoji parts.
 *
 *   node scripts/build-og-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

// route slug (public/og/<slug>.png) -> [line1, line2?, headIdx, eyesIdx, mouthIdx]
const PAGES = {
  home: ['Create Custom Emojis', 'Online — Free, No Sign-Up', 1, 12, 10],
  'emoji-kitchen': ['Browse 147,000+ Emoji', 'Kitchen Combos', 4, 2, 20],
  'emoji-combiner': ['Merge Two Emojis', 'Into One', 6, 22, 26],
  'random-emoji-generator': ['Random Emoji', 'Generator', 3, 16, 14],
  'slack-emoji-maker': ['Custom Slack Emojis', '128×128, Under 128KB', 2, 5, 3],
  'discord-emoji-maker': ['Custom Discord Emojis', 'No Nitro Needed', 5, 9, 7],
  'twitch-emote-maker': ['Twitch Emotes in All', 'Three Sizes at Once', 8, 19, 33],
  'teams-emoji-maker': ['Custom Emojis for', 'Microsoft Teams', 7, 25, 5],
  'genmoji-online': ['Genmoji Alternatives', 'for Any Device', 1, 7, 17],
  'genmoji-prompts': ['120+ Genmoji', 'Prompt Ideas', 3, 13, 12],
  'genmoji-not-working': ['Fix Genmoji Not', 'Showing Up', 2, 21, 30],
  'emoji-combinations': ['Emoji Combos to', 'Copy & Paste', 6, 3, 2],
  'emoji-combinations-aesthetic': ['Aesthetic Emoji', 'Combinations', 4, 12, 10],
  'emoji-combinations-cute': ['Cute Emoji', 'Combinations', 1, 5, 5],
  'emoji-combinations-funny': ['Funny Emoji', 'Combinations', 3, 22, 20],
  'emoji-combinations-cool': ['Cool Emoji', 'Combinations', 2, 18, 22],
  'emoji-combinations-christmas': ['Christmas Emoji', 'Combinations', 5, 16, 14],
  'emoji-combinations-halloween': ['Halloween Emoji', 'Combinations', 8, 9, 26],
  'guides-how-to-make-custom-emojis': ['How to Make Custom', 'Emojis on Any Device', 7, 2, 3],
}

const partSvg = (dir, n, prefix) => {
  const raw = readFileSync(`src/assets/${dir}/${n}.svg`, 'utf8')
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  // namespace gradient/filter ids so three inlined parts can't collide
  return inner
    .replaceAll(/id="([^"]+)"/g, `id="${prefix}$1"`)
    .replaceAll(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
}

const face = (h, e, m) =>
  `<g transform="translate(790,120) scale(11.5)">` +
  partSvg('head', h, 'h') +
  partSvg('eyes', e, 'e') +
  partSvg('mouth', m, 'm') +
  `</g>`

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const template = (l1raw, l2raw, h, e, m) => {
  const l1 = esc(l1raw)
  const l2 = l2raw ? esc(l2raw) : ''
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#211c3a"/>
      <stop offset="1" stop-color="#14121d"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.42" r="0.5">
      <stop offset="0" stop-color="#7c5cf0" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#7c5cf0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${face(h, e, m)}
  <rect x="80" y="188" width="64" height="10" rx="5" fill="#8f73f5"/>
  <text x="80" y="292" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#f2f0fa">${l1}</text>
  ${l2 ? `<text x="80" y="372" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#f2f0fa">${l2}</text>` : ''}
  <text x="80" y="452" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="400" fill="#a89fd0">Free · No sign-up · PNG + SVG export · Runs in your browser</text>
  <text x="80" y="556" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#c9bcfa">EmojiMaker</text>
  <text x="262" y="556" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="400" fill="#7e769e">emojimaker.cc</text>
</svg>`
}

mkdirSync('public/og', { recursive: true })
for (const [slug, [l1, l2, h, e, m]] of Object.entries(PAGES)) {
  const svg = template(l1, l2, h, e, m)
  const png = await sharp(Buffer.from(svg), { density: 96 }).png({ quality: 90 }).toBuffer()
  writeFileSync(`public/og/${slug}.png`, png)
  console.log(`og/${slug}.png (${(png.length / 1024).toFixed(0)} KB)`)
}
console.log(`\n${Object.keys(PAGES).length} OG images generated.`)
