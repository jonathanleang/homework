<script>
  import { onDestroy, onMount } from 'svelte'

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const SCORE_KEY = 'abc_order_score'
  const SETTINGS_KEY = 'abc_order_settings'

  let length = 3
  let sayLetter = true

  let tiles = []
  let expectedIndex = 0
  let picked = []
  let message = ''
  let score = 0
  let mistakes = 0
  let finishTimer = null

  $: expected = ALPHABET[expectedIndex] || ''
  $: progress = picked.join('')

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = arr[i]
      arr[i] = arr[j]
      arr[j] = t
    }
    return arr
  }

  function speak(text) {
    if (!sayLetter) return
    if (!text) return
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.rate = 0.9
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  }

  function loadScore() {
    try {
      const raw = localStorage.getItem(SCORE_KEY)
      if (raw) score = parseInt(raw, 10) || 0
    } catch {}
  }

  function saveScore() {
    try {
      localStorage.setItem(SCORE_KEY, String(score))
    } catch {}
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) return
      const s = JSON.parse(raw)
      if (s && typeof s === 'object') {
        if (typeof s.length === 'number') length = s.length
        if (typeof s.sayLetter === 'boolean') sayLetter = s.sayLetter
      }
    } catch {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ length, sayLetter }))
    } catch {}
  }

  function newRound() {
    if (finishTimer) {
      clearTimeout(finishTimer)
      finishTimer = null
    }
    const base = ALPHABET.slice(0, length)
    tiles = shuffle([...base])
    expectedIndex = 0
    picked = []
    mistakes = 0
    message = `Tap ${ALPHABET[0]} to start`
  }

  function resetScore() {
    score = 0
    saveScore()
  }

  function pickLetter(letter) {
    if (!letter) return
    if (!expected) return
    if (picked.includes(letter)) return

    if (letter === expected) {
      picked = [...picked, letter]
      speak(letter)
      expectedIndex += 1
      if (expectedIndex >= length) {
        score += 1
        saveScore()
        message = 'Great job!'
        finishTimer = setTimeout(() => newRound(), 700)
      } else {
        message = `Good! Now tap ${ALPHABET[expectedIndex]}`
      }
    } else {
      mistakes += 1
      message = `Oops — find ${expected}`
    }
  }

  $: saveSettings()

  onMount(() => {
    loadScore()
    loadSettings()
    newRound()
  })

  onDestroy(() => {
    if (finishTimer) {
      clearTimeout(finishTimer)
      finishTimer = null
    }
  })
</script>

<section class="game">
  <header class="header">
    <h1>ABC Order</h1>
    <p>Tap the letters in the correct order.</p>
  </header>

  <section class="panel">
    <div class="controls">
      <label class="control">
        <span>Letters</span>
        <select bind:value={length}>
          <option value={3}>A–C</option>
          <option value={6}>A–F</option>
          <option value={10}>A–J</option>
          <option value={26}>A–Z</option>
        </select>
      </label>

      <label class="check">
        <input type="checkbox" bind:checked={sayLetter} />
        <span>Say letter</span>
      </label>

      <button class="btn" on:click={newRound}>New</button>
      <button class="btn" on:click={resetScore}>Reset score</button>
    </div>

    <div class="status" aria-live="polite">
      <div class="next">
        Next:
        <span class="expected">{expected}</span>
      </div>
      <div class="progress">
        <span class="label">Your letters:</span>
        <span class="value">{progress || '—'}</span>
      </div>
      <div class="msg">{message}</div>
      <div class="stats">
        <span>Score: {score}</span>
        <span>Mistakes: {mistakes}</span>
      </div>
    </div>
  </section>

  <section class="tiles" style="--cols: {Math.min(8, Math.max(3, Math.ceil(Math.sqrt(length))))}">
    {#each tiles as letter (letter)}
      <button
        class="tile"
        class:done={picked.includes(letter)}
        disabled={picked.includes(letter)}
        on:click={() => pickLetter(letter)}
        aria-label={`letter ${letter}`}
      >
        {letter}
      </button>
    {/each}
  </section>
</section>

<style>
  .game {
    display: grid;
    gap: 1rem;
    align-items: start;
  }

  .header {
    display: grid;
    gap: .35rem;
    text-align: center;
  }

  .header h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .panel {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
    padding: 1rem;
    display: grid;
    gap: 1rem;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: .75rem;
    justify-content: center;
    align-items: end;
  }

  .control {
    display: grid;
    gap: .25rem;
    text-align: left;
  }

  .control span {
    font-size: .9rem;
    color: #374151;
  }

  select {
    font-size: 1rem;
    padding: .5rem .6rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
  }

  .check {
    display: flex;
    gap: .45rem;
    align-items: center;
    padding: .55rem .7rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }

  .btn {
    padding: .55rem .8rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    cursor: pointer;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .status {
    display: grid;
    gap: .5rem;
    text-align: center;
  }

  .next {
    font-size: 1.1rem;
    color: #111827;
  }

  .expected {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    margin-left: .35rem;
    border-radius: .75rem;
    border: 2px solid #111827;
    background: #fde68a;
    font-weight: 900;
  }

  .progress {
    display: flex;
    gap: .5rem;
    justify-content: center;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .label {
    color: #374151;
    font-size: .95rem;
  }

  .value {
    font-weight: 800;
    letter-spacing: .2em;
    color: #111827;
  }

  .msg {
    color: #111827;
    font-weight: 600;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    color: #374151;
  }

  .tiles {
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    gap: 12px;
  }

  .tile {
    aspect-ratio: 1 / 1;
    border-radius: 14px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #bbf7d0, #c7d2fe);
    color: #111827;
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 900;
    cursor: pointer;
    transition: transform .1s ease, filter .2s ease;
    display: grid;
    place-items: center;
    user-select: none;
  }

  .tile:active {
    transform: scale(0.98);
  }

  .tile:disabled {
    cursor: default;
    filter: grayscale(0.8) brightness(0.95);
    opacity: 0.75;
  }

  .tile.done {
    background: #f3f4f6;
  }

  @media (max-width: 480px) {
    .panel {
      padding: .85rem;
    }
    .tiles {
      gap: 10px;
    }
  }
</style>
