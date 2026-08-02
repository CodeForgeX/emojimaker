#!/usr/bin/env node
/**
 * Compacts the Emoji Kitchen metadata (xsalazar/emoji-kitchen-backend,
 * ~100MB) into the small pair database the browser island fetches.
 *
 * Usage:
 *   node scripts/build-kitchen-data.mjs /path/to/metadata.json
 *
 * Output: public/kitchen-data.json
 *   { e: [codepoint...], d: [dateFolder...], p: ["rightIdx.dateIdx,..."] }
 * Pairs are stored once, under the emoji whose codepoint is the gstatic
 * URL's folder (leftEmojiCodepoint). Only isLatest artwork is kept.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/build-kitchen-data.mjs <metadata.json>')
  process.exit(1)
}

const meta = JSON.parse(readFileSync(src, 'utf8'))
const e = meta.knownSupportedEmoji
const idx = new Map(e.map((cp, i) => [cp, i]))

const dates = []
const dateIdx = new Map()
const perLeft = new Map() // leftIdx -> array of "rightIdx.dateIdx"
const seen = new Set()

for (const cp of e) {
  const entry = meta.data[cp]
  if (!entry) continue
  for (const partner of Object.keys(entry.combinations)) {
    for (const combo of entry.combinations[partner]) {
      if (!combo.isLatest) continue
      const l = combo.leftEmojiCodepoint
      const r = combo.rightEmojiCodepoint
      const key = `${l}_${r}`
      if (seen.has(key)) continue
      seen.add(key)
      const li = idx.get(l)
      const ri = idx.get(r)
      if (li === undefined || ri === undefined) continue
      if (!dateIdx.has(combo.date)) {
        dateIdx.set(combo.date, dates.length)
        dates.push(combo.date)
      }
      if (!perLeft.has(li)) perLeft.set(li, [])
      perLeft.get(li).push(`${ri}.${dateIdx.get(combo.date)}`)
    }
  }
}

const p = e.map((_, i) => (perLeft.get(i) ?? []).join(','))
const out = { e, d: dates, p }
writeFileSync('public/kitchen-data.json', JSON.stringify(out))

const pairs = [...seen].length
const bytes = JSON.stringify(out).length
console.log(`emojis: ${e.length}, unique pairs: ${pairs}, dates: ${dates.length}`)
console.log(`output: public/kitchen-data.json (${(bytes / 1024).toFixed(0)} KB raw)`)

// sanity check: rebuild one URL and compare with a known-good one
const sampleCp = e[0]
const sample = Object.values(meta.data[sampleCp].combinations)[0].find((c) => c.isLatest)
const toPath = (cp) => 'u' + cp.replaceAll('-', '-u')
const rebuilt = `https://www.gstatic.com/android/keyboard/emojikitchen/${sample.date}/${toPath(sample.leftEmojiCodepoint)}/${toPath(sample.leftEmojiCodepoint)}_${toPath(sample.rightEmojiCodepoint)}.png`
if (rebuilt !== sample.gStaticUrl) {
  console.error('URL rebuild MISMATCH:\n  built: ' + rebuilt + '\n  real:  ' + sample.gStaticUrl)
  process.exit(1)
}
console.log('URL rebuild check: OK')
