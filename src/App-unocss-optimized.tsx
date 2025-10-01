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
    <>
      <Header />

      {/* 主容器 - 优化的双栏布局，确保单屏显示 */}
      <main
        class="grid grid-cols-[180px_1fr] gap-4 h-[calc(100vh-8rem)]"
        px-4 py-4
        bg="white/90 dark:dark/90"
        backdrop-blur-lg rounded-xl
        shadow="2xl black/10"
        mx-auto max-w-5xl
        md="grid-cols-[200px_1fr] gap-6 px-6 py-5"
      >
        {/* 左侧：预览和操作区 */}
        <aside flex="~ col" items-center gap-3>
          {/* 紧凑的预览区 */}
          <div
            flex items-center justify-center
            w="140px" h="140px"
            md="w-160px h-160px"
            border="2 neutral-400/20"
            rounded-xl
            bg="gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20"
          >
            <canvas
              ref={canvas}
              width={canvasSize}
              height={canvasSize}
              class="animation"
              w="120px" h="120px"
              md="w-128px h-128px"
            ></canvas>
          </div>

          {/* 操作按钮组 - 垂直布局 */}
          <div flex="~ col" gap-2 w-full>
            {/* 随机按钮 - 主要操作 */}
            <button
              flex items-center justify-center gap-2
              w-full h-10 rounded-lg
              bg="gradient-to-r from-violet-500 to-purple-500"
              text="white sm font-semibold"
              cursor-pointer transition-all
              hover="shadow-lg shadow-violet-500/30 scale-105"
              active="scale-95"
              onClick={getRandom}
            >
              <div i-material-symbols-refresh text-lg />
              <span>Random</span>
            </button>

            {/* 导出按钮组 */}
            <div flex gap-2>
              <button
                flex="1" flex items-center justify-center gap-1
                h-9 rounded-lg
                bg="neutral-100 dark:neutral-700"
                text="xs neutral-700 dark:neutral-200 font-medium"
                cursor-pointer transition-all
                hover="bg-violet-100 dark:bg-violet-800/50"
                onClick={() => canvas.toBlob(exportImage)}
              >
                <div i-material-symbols-download-rounded text-base />
                <span>PNG</span>
              </button>

              <button
                flex="1" flex items-center justify-center gap-1
                h-9 rounded-lg
                bg="neutral-100 dark:neutral-700"
                text="xs neutral-700 dark:neutral-200 font-medium"
                cursor-pointer transition-all
                hover="bg-violet-100 dark:bg-violet-800/50"
                onClick={() => toSVGBlob().then(exportImage)}
              >
                <div i-material-symbols-download-rounded text-base />
                <span>SVG</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 右侧：编辑选项区 */}
        <section flex="~ col" min-h-0 gap-3>
          {/* 紧凑的标签栏 */}
          <nav
            flex gap-2 pb-3
            border-b="1 neutral-200 dark:neutral-700"
          >
            <For each={tabs}>
              {(item, index) => (
                <button
                  flex items-center justify-center
                  h-10 w-10 rounded-lg
                  cursor-pointer transition-all
                  border="2 transparent"
                  hover="bg-violet-100 dark:bg-violet-800/30 border-violet-300"
                  class={selectedTab() === item
                    ? 'bg-violet-100 dark:bg-violet-800/50 border-violet-400 shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800'}
                  onClick={() => setSelectedTab(item)}
                  title={item.charAt(0).toUpperCase() + item.slice(1)}
                >
                  <Show when={selectedImage()[item]}>
                    <img src={selectedImage()[item]} alt={selectedTab() + index()} w-7 h-7></img>
                  </Show>
                </button>
              )}
            </For>
          </nav>

          {/* 选项网格 - 自适应高度，优化滚动 */}
          <div
            class="flex-1 overflow-y-auto overflow-x-hidden pr-2"
            style={{
              "scrollbar-width": "thin",
              "scrollbar-color": "rgba(139, 92, 246, 0.3) transparent"
            }}
          >
            <div
              class="grid gap-2"
              style={{
                "grid-template-columns": "repeat(auto-fill, minmax(48px, 1fr))"
              }}
            >
              <Switch>
                <For each={Object.keys(images())}>
                  {(tab: EmojiSlice) => (
                    <Match when={tab === selectedTab()}>
                      <For each={images()[tab]}>
                        {(item, index) => (
                          <button
                            flex items-center justify-center
                            class="aspect-square"
                            rounded-lg border-2
                            cursor-pointer transition-all
                            hover="bg-violet-100 dark:bg-violet-800/30 border-violet-400 scale-105"
                            style={{
                              "background": index() === selectedIndex()[selectedTab()]
                                ? "rgba(196, 181, 253, 0.3)"
                                : "rgba(243, 244, 246, 0.8)",
                              "border-color": index() === selectedIndex()[selectedTab()]
                                ? "rgb(139, 92, 246)"
                                : "transparent",
                              "box-shadow": index() === selectedIndex()[selectedTab()]
                                ? "0 0 0 3px rgba(139, 92, 246, 0.1)"
                                : "none"
                            }}
                            dark:style={{
                              "background": index() === selectedIndex()[selectedTab()]
                                ? "rgba(139, 92, 246, 0.3)"
                                : "rgba(75, 85, 99, 0.5)"
                            }}
                            onClick={[handleSelectItem, {tab: selectedTab(), index: index() }]}
                          >
                            <Show when={item}>
                              <img src={item} alt={selectedTab() + index()} w-8 h-8></img>
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

      <Footer />
    </>
  )
}

export default App