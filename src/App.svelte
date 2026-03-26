<script>
  import { onMount } from 'svelte'
  import SpinWheel from './lib/SpinWheel.svelte'
  import MathAddGame from './lib/MathAddGame.svelte'
  const base = import.meta.env.BASE_URL
  let view = 'menu'
  let grid = 4
  let cells = []
  let target = 0
  let score = 0
  let rounds = 0
  function setView(v) {
    view = v
    try { localStorage.setItem('view', v) } catch {}
  }
  function setup() {
    cells = Array.from({ length: grid * grid }, (_, i) => i)
    target = Math.floor(Math.random() * cells.length)
  }
  function loadScore() {
    const s = localStorage.getItem('score')
    if (s) score = parseInt(s, 10) || 0
  }
  function saveScore() {
    localStorage.setItem('score', String(score))
  }
  function reshuffle() {
    target = Math.floor(Math.random() * cells.length)
  }
  function pick(i) {
    rounds += 1
    if (i === target) {
      score += 1
      saveScore()
      reshuffle()
    }
  }
  onMount(() => {
    setup()
    loadScore()
    const v = localStorage.getItem('view')
    if (v) view = v
  })
</script>

<main>
  {#if view === 'menu'}
    <section class="menu">
      <h1>Games</h1>
      <div class="cards">
        <button class="card" on:click={() => setView('find')}>
          <img src={`${base}star.svg`} alt="" class="thumb" />
          <h2>Find the Star</h2>
          <p>Tap the star in the grid</p>
        </button>
        <button class="card" on:click={() => setView('wheel')}>
          <div class="thumb wheel-thumb"></div>
          <h2>Spin the Wheel</h2>
          <p>Set numbers and spin</p>
        </button>
        <button class="card" on:click={() => setView('math')}>
          <div class="thumb math-thumb">+</div>
          <h2>Adding</h2>
          <p>Practice addition levels</p>
        </button>
      </div>
    </section>
  {:else if view === 'find'}
    <nav class="topbar">
      <button on:click={() => setView('menu')}>Menu</button>
    </nav>
    <header>
      <h1>Find the Star</h1>
      <p>Tap the star to score a point</p>
      <div class="stats">
        <span>Score: {score}</span>
        <button on:click={() => { score = 0; saveScore() }}>Reset</button>
      </div>
    </header>
    <section class="board" style="--size: {grid}">
      {#each cells as i}
        <button class="cell" on:click={() => pick(i)} aria-label="cell">
          {#if i === target}
            <img src={`${base}star.svg`} alt="star" />
          {:else}
            <img src={`${base}circle.svg`} alt="circle" />
          {/if}
        </button>
      {/each}
    </section>
  {:else if view === 'wheel'}
    <nav class="topbar">
      <button on:click={() => setView('menu')}>Menu</button>
    </nav>
    <header>
      <h1>Spin the Wheel</h1>
      <p>Enter how many numbers and spin</p>
    </header>
    <SpinWheel />
  {:else if view === 'math'}
    <nav class="topbar">
      <button on:click={() => setView('menu')}>Menu</button>
    </nav>
    <header>
      <h1>Adding</h1>
      <p>Pick a level and solve the problems</p>
    </header>
    <MathAddGame />
  {/if}
</main>

<style>
  main {
    min-height: 100dvh;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    gap: 1.5rem;
  }
  .topbar {
    display: flex;
    gap: .75rem;
    justify-content: center;
  }
  .topbar button {
    padding: .5rem 1rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  header {
    display: grid;
    gap: .5rem;
    text-align: center;
  }
  .menu {
    display: grid;
    gap: 1rem;
    text-align: center;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
    gap: 1rem;
  }
  .card {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
    display: grid;
    gap: .5rem;
    justify-items: center;
    transition: transform .12s ease, border-color .2s ease, background .2s ease;
    cursor: pointer;
  }
  .card h2,
  .card p {
    color: #111827;
  }
  .card:hover {
    transform: translateY(-2px);
    border-color: #c7d2fe;
    background: #f8fafc;
  }
  .thumb {
    width: 84px;
    height: 84px;
  }
  .wheel-thumb {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    border: 3px solid #111827;
    background: conic-gradient(#fde68a 0 45deg, #fca5a5 45deg 90deg, #fde68a 90deg 135deg, #fca5a5 135deg 180deg, #fde68a 180deg 225deg, #fca5a5 225deg 270deg, #fde68a 270deg 315deg, #fca5a5 315deg 360deg);
  }
  .math-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #bbf7d0, #93c5fd);
    font-size: 3rem;
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .75rem;
  }
  .stats button {
    padding: .4rem .9rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(var(--size), minmax(0, 1fr));
    gap: 12px;
  }
  .cell {
    display: grid;
    place-items: center;
    background: #f7f7fb;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;
    transition: transform .1s ease, background .2s ease, border-color .2s ease;
    cursor: pointer;
  }
  .cell:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
  }
  .cell:active {
    transform: scale(.97);
  }
  img {
    width: 72px;
    height: 72px;
    user-select: none;
    pointer-events: none;
  }
</style>
