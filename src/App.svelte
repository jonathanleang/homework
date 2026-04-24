<script>
  import { onMount } from 'svelte'
  import SpinWheel from './lib/SpinWheel.svelte'
  import MathAddGame from './lib/MathAddGame.svelte'
  import MathSubGame from './lib/MathSubGame.svelte'
  import MathMulGame from './lib/MathMulGame.svelte'
  import MathDivGame from './lib/MathDivGame.svelte'
  import WordMissingLetterGame from './lib/WordMissingLetterGame.svelte'
  import AlphabetOrderGame from './lib/AlphabetOrderGame.svelte'
  import CopybookStrokeGame from './lib/CopybookStrokeGame.svelte'
  import MemoryGame from './lib/MemoryGame.svelte'
  import RocketGame from './lib/RocketGame.svelte'
  import YouTubePlayer from './lib/YouTubePlayer.svelte'
  import WhackAMoleGame from './lib/WhackAMoleGame.svelte'
  import DiggingGame from './lib/DiggingGame.svelte'
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
        <button class="card" on:click={() => setView('minus')}>
          <div class="thumb minus-thumb">−</div>
          <h2>Minus</h2>
          <p>Practice subtraction levels</p>
        </button>
        <button class="card" on:click={() => setView('multiply')}>
          <div class="thumb mul-thumb">×</div>
          <h2>Multiply</h2>
          <p>Practice multiplication</p>
        </button>
        <button class="card" on:click={() => setView('divide')}>
          <div class="thumb div-thumb">÷</div>
          <h2>Divide</h2>
          <p>Practice division</p>
        </button>
        <button class="card" on:click={() => setView('word-missing')}>
          <div class="thumb word-thumb">A</div>
          <h2>Missing Letter</h2>
          <p>Pick the missing letter</p>
        </button>
        <button class="card" on:click={() => setView('abc-order')}>
          <div class="thumb abc-thumb">ABC</div>
          <h2>ABC Order</h2>
          <p>Tap letters in order</p>
        </button>
        <button class="card" on:click={() => setView('copybook')}>
          <div class="thumb abc-thumb">✍️</div>
          <h2>Copybook Letters</h2>
          <p>Trace strokes in order</p>
        </button>
        <button class="card" on:click={() => setView('memory')}>
          <div class="thumb memory-thumb">🐶</div>
          <h2>Memory Cards</h2>
          <p>Match the animals</p>
        </button>
        <button class="card" on:click={() => setView('rocket')}>
          <div class="thumb rocket-thumb">🚀</div>
          <h2>Rocket Jump</h2>
          <p>Fly up and avoid rocks</p>
        </button>
        <button class="card" on:click={() => setView('dig')}>
          <div class="thumb dig-thumb">⛏️</div>
          <h2>Digging Game</h2>
          <p>Find diamonds, avoid lava</p>
        </button>
        <button class="card" on:click={() => setView('youtube')}>
          <div class="thumb yt-thumb"><span class="yt-play"></span></div>
          <h2>Video</h2>
          <p>Numberblocks: Shapes</p>
        </button>
        <button class="card" on:click={() => setView('youtube2')}>
          <div class="thumb yt-thumb"><span class="yt-play"></span></div>
          <h2>Video</h2>
          <p>Bluey: 2 Hours</p>
        </button>
        <button class="card" on:click={() => setView('youtube3')}>
          <div class="thumb yt-thumb"><span class="yt-play"></span></div>
          <h2>Video</h2>
          <p>Animal Classification</p>
        </button>
        <button class="card" on:click={() => setView('fishguys')}>
          <div class="thumb yt-thumb"><span class="yt-play"></span></div>
          <h2>Channel</h2>
          <p>The Fish Guys</p>
        </button>
        <button class="card" on:click={() => setView('whack')}>
          <div class="thumb memory-thumb">🔨</div>
          <h2>Whack-a-Pest</h2>
          <p>Smash the pests</p>
        </button>
      </div>
    </section>
  {:else if view === 'find'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
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
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <header>
      <h1>Spin the Wheel</h1>
      <p>Enter how many numbers and spin</p>
    </header>
    <SpinWheel />
  {:else if view === 'math'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <MathAddGame />
  {:else if view === 'minus'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <MathSubGame />
  {:else if view === 'multiply'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <MathMulGame />
  {:else if view === 'divide'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <MathDivGame />
  {:else if view === 'word-missing'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <WordMissingLetterGame />
  {:else if view === 'abc-order'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <AlphabetOrderGame />
  {:else if view === 'copybook'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <CopybookStrokeGame />
  {:else if view === 'memory'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <MemoryGame />
  {:else if view === 'rocket'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <RocketGame />
  {:else if view === 'whack'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <WhackAMoleGame />
  {:else if view === 'youtube'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <YouTubePlayer videoId="wa6Itbqw29g" />
  {:else if view === 'youtube2'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <YouTubePlayer videoId="aP-qKaig84M" />
  {:else if view === 'youtube3'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <YouTubePlayer videoId="P9ptHAClC4Q" />
  {:else if view === 'fishguys'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <YouTubePlayer videoId="iH9jDCB2M3M" />
  {:else if view === 'dig'}
    <nav class="topbar">
      <button on:click={() => setView('menu')} aria-label="Menu">🏠</button>
    </nav>
    <DiggingGame />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    width: 100%;
    box-sizing: border-box;
  }
  .topbar {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 50;
    display: flex;
    gap: .75rem;
    justify-content: center;
    align-items: center;
  }
  .topbar button {
    padding: .5rem;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    line-height: 1;
    font-size: 1.5rem;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.1s;
  }
  .topbar button:active {
    transform: scale(0.95);
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
    width: 100%;
    margin: 0 auto;
  }
  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: .75rem;
    width: 100%;
  }
  @media (min-width: 560px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: .9rem;
    }
  }
  @media (min-width: 840px) {
    .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }
  }
  @media (min-width: 1100px) {
    .cards {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.1rem;
    }
  }
  @media (max-width: 480px) {
    main {
      padding: 1rem;
    }
  }
  .card {
    padding: .85rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;
    display: grid;
    gap: .5rem;
    justify-items: center;
    transition: transform .12s ease, border-color .2s ease, background .2s ease;
    cursor: pointer;
  }
  .card h2 {
    font-size: clamp(1rem, 1.2vw + .9rem, 1.25rem);
  }
  .card p {
    font-size: clamp(.85rem, 1vw + .7rem, 1rem);
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
  .thumb { width: clamp(64px, 9vw, 96px); height: clamp(64px, 9vw, 96px); }
  .wheel-thumb {
    width: clamp(64px, 9vw, 96px);
    height: clamp(64px, 9vw, 96px);
    border-radius: 50%;
    border: 3px solid #111827;
    background: conic-gradient(#fde68a 0 45deg, #fca5a5 45deg 90deg, #fde68a 90deg 135deg, #fca5a5 135deg 180deg, #fde68a 180deg 225deg, #fca5a5 225deg 270deg, #fde68a 270deg 315deg, #fca5a5 315deg 360deg);
  }
  .yt-thumb {
    width: clamp(64px, 9vw, 96px);
    height: clamp(48px, 7vw, 72px);
    border-radius: 14px;
    background: #ff0000;
    border: 3px solid #111827;
    display: grid;
    place-items: center;
    position: relative;
    box-shadow: 0 4px 6px rgba(0,0,0,0.15) inset;
  }
  .yt-thumb .yt-play {
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-left: 20px solid #ffffff;
    transform: translateX(2px);
  }
  .math-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #bbf7d0, #93c5fd);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .minus-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #fecaca, #fef08a);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .mul-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #fde68a, #86efac);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .div-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #c7d2fe, #fecaca);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .word-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #bbf7d0, #fde68a);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .abc-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #93c5fd, #fde68a);
    font-size: clamp(1.4rem, 2.5vw, 2rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
    letter-spacing: 0.08em;
  }
  .memory-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #c7d2fe, #bbf7d0);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .dig-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #fbbf24, #78350f);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #111827;
    line-height: 1;
  }
  .rocket-thumb {
    display: grid;
    place-items: center;
    border-radius: 18px;
    border: 3px solid #111827;
    background: linear-gradient(180deg, #38bdf8, #0f172a);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: white;
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
