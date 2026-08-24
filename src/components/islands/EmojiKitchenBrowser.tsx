import type { Component } from 'solid-js'
import { createSignal, createMemo, onMount, For, Show } from 'solid-js'
import { track } from '../../lib/track'
import './islands.css'

/**
 * Browses Google's Emoji Kitchen mashups. Pair data is compacted at build
 * time into /kitchen-data.json (see scripts/build-kitchen-data.mjs); the
 * mashup PNGs themselves are served by Google from gstatic.com — the same
 * source Gboard and Google Search use.
 */

interface KitchenData {
  e: string[] // supported emoji codepoints, e.g. "2764-fe0f"
  d: string[] // unique date folder names
  p: string[] // per-left-emoji packed pairs: "rightIdx.dateIdx,rightIdx.dateIdx"
}

const cpToChar = (cp: string) =>
  String.fromCodePoint(...cp.split('-').map((h) => parseInt(h, 16)))

const cpToPath = (cp: string) => 'u' + cp.replaceAll('-', '-u')

const EmojiKitchenBrowser: Component = () => {
  const [data, setData] = createSignal<KitchenData | null>(null)
  const [error, setError] = createSignal(false)
  const [a, setA] = createSignal<number | null>(null)
  const [b, setB] = createSignal<number | null>(null)
  const [activeSlot, setActiveSlot] = createSignal<'a' | 'b'>('a')
  const [copied, setCopied] = createSignal(false)
  const [imgLoading, setImgLoading] = createSignal(false)

  // adjacency: for emoji i -> Map(partner j -> [leftIdx, rightIdx, dateIdx])
  let adj: Map<number, Map<number, [number, number, number]>> = new Map()
  let pairCount = 0

  const buildAdj = (kd: KitchenData) => {
    adj = new Map()
    pairCount = 0
    kd.p.forEach((packed, left) => {
      if (!packed) return
      for (const item of packed.split(',')) {
        const [r, d] = item.split('.')
        const right = Number(r)
        const date = Number(d)
        pairCount++
        if (!adj.has(left)) adj.set(left, new Map())
        adj.get(left)!.set(right, [left, right, date])
        if (!adj.has(right)) adj.set(right, new Map())
        if (!adj.get(right)!.has(left)) adj.get(right)!.set(left, [left, right, date])
      }
    })
  }

  const combo = createMemo(() => {
    const kd = data()
    const ai = a()
    const bi = b()
    if (!kd || ai === null || bi === null) return null
    const hit = adj.get(ai)?.get(bi)
    if (!hit) return null
    const [left, right, date] = hit
    const l = cpToPath(kd.e[left])
    const r = cpToPath(kd.e[right])
    return {
      url: `https://www.gstatic.com/android/keyboard/emojikitchen/${kd.d[date]}/${l}/${l}_${r}.png`,
      alt: `${cpToChar(kd.e[ai])} combined with ${cpToChar(kd.e[bi])} in Emoji Kitchen style`,
    }
  })

  const partnersOfA = createMemo(() => {
    const ai = a()
    if (ai === null) return null
    return adj.get(ai) ?? new Map()
  })

  const syncUrl = () => {
    const kd = data()
    if (!kd) return
    const params = new URLSearchParams(window.location.search)
    if (a() !== null) params.set('a', kd.e[a()!]); else params.delete('a')
    if (b() !== null) params.set('b', kd.e[b()!]); else params.delete('b')
    history.replaceState(null, '', `${window.location.pathname}?${params}`)
  }

  const pick = (idx: number) => {
    if (activeSlot() === 'a') {
      setA(idx)
      setActiveSlot('b')
      if (b() !== null && !adj.get(idx)?.has(b()!)) setB(null)
    } else {
      setB(idx)
      setActiveSlot('a')
    }
    setImgLoading(true)
    syncUrl()
  }

  const random = () => {
    const kd = data()
    if (!kd) return
    const lefts = [...adj.keys()]
    const l = lefts[Math.floor(Math.random() * lefts.length)]
    const partners = [...adj.get(l)!.keys()]
    const r = partners[Math.floor(Math.random() * partners.length)]
    setA(l)
    setB(r)
    setImgLoading(true)
    syncUrl()
  }

  onMount(async () => {
    try {
      const res = await fetch('/kitchen-data.json')
      const kd: KitchenData = await res.json()
      buildAdj(kd)
      setData(kd)
      const params = new URLSearchParams(window.location.search)
      const pa = kd.e.indexOf(params.get('a') ?? '')
      const pb = kd.e.indexOf(params.get('b') ?? '')
      if (pa >= 0 && pb >= 0 && adj.get(pa)?.has(pb)) {
        setA(pa)
        setB(pb)
        setImgLoading(true)
      } else {
        random()
      }
    } catch {
      setError(true)
    }
  })

  const fetchBlob = async () => {
    const c = combo()
    if (!c) return null
    const res = await fetch(c.url)
    return await res.blob()
  }

  const copyImage = async () => {
    try {
      const blob = await fetchBlob()
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      setCopied(true)
      track('copy', { tool: 'kitchen', content_type: 'sticker' })
      setTimeout(() => setCopied(false), 1200)
    } catch {
      const c = combo()
      if (c) window.open(c.url, '_blank', 'noopener')
    }
  }

  const download = async () => {
    try {
      const blob = await fetchBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'emoji-kitchen-combo.png'
      link.click()
      URL.revokeObjectURL(url)
      track('export_png', { tool: 'kitchen' })
    } catch {
      const c = combo()
      if (c) window.open(c.url, '_blank', 'noopener')
    }
  }

  return (
    <div class="combiner card">
      <Show
        when={data()}
        fallback={
          <p class="random-hint" role="status">
            {error() ? 'Could not load the combo database — please refresh the page.' : 'Loading 100,000+ Emoji Kitchen combos…'}
          </p>
        }
      >
        <div class="combiner-slots">
          <button
            class="combiner-slot"
            classList={{ active: activeSlot() === 'a' }}
            onClick={() => setActiveSlot('a')}
            aria-label={`First emoji${a() !== null ? `, currently ${cpToChar(data()!.e[a()!])}` : ''}. Click, then choose from the grid.`}
          >{a() !== null ? cpToChar(data()!.e[a()!]) : '?'}</button>
          <span class="combiner-plus" aria-hidden="true">+</span>
          <button
            class="combiner-slot"
            classList={{ active: activeSlot() === 'b' }}
            onClick={() => setActiveSlot('b')}
            aria-label={`Second emoji${b() !== null ? `, currently ${cpToChar(data()!.e[b()!])}` : ''}. Click, then choose from the grid.`}
          >{b() !== null ? cpToChar(data()!.e[b()!]) : '?'}</button>
          <button class="btn" onClick={() => { random(); track('randomize', { tool: 'kitchen' }) }}>Random combo</button>
          <button class="btn" onClick={copyImage}>{copied() ? 'Copied!' : 'Copy sticker'}</button>
          <button class="btn btn-primary" onClick={download}>Download PNG</button>
        </div>

        <div class="combiner-main">
          <div class="maker-canvas-wrap" style="min-height:240px">
            <Show
              when={combo()}
              fallback={<p class="random-hint">Pick two emojis — greyed-out ones have no mashup with your first pick.</p>}
            >
              <img
                src={combo()!.url}
                alt={combo()!.alt}
                width="240"
                height="240"
                style={{ opacity: imgLoading() ? 0.4 : 1, transition: 'opacity 120ms' }}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)}
              />
            </Show>
          </div>

          <div>
            <p class="random-hint">
              {pairCount.toLocaleString()} official combos · tap a slot, then an emoji
            </p>
            <div class="combiner-picker" style="max-height:320px" role="listbox" aria-label="Emoji Kitchen supported emojis">
              <For each={data()!.e}>
                {(cp, i) => {
                  const disabled = createMemo(() => {
                    const pa = partnersOfA()
                    return activeSlot() === 'b' && pa !== null && !pa.has(i())
                  })
                  return (
                    <button
                      class="combiner-emoji"
                      style={{ opacity: disabled() ? 0.25 : 1 }}
                      disabled={disabled()}
                      onClick={() => pick(i())}
                      aria-label={`Choose ${cpToChar(cp)}`}
                    >{cpToChar(cp)}</button>
                  )
                }}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default EmojiKitchenBrowser
