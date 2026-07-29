import type { Component } from 'solid-js'
import { createSignal, createEffect, For, Show } from 'solid-js'
import './islands.css'

const SIZE = 640

const EMOJI_SET = [
  '😀','😂','🥹','😍','🥰','😎','🤩','😜','🤪','😇','🥳','😭','😡','🤯','😱','🥶','🥵','😴','🤤','🫠',
  '😶‍🌫️','🤔','🫡','🤗','😈','👻','💀','🤡','👽','🤖','💩','🎃','😺','😻','🙀','😿',
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦄','🐙','🦋',
  '🌸','🌹','🌵','🍄','🌈','⭐','🌟','⚡','🔥','❄️','🌊','🌙','☀️','☁️',
  '🍎','🍉','🍓','🍑','🍍','🥑','🌶️','🍔','🍕','🌮','🍩','🍪','🎂','🍦','☕','🧋',
  '⚽','🏀','🎮','🎲','🎸','🎧','🎨','📚','💻','📱','🚀','✈️','🚗','🏆','💎','🎁','🎈','🎉',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💖','💘','💝','✨','💫','💥','💯','✅','❌','❓','‼️',
]
const EMOJIS = EMOJI_SET

const PRESETS: [string, string][] = [
  ['🐱', '🔥'],
  ['😀', '🌧️'],
  ['💀', '☕'],
  ['🥑', '🎉'],
  ['🤖', '❤️'],
  ['🍕', '👑'],
]

type Mode = 'overlay' | 'side'

const EmojiCombiner: Component = () => {
  const [emojiA, setEmojiA] = createSignal('🐱')
  const [emojiB, setEmojiB] = createSignal('🔥')
  const [activeSlot, setActiveSlot] = createSignal<'a' | 'b'>('a')
  const [mode, setMode] = createSignal<Mode>('overlay')
  const [scaleB, setScaleB] = createSignal(55) // % of canvas
  const [offsetX, setOffsetX] = createSignal(22) // -50..50 (% of canvas)
  const [offsetY, setOffsetY] = createSignal(22)
  const [opacityB, setOpacityB] = createSignal(100)

  let canvas!: HTMLCanvasElement

  const drawEmoji = (
    ctx: CanvasRenderingContext2D,
    emoji: string,
    x: number,
    y: number,
    px: number,
    alpha = 1,
  ) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `${px}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, x, y + px * 0.06)
    ctx.restore()
  }

  createEffect(() => {
    const a = emojiA()
    const b = emojiB()
    const m = mode()
    const sB = scaleB() / 100
    const ox = offsetX() / 100
    const oy = offsetY() / 100
    const alB = opacityB() / 100
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)
    if (m === 'overlay') {
      drawEmoji(ctx, a, SIZE / 2, SIZE / 2, SIZE * 0.72)
      drawEmoji(ctx, b, SIZE / 2 + SIZE * ox, SIZE / 2 + SIZE * oy, SIZE * 0.72 * sB, alB)
    } else {
      drawEmoji(ctx, a, SIZE * 0.3, SIZE / 2, SIZE * 0.5)
      drawEmoji(ctx, b, SIZE * 0.7, SIZE / 2, SIZE * 0.5 * Math.max(sB, 0.4), alB)
    }
  })

  const pick = (emoji: string) => {
    if (activeSlot() === 'a') {
      setEmojiA(emoji)
      setActiveSlot('b')
    } else {
      setEmojiB(emoji)
      setActiveSlot('a')
    }
  }

  const swap = () => {
    const a = emojiA()
    setEmojiA(emojiB())
    setEmojiB(a)
  }

  const randomPair = () => {
    const r = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    setEmojiA(r())
    setEmojiB(r())
  }

  const download = () => {
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `emoji-mashup-${SIZE}x${SIZE}.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div class="combiner card">
      <div class="combiner-slots">
        <button
          class="combiner-slot"
          classList={{ active: activeSlot() === 'a' }}
          onClick={() => setActiveSlot('a')}
          aria-label={`First emoji, currently ${emojiA()}. Click, then choose from the grid.`}
        >{emojiA()}</button>
        <span class="combiner-plus" aria-hidden="true">+</span>
        <button
          class="combiner-slot"
          classList={{ active: activeSlot() === 'b' }}
          onClick={() => setActiveSlot('b')}
          aria-label={`Second emoji, currently ${emojiB()}. Click, then choose from the grid.`}
        >{emojiB()}</button>
        <button class="btn" onClick={swap}>Swap</button>
        <button class="btn" onClick={randomPair}>Random pair</button>
        <button class="btn btn-primary" onClick={download}>Download PNG</button>
      </div>

      <div class="combiner-main">
        <div>
          <div class="maker-canvas-wrap">
            <canvas
              ref={canvas}
              width={SIZE}
              height={SIZE}
              class="maker-canvas"
              role="img"
              aria-label={`Combined emoji preview: ${emojiA()} merged with ${emojiB()}`}
            ></canvas>
          </div>
          <div class="combiner-controls" style="margin-top:1rem">
            <div class="combiner-modes" role="group" aria-label="Layout mode">
              <button class="mode-btn" classList={{ active: mode() === 'overlay' }} onClick={() => setMode('overlay')}>Overlay</button>
              <button class="mode-btn" classList={{ active: mode() === 'side' }} onClick={() => setMode('side')}>Side by side</button>
            </div>
            <label>
              Size B
              <input type="range" min="25" max="110" value={scaleB()} onInput={(e) => setScaleB(Number(e.currentTarget.value))} />
              <span>{scaleB()}%</span>
            </label>
            <Show when={mode() === 'overlay'}>
              <label>
                Move X
                <input type="range" min="-45" max="45" value={offsetX()} onInput={(e) => setOffsetX(Number(e.currentTarget.value))} />
                <span>{offsetX()}</span>
              </label>
              <label>
                Move Y
                <input type="range" min="-45" max="45" value={offsetY()} onInput={(e) => setOffsetY(Number(e.currentTarget.value))} />
                <span>{offsetY()}</span>
              </label>
            </Show>
            <label>
              Opacity B
              <input type="range" min="15" max="100" value={opacityB()} onInput={(e) => setOpacityB(Number(e.currentTarget.value))} />
              <span>{opacityB()}%</span>
            </label>
          </div>
        </div>

        <div>
          <p class="random-hint">Pick a slot above, then tap an emoji — or start from a classic pair:</p>
          <div class="combiner-presets" style="margin:0.5rem 0 0.9rem">
            <For each={PRESETS}>
              {([a, b]) => (
                <button class="preset-chip" onClick={() => { setEmojiA(a); setEmojiB(b) }} aria-label={`Use preset ${a} plus ${b}`}>
                  {a}+{b}
                </button>
              )}
            </For>
          </div>
          <div class="combiner-picker" role="listbox" aria-label="Emoji choices">
            <For each={EMOJIS}>
              {(emoji) => (
                <button class="combiner-emoji" onClick={() => pick(emoji)} aria-label={`Choose ${emoji}`}>
                  {emoji}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmojiCombiner
