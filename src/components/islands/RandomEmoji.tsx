import type { Component } from 'solid-js'
import { createSignal, For, onMount } from 'solid-js'
import './islands.css'

const POOL: Record<string, string[]> = {
  'Smileys & people': ['😀','😃','😄','😁','😆','🥹','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😭','😤','😡','🤬','🤯','😳','🥵','🥶','😱','😨','🤔','🫡','🤫','😶‍🌫️','🙄','😴','🤤','🫠','🤢','🤮','🤧','😷','🤠','😈','👻','💀','🤡','👽','🤖','💩','🙈','🙉','🙊'],
  'Animals & nature': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦉','🦄','🐝','🦋','🐌','🐙','🦑','🦀','🐡','🐬','🐳','🦈','🐊','🦓','🦒','🐘','🦏','🐪','🦘','🐿️','🦔','🌵','🎄','🌲','🍀','🍄','🌸','🌹','🌻','🌈','⭐','🌙','☀️','⚡','🔥','❄️','🌊'],
  'Food & drink': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🌶️','🌽','🥕','🥐','🍞','🧀','🥚','🥓','🥞','🍗','🍔','🍟','🍕','🌭','🌮','🌯','🥗','🍜','🍣','🍤','🍦','🍩','🍪','🎂','🍰','🧁','🍫','🍿','☕','🧋','🥤'],
  'Activities & objects': ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🥊','⛳','🎣','🎽','🛹','🛼','🎿','🎯','🎮','🕹️','🎲','🧩','🎭','🎨','🎬','🎤','🎧','🎸','🎹','🥁','🎺','📚','💻','📱','⌚','📷','🔭','🚀','✈️','🚁','🚗','🏎️','🚲','🏆','🥇','💎','🎁','🎈','🎉','🎊','🪩'],
  'Hearts & symbols': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💖','💗','💓','💞','💕','💘','💝','✨','💫','💥','💯','✅','☑️','✔️','❌','❓','❗','‼️','⚠️','♻️','🔱','⚜️','🔰','💠','🌀'],
}
const ALL = Object.values(POOL).flat()

const RandomEmoji: Component = () => {
  const [count, setCount] = createSignal(5)
  const [category, setCategory] = createSignal('All')
  const [result, setResult] = createSignal<string[]>([])
  const [copiedIdx, setCopiedIdx] = createSignal<number | null>(null)
  const [copiedAll, setCopiedAll] = createSignal(false)

  const pool = () => (category() === 'All' ? ALL : POOL[category()] ?? ALL)

  const roll = () => {
    const src = pool()
    const picked: string[] = []
    for (let i = 0; i < count(); i++) {
      picked.push(src[Math.floor(Math.random() * src.length)])
    }
    setResult(picked)
    setCopiedIdx(null)
    setCopiedAll(false)
  }

  onMount(roll)

  const copyOne = async (emoji: string, i: number) => {
    await navigator.clipboard.writeText(emoji)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 900)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(result().join(''))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1200)
  }

  return (
    <div class="random card">
      <div class="random-controls">
        <label>
          <span class="visually-hidden">How many emojis</span>
          <select value={String(count())} onChange={(e) => setCount(Number(e.currentTarget.value))} aria-label="How many random emojis to generate">
            <For each={[1, 3, 5, 10, 20]}>{(n) => <option value={String(n)}>{n} emoji{n > 1 ? 's' : ''}</option>}</For>
          </select>
        </label>
        <label>
          <span class="visually-hidden">Category</span>
          <select value={category()} onChange={(e) => setCategory(e.currentTarget.value)} aria-label="Emoji category">
            <option>All</option>
            <For each={Object.keys(POOL)}>{(c) => <option>{c}</option>}</For>
          </select>
        </label>
        <button class="btn btn-primary" onClick={roll}>Generate</button>
        <button class="btn" onClick={copyAll}>{copiedAll() ? 'Copied!' : 'Copy all'}</button>
      </div>
      <div class="random-output" aria-live="polite" aria-label="Random emoji results">
        <For each={result()}>
          {(emoji, i) => (
            <button
              class="random-item"
              classList={{ copied: copiedIdx() === i() }}
              onClick={() => copyOne(emoji, i())}
              aria-label={`Copy ${emoji}`}
              title="Click to copy"
            >{emoji}</button>
          )}
        </For>
      </div>
      <p class="random-hint">Click any emoji to copy it, or use “Copy all”. New set every time you hit Generate.</p>
    </div>
  )
}

export default RandomEmoji
