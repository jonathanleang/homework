<script>
  import { afterUpdate, onDestroy, onMount } from 'svelte'

  const PRESETS = [8, 12, 16, 20, 24, 32]
  const ANIMALS = [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐸',
    '🐵',
    '🐔',
    '🐧',
    '🐦',
    '🐤',
    '🦆',
    '🦉',
    '🦋',
    '🐝',
    '🐞',
    '🐢',
    '🐙',
    '🐠',
    '🐳',
    '🦄',
    '🦖',
    '🦕',
    '🦓',
    '🦒',
    '🦘',
    '🦔',
    '🐿️',
    '🦦',
    '🦥',
    '🦩',
    '🦜',
  ]

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = arr[i]
      arr[i] = arr[j]
      arr[j] = t
    }
    return arr
  }

  function makeDeck(total) {
    const n = Math.max(2, Math.floor(total / 2))
    const pool = shuffle([...ANIMALS]).slice(0, Math.min(n, ANIMALS.length))
    const symbols = pool.slice(0, n)
    const cards = shuffle(
      symbols
        .flatMap((s) => [s, s])
        .slice(0, n * 2)
        .map((symbol, idx) => ({
          id: `${idx}-${symbol}`,
          symbol,
          flipped: false,
          matched: false,
        }))
    )
    return cards
  }

  /** @type {number | string} */
  let preset = 16
  let customCards = 16
  let cards = []
  let first = null
  let second = null
  let lock = false
  let moves = 0
  let matches = 0
  let finished = false
  let boardEl
  let cardSize = 72
  const GAP = 10

  $: totalCards = cards.length
  $: totalPairs = totalCards ? totalCards / 2 : 0
  $: cols =
    totalCards <= 16
      ? 4
      : totalCards <= 20
        ? 5
        : totalCards <= 30
          ? 6
          : totalCards <= 42
            ? 7
            : totalCards <= 56
              ? 8
              : totalCards <= 72
                ? 9
                : 10

  $: rows = totalCards ? Math.ceil(totalCards / cols) : 1

  function reset() {
    let count
    if (preset === 'custom') {
      count = Math.floor(Number(customCards)) || 16
      if (count % 2 !== 0) count -= 1
      if (count < 4) count = 4
      if (count > 90) count = 90
      customCards = count
    } else {
      count = PRESETS.includes(Number(preset)) ? Number(preset) : 16
    }
    cards = makeDeck(count)
    first = null
    second = null
    lock = false
    moves = 0
    matches = 0
    finished = false
  }

  function updateCard(i, patch) {
    cards = cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
  }

  function onPick(i) {
    if (lock) return
    const c = cards[i]
    if (!c || c.matched || c.flipped) return

    updateCard(i, { flipped: true })

    if (first == null) {
      first = i
      return
    }

    second = i
    lock = true
    moves += 1

    const a = cards[first]
    const b = cards[i]
    const ok = a && b && a.symbol === b.symbol

    if (ok) {
      setTimeout(() => {
        updateCard(first, { matched: true })
        updateCard(i, { matched: true })
        matches += 1
        first = null
        second = null
        lock = false
        if (matches + 1 >= totalPairs) finished = true
      }, 350)
      return
    }

    setTimeout(() => {
      updateCard(first, { flipped: false })
      updateCard(i, { flipped: false })
      first = null
      second = null
      lock = false
    }, 650)
  }

  function onResize() {
    // recompute no longer needed
  }

  onMount(() => {
    reset()
  })

  afterUpdate(() => {
    // layout is CSS driven
  })

  onDestroy(() => {
  })
</script>

<section class="wrap">
  <div class="top">
    <div class="title">Memory Cards</div>
    <div class="desc">Flip 2 cards. Match the animals.</div>
    <div class="controls">
      <label class="sel">
        <span>Cards</span>
        <select bind:value={preset} on:change={reset}>
          {#each PRESETS as p}
            <option value={p}>{p}</option>
          {/each}
          <option value="custom">Custom</option>
        </select>
      </label>
      {#if preset === 'custom'}
        <label class="sel" style="margin-left: 4px;">
          <span>Qty:</span>
          <input 
            type="number" 
            bind:value={customCards} 
            on:change={reset} 
            min="4" 
            max="90" 
            step="2" 
            class="custom-input"
          />
        </label>
      {/if}
      <button on:click={reset}>New Game</button>
    </div>
    <div class="stats">Moves: {moves} · Matches: {matches}/{totalPairs}</div>
  </div>

  <div class="board-wrap">
    <div class="board" bind:this={boardEl} style="--cols: {cols}; --rows: {rows}; --gap: {GAP}px">
      {#each cards as c, i (c.id)}
        <button
          class="card"
          class:flipped={c.flipped || c.matched}
          class:matched={c.matched}
          on:click={() => onPick(i)}
          aria-label="card"
        >
          <span class="inner">
            <span class="face back">🐾</span>
            <span class="face front">{c.symbol}</span>
          </span>
        </button>
      {/each}
    </div>
  </div>

  {#if finished}
    <div class="win">
      <div class="win-title">Winner!</div>
      <div class="win-desc">You finished in {moves} moves.</div>
      <div class="win-actions">
        <button on:click={reset}>Play Again</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .wrap {
    display: grid;
    gap: 1rem;
    justify-items: center;
  }
  .top {
    display: grid;
    gap: .5rem;
    text-align: center;
    justify-items: center;
  }
  .title {
    font-weight: 900;
    color: var(--text-h);
  }
  .desc {
    color: var(--text);
  }
  .controls {
    display: flex;
    gap: .6rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .sel {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: .35rem .55rem;
    border-radius: .7rem;
    color: #111827;
  }
  select {
    padding: .35rem .5rem;
    border-radius: .6rem;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
  }
  .custom-input {
    width: 60px;
    padding: .35rem .5rem;
    border-radius: .6rem;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
  }
  button {
    padding: .5rem .95rem;
    border-radius: .7rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .stats {
    color: #111827;
    font-weight: 700;
  }
  .board-wrap {
    width: 100%;
    display: grid;
    place-items: center;
  }
  .board {
    display: inline-grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: var(--gap);
    max-width: 92vw;
    --max-w: calc((92vw - (var(--cols) - 1) * var(--gap)) / var(--cols));
    --max-h: calc((100vh - 280px - (var(--rows) - 1) * var(--gap)) / var(--rows));
    --card-size: min(var(--max-w), var(--max-h), 120px);
  }
  .card {
    width: var(--card-size);
    height: var(--card-size);
    border-radius: 14px;
    border: 2px solid #e5e7eb;
    background: transparent;
    padding: 0;
    perspective: 900px;
  }
  .inner {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: relative;
    transform-style: preserve-3d;
    transition: transform .35s ease;
    border-radius: 14px;
  }
  .card.flipped .inner {
    transform: rotateY(180deg);
  }
  .face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 14px;
    backface-visibility: hidden;
    user-select: none;
  }
  .back {
    background: linear-gradient(180deg, #c7d2fe, #fde68a);
    font-size: calc(var(--card-size) * 0.4);
  }
  .front {
    transform: rotateY(180deg);
    background: #ffffff;
    font-size: calc(var(--card-size) * 0.5);
  }
  .card.matched {
    border-color: #86efac;
  }
  .card.matched .front {
    background: #f0fdf4;
  }
  .win {
    width: min(92vw, 560px);
    padding: 1rem;
    border-radius: 14px;
    border: 1px solid #86efac;
    background: #f0fdf4;
    display: grid;
    gap: .5rem;
    text-align: center;
    color: #111827;
  }
  .win-title {
    font-weight: 900;
    font-size: 1.4rem;
  }
  .win-actions {
    display: flex;
    justify-content: center;
  }
</style>
