import { Component, createSignal, createEffect, onMount } from 'solid-js'
import { For, Switch, Match, Show } from 'solid-js'
import SelectButton from './components/SelectButton'
import Header from './components/Header'
import Footer from './components/Footer'

type SvgImageModule = typeof import('*.svg')
type ImportModuleFunction = () => Promise<SvgImageModule>

const pathToImage = (path: string) => {
  return new Promise<HTMLImageElement | null>(resolve => {
    if (path === '') {
      resolve(null)
    }
    const img = new Image(400, 400)
    img.src = path
    img.onload = (e) => {
      console.log(e)
      resolve(img)
    }
  })
}

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)

  return loadedModules.map(module => module.default)
}

type EmojiSlice = 'head' | 'eyes' | 'eyebrows' | 'mouth' | 'detail'
const tabs: EmojiSlice[] = ['head', 'eyes', 'eyebrows', 'mouth', 'detail']

const App: Component = () => {
  const [selectedTab, setSelectedTab] = createSignal<EmojiSlice>('head')
  const [images, setImages] = createSignal({
    head: [],
    eyes: [],
    eyebrows: [],
    mouth: [],
    detail: [],
  })
  const [selectedIndex, setSelectedIndex] = createSignal({
    head: 0,
    eyes: 0,
    eyebrows: 0,
    mouth: 0,
    detail: 0,
  })
  const selectedImage = () => {
    return {
      head: images().head[selectedIndex().head],
      eyes: images().eyes[selectedIndex().eyes],
      eyebrows: images().eyebrows[selectedIndex().eyebrows],
      mouth: images().mouth[selectedIndex().mouth],
      detail: images().detail[selectedIndex().detail],
    }
  }

  const loadImage = async () => {
    // head
    const headModules = import.meta.glob<SvgImageModule>('./assets/head/*.svg')
    const fullHeadImages = await resolveImportGlobModule(headModules)
    // eyes
    const eyesModules = import.meta.glob<SvgImageModule>('./assets/eyes/*.svg')
    const fullEyesImages = await resolveImportGlobModule(eyesModules)
    // eyebrows
    const eyebrowsModules = import.meta.glob<SvgImageModule>('./assets/eyebrows/*.svg')
    const fullEyebrowsImages = await resolveImportGlobModule(eyebrowsModules)
    // mouth
    const mouthModules = import.meta.glob<SvgImageModule>('./assets/mouth/*.svg')
    const fullMouthImages = await resolveImportGlobModule(mouthModules)
    // detail
    const detailModules = import.meta.glob<SvgImageModule>('./assets/details/*.svg')
    const fullDetailImages = await resolveImportGlobModule(detailModules)
    setImages({
      head: fullHeadImages,
      eyes: ['', ...fullEyesImages],
      eyebrows: ['', ...fullEyebrowsImages],
      mouth: ['', ...fullMouthImages],
      detail: ['', ...fullDetailImages],
    })
    getRandom()
  }

  // lifecycle
  onMount(() => {
    loadImage()
  })

  let canvas: HTMLCanvasElement, canvasSize = 640;

  createEffect(() => {
    const headPath = selectedImage().head
    const eyesPath = selectedImage().eyes
    const eyebrowsPath = selectedImage().eyebrows
    const mouthPath = selectedImage().mouth
    const detailPath = selectedImage().detail
    Promise.all([
      pathToImage(headPath),
      pathToImage(eyesPath),
      pathToImage(eyebrowsPath),
      pathToImage(mouthPath),
      pathToImage(detailPath)
    ]).then(images => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      images.forEach(img => {
        img && ctx.drawImage(img, 0, 0, canvasSize, canvasSize)
      })
      canvas.classList.add('canvas-pop')
      setTimeout(() => {
        canvas.classList.remove('canvas-pop')
      }, 600)
    })
  })

  const handleSelectItem = ({tab, index}: {tab: string, index: number}) => {
    setSelectedIndex({ ...selectedIndex(), [tab]: index })
  }

  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const getRandom = () => {
    const randomIndexes = {
      head: randomInt(0, images().head.length - 1),
      eyes: randomInt(0, images().eyes.length - 1),
      eyebrows: randomInt(0, images().eyebrows.length - 1),
      mouth: randomInt(0, images().mouth.length - 1),
      detail: randomInt(0, images().detail.length - 1),
    }
    setSelectedIndex(randomIndexes)
  }

  const exportImage = (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `emoji_${Date.now()}`
      a.click()
  }

  const toSVGBlob = async () => {
      const parser = new DOMParser()
      const documents = await Promise.all(Object.values(selectedImage()).map(image => fetch(image).then(response => response.text())))
      const svg = (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {documents.flatMap(document => [...parser.parseFromString(document, 'image/svg+xml').documentElement.childNodes])}
        </svg>
      ) as HTMLElement
      return new Blob([svg.outerHTML], {type: 'image/svg+xml'})
  }

  return (
    <div class="page-layout">
      <aside class="ad-column ad-column--left" aria-hidden="true" data-slot="ad-left"></aside>

      <div class="page-content">
        <Header />

        {/* 主容器 - Fluent Design 风格 */}
        <main class="emoji-maker-container" aria-label="Emoji creation workspace - customize faces with heads, eyes, eyebrows, mouths and details">
          {/* 左侧：预览和操作区 */}
          <section class="preview-section" aria-labelledby="preview-heading">
            <h2 id="preview-heading" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
              Emoji Preview and Export
            </h2>
            {/* 精致的预览区 */}
            <div class="canvas-container">
              <div class="canvas-glow"></div>
              <div class="canvas-wrapper">
                <canvas
                  ref={canvas}
                  width={canvasSize}
                  height={canvasSize}
                  class="emoji-canvas"
                  role="img"
                  aria-label="Custom emoji preview"
                ></canvas>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div class="action-buttons">
              {/* 随机按钮 - 主要操作 */}
              <button
                class="btn-primary btn-random"
                onClick={getRandom}
                aria-label="Generate random emoji combination"
              >
                <span class="btn-icon-wrapper" aria-hidden="true">
                  <div i-material-symbols-refresh />
                </span>
                <span class="btn-text">Randomize</span>
                <span class="btn-shine"></span>
              </button>

              {/* 导出按钮组 */}
              <div class="export-group">
                <button
                  class="btn-export"
                  onClick={() => canvas.toBlob(exportImage)}
                  aria-label="Download emoji as PNG image"
                >
                  <div i-material-symbols-download-rounded aria-hidden="true" />
                  <span>PNG</span>
                </button>

                <button
                  class="btn-export"
                  onClick={() => toSVGBlob().then(exportImage)}
                  aria-label="Download emoji as SVG vector"
                >
                  <div i-material-symbols-download-rounded aria-hidden="true" />
                  <span>SVG</span>
                </button>
              </div>
            </div>
          </section>

          {/* 右侧：编辑选项区 */}
          <section class="editor-section" aria-labelledby="editor-heading">
            <h2 id="editor-heading" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
              Customize Emoji Parts
            </h2>
            {/* 精致的标签栏 */}
            <nav class="tab-bar" aria-label="Emoji part categories">
              <For each={tabs}>
                {(item, index) => (
                  <button
                    class={`tab-button ${selectedTab() === item ? 'active' : ''}`}
                    onClick={() => setSelectedTab(item)}
                    role="tab"
                    aria-selected={selectedTab() === item}
                    aria-controls={`panel-${item}`}
                    id={`tab-${item}`}
                  >
                    <div class="tab-icon-wrapper" aria-hidden="true">
                      <Show when={selectedImage()[item]}>
                        <img src={selectedImage()[item]} alt={`Current ${item} selection preview`} />
                      </Show>
                    </div>
                    <span class="tab-label">{item}</span>
                  </button>
                )}
              </For>
            </nav>

            {/* 选项网格 - 精致滚动 */}
            <div class="options-container">
              <div
                class="options-grid"
                role="tabpanel"
                id={`panel-${selectedTab()}`}
                aria-labelledby={`tab-${selectedTab()}`}
              >
                <Switch>
                  <For each={Object.keys(images())}>
                    {(tab: EmojiSlice) => (
                      <Match when={tab === selectedTab()}>
                        <For each={images()[tab]}>
                          {(item, index) => (
                            <button
                              class={`option-item ${index() === selectedIndex()[selectedTab()] ? 'selected' : ''}`}
                              onClick={[handleSelectItem, {tab: selectedTab(), index: index() }]}
                              aria-label={`${selectedTab()} option ${index() + 1}${index() === selectedIndex()[selectedTab()] ? ' (selected)' : ''}`}
                              aria-pressed={index() === selectedIndex()[selectedTab()]}
                            >
                              <div class="option-inner">
                                <Show when={item}>
                                  <img src={item} alt={`${selectedTab()} style ${index() + 1}`} />
                                </Show>
                              </div>
                              <div class="option-hover-effect"></div>
                            </button>
                          )}
                        </For>
                      </Match>
                    )}
                  </For>
                </Switch>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <aside class="ad-column ad-column--right" aria-hidden="true" data-slot="ad-right"></aside>
    </div>
  )
}

export default App
