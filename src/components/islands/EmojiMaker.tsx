import type { Component } from 'solid-js'
import { createSignal, createEffect, onMount, For, Show } from 'solid-js'
import { track } from '../../lib/track'
import './islands.css'

type SvgImageModule = typeof import('*.svg')
type ImportModuleFunction = () => Promise<SvgImageModule>

const CANVAS_SIZE = 640

const pathToImage = (path: string) => {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (path === '') {
      resolve(null)
      return
    }
    const img = new Image(400, 400)
    img.src = path
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
  })
}

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map((importFn) => importFn())
  const loadedModules = await Promise.all(imports)
  // Astro's asset pipeline turns `default` into ImageMetadata ({ src, ... });
  // plain Vite returns a URL string. Support both.
  return loadedModules.map((module) => {
    const d = module.default as unknown
    return typeof d === 'string' ? d : (d as { src: string }).src
  })
}

type EmojiSlice = 'head' | 'eyes' | 'eyebrows' | 'mouth' | 'detail'
const tabs: EmojiSlice[] = ['head', 'eyes', 'eyebrows', 'mouth', 'detail']

export interface EmojiMakerProps {
  /** PNG export sizes in px. First entry is the default. */
  sizes?: number[]
  /** Prefix for downloaded file names, e.g. "slack-emoji". */
  filePrefix?: string
  /** Show a "Download all sizes" button (useful for Twitch's 112/56/28). */
  allSizesButton?: boolean
}

const EmojiMaker: Component<EmojiMakerProps> = (props) => {
  const sizes = () => props.sizes?.length ? props.sizes : [CANVAS_SIZE]
  const filePrefix = () => props.filePrefix ?? 'emoji'

  const [selectedTab, setSelectedTab] = createSignal<EmojiSlice>('head')
  const [exportSize, setExportSize] = createSignal(0) // index into sizes()
  const [images, setImages] = createSignal<Record<EmojiSlice, string[]>>({
    head: [], eyes: [], eyebrows: [], mouth: [], detail: [],
  })
  const [selectedIndex, setSelectedIndex] = createSignal<Record<EmojiSlice, number>>({
    head: 0, eyes: 0, eyebrows: 0, mouth: 0, detail: 0,
  })

  const selectedImage = () => ({
    head: images().head[selectedIndex().head],
    eyes: images().eyes[selectedIndex().eyes],
    eyebrows: images().eyebrows[selectedIndex().eyebrows],
    mouth: images().mouth[selectedIndex().mouth],
    detail: images().detail[selectedIndex().detail],
  })

  const loadImage = async () => {
    const headModules = import.meta.glob<SvgImageModule>('../../assets/head/*.svg')
    const eyesModules = import.meta.glob<SvgImageModule>('../../assets/eyes/*.svg')
    const eyebrowsModules = import.meta.glob<SvgImageModule>('../../assets/eyebrows/*.svg')
    const mouthModules = import.meta.glob<SvgImageModule>('../../assets/mouth/*.svg')
    const detailModules = import.meta.glob<SvgImageModule>('../../assets/details/*.svg')
    const [head, eyes, eyebrows, mouth, detail] = await Promise.all([
      resolveImportGlobModule(headModules),
      resolveImportGlobModule(eyesModules),
      resolveImportGlobModule(eyebrowsModules),
      resolveImportGlobModule(mouthModules),
      resolveImportGlobModule(detailModules),
    ])
    setImages({
      head,
      eyes: ['', ...eyes],
      eyebrows: ['', ...eyebrows],
      mouth: ['', ...mouth],
      detail: ['', ...detail],
    })
    getRandom()
  }

  onMount(() => { loadImage() })

  let canvas!: HTMLCanvasElement

  createEffect(() => {
    const paths = selectedImage()
    Promise.all([
      pathToImage(paths.head),
      pathToImage(paths.eyes),
      pathToImage(paths.eyebrows),
      pathToImage(paths.mouth),
      pathToImage(paths.detail),
    ]).then((imgs) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      imgs.forEach((img) => {
        if (img) ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      })
      canvas.classList.add('canvas-pop')
      setTimeout(() => canvas.classList.remove('canvas-pop'), 500)
    })
  })

  const handleSelectItem = ({ tab, index }: { tab: EmojiSlice; index: number }) => {
    setSelectedIndex({ ...selectedIndex(), [tab]: index })
  }

  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  const getRandom = () => {
    setSelectedIndex({
      head: randomInt(0, images().head.length - 1),
      eyes: randomInt(0, images().eyes.length - 1),
      eyebrows: randomInt(0, images().eyebrows.length - 1),
      mouth: randomInt(0, images().mouth.length - 1),
      detail: randomInt(0, images().detail.length - 1),
    })
  }

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPng = (size: number) => {
    const target = document.createElement('canvas')
    target.width = size
    target.height = size
    const ctx = target.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(canvas, 0, 0, size, size)
    target.toBlob((blob) => {
      if (!blob) return
      downloadBlob(blob, `${filePrefix()}-${size}x${size}.png`)
      track('export_png', { tool: 'maker', size, file_prefix: filePrefix() })
    })
  }

  const exportAllSizes = () => { sizes().forEach((s) => exportPng(s)) }

  const toSVGBlob = async () => {
    const parser = new DOMParser()
    const parts = await Promise.all(
      Object.values(selectedImage())
        .filter((p) => p !== '' && p !== undefined)
        .map((image) => fetch(image).then((r) => r.text())),
    )
    const NS = 'http://www.w3.org/2000/svg'
    const out = document.createElementNS(NS, 'svg')
    out.setAttribute('width', '32')
    out.setAttribute('height', '32')
    out.setAttribute('viewBox', '0 0 32 32')
    out.setAttribute('fill', 'none')
    out.setAttribute('xmlns', NS)
    parts.forEach((text) => {
      const doc = parser.parseFromString(text, 'image/svg+xml')
      ;[...doc.documentElement.childNodes].forEach((node) => out.appendChild(node.cloneNode(true)))
    })
    return new Blob([out.outerHTML], { type: 'image/svg+xml' })
  }

  return (
    <div class="maker card">
      <section class="maker-preview" aria-labelledby="maker-preview-h">
        <h2 id="maker-preview-h" class="visually-hidden">Emoji preview and export</h2>
        <div class="maker-canvas-wrap">
          <canvas
            ref={canvas}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            class="maker-canvas"
            role="img"
            aria-label="Preview of your custom emoji"
          ></canvas>
        </div>
        <div class="maker-actions">
          <button class="btn btn-primary" onClick={() => { getRandom(); track('randomize', { tool: 'maker' }) }} aria-label="Generate a random emoji">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22" /><path d="m18 2 4 4-4 4" /><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" /><path d="M22 18h-5.9c-1.3 0-2.5-.6-3.3-1.7l-.5-.8" /><path d="m18 14 4 4-4 4" /></svg>
            Randomize
          </button>
          <Show when={sizes().length > 1}>
            <label class="maker-size">
              <span class="visually-hidden">PNG export size</span>
              <select
                value={String(exportSize())}
                onChange={(e) => setExportSize(Number(e.currentTarget.value))}
                aria-label="PNG export size"
              >
                <For each={sizes()}>
                  {(s, i) => <option value={String(i())}>{s}×{s}</option>}
                </For>
              </select>
            </label>
          </Show>
          <button class="btn" onClick={() => exportPng(sizes()[exportSize()])} aria-label={`Download emoji as ${sizes()[exportSize()]} pixel PNG`}>
            PNG
          </button>
          <button class="btn" onClick={() => toSVGBlob().then((b) => { downloadBlob(b, `${filePrefix()}.svg`); track('export_svg', { tool: 'maker', file_prefix: filePrefix() }) })} aria-label="Download emoji as SVG vector">
            SVG
          </button>
          <Show when={props.allSizesButton && sizes().length > 1}>
            <button class="btn" onClick={exportAllSizes}>
              All sizes ({sizes().map((s) => `${s}px`).join(' + ')})
            </button>
          </Show>
        </div>
      </section>

      <section class="maker-editor" aria-labelledby="maker-editor-h">
        <h2 id="maker-editor-h" class="visually-hidden">Customize emoji parts</h2>
        <div class="maker-tabs" role="tablist" aria-label="Emoji part categories">
          <For each={tabs}>
            {(item) => (
              <button
                class="maker-tab"
                classList={{ active: selectedTab() === item }}
                onClick={() => setSelectedTab(item)}
                role="tab"
                aria-selected={selectedTab() === item}
                aria-controls={`panel-${item}`}
                id={`tab-${item}`}
              >
                <span class="maker-tab-thumb" aria-hidden="true">
                  <Show when={selectedImage()[item]}>
                    <img src={selectedImage()[item]} alt="" width="28" height="28" loading="lazy" />
                  </Show>
                </span>
                {item}
              </button>
            )}
          </For>
        </div>
        <div
          class="maker-options"
          role="tabpanel"
          id={`panel-${selectedTab()}`}
          aria-labelledby={`tab-${selectedTab()}`}
        >
          <For each={images()[selectedTab()]}>
            {(item, index) => (
              <button
                class="maker-option"
                classList={{ selected: index() === selectedIndex()[selectedTab()] }}
                onClick={[handleSelectItem, { tab: selectedTab(), index: index() }]}
                aria-label={`${selectedTab()} option ${index() + 1}`}
                aria-pressed={index() === selectedIndex()[selectedTab()]}
              >
                <Show when={item} fallback={<span class="maker-none" aria-hidden="true">∅</span>}>
                  <img src={item} alt={`${selectedTab()} style ${index() + 1}`} width="40" height="40" loading="lazy" />
                </Show>
              </button>
            )}
          </For>
        </div>
      </section>
    </div>
  )
}

export default EmojiMaker
