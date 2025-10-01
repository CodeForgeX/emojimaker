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
      canvas.classList.add('animation')
      setTimeout(() => {
        canvas.classList.remove('animation')
      }, 500)
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
    <div class="app-container">
      <Header />

      {/* 主容器 - 优化为双栏布局 */}
      <main class="main-container">

        {/* 左侧：预览和操作区 */}
        <aside class="preview-section">
          {/* 紧凑的预览区 */}
          <div class="canvas-container">
            <canvas ref={canvas} width={canvasSize} height={canvasSize} class="emoji-canvas animation"></canvas>
          </div>

          {/* 垂直排列的操作按钮 */}
          <div class="action-buttons">
            <button
              class="action-btn primary"
              onClick={getRandom}
              title="Random Emoji"
            >
              <div i-material-symbols-refresh text-xl />
              <span>Random</span>
            </button>

            <button
              class="action-btn"
              onClick={() => canvas.toBlob(exportImage)}
              title="Export as PNG"
            >
              <div i-material-symbols-download-rounded text-xl />
              <span>PNG</span>
            </button>

            <button
              class="action-btn"
              onClick={() => toSVGBlob().then(exportImage)}
              title="Export as SVG"
            >
              <div i-material-symbols-download-rounded text-xl />
              <span>SVG</span>
            </button>
          </div>
        </aside>

        {/* 右侧：编辑选项区 */}
        <section class="editor-section">
          {/* 紧凑的标签栏 */}
          <nav class="tabs-container">
            <For each={tabs}>
              {(item, index) => (
                <button
                  class={`tab-btn ${selectedTab() === item ? 'active' : ''}`}
                  onClick={() => setSelectedTab(item)}
                  title={item.charAt(0).toUpperCase() + item.slice(1)}
                >
                  <Show when={selectedImage()[item]}>
                    <img src={selectedImage()[item]} alt={selectedTab() + index()} class="tab-icon"></img>
                  </Show>
                </button>
              )}
            </For>
          </nav>

          {/* 优化的选项网格 */}
          <div class="options-container">
            <div class="options-grid">
              <Switch>
                <For each={Object.keys(images())}>
                  {(tab: EmojiSlice) => (
                    <Match when={tab === selectedTab()}>
                      <For each={images()[tab]}>
                        {(item, index) => (
                          <button
                            class={`option-btn ${index() === selectedIndex()[selectedTab()] ? 'selected' : ''}`}
                            onClick={[handleSelectItem, {tab: selectedTab(), index: index() }]}
                          >
                            <Show when={item}>
                              <img src={item} alt={selectedTab() + index()} class="option-icon"></img>
                            </Show>
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

      {/* 精简的 Footer */}
      <Footer />
    </div>
  )
}

export default App