<script>
  import { onMount, onDestroy } from 'svelte'

  const WIDTH = 9
  const HEIGHT = 60

  const CELL = {
    Dirt: 'dirt',
    Stone: 'stone',
    Diamond: 'diamond',
    Lava: 'lava',
    Empty: 'empty'
  }

  const EMOJI = {
    [CELL.Dirt]: '🟫',
    [CELL.Stone]: '🪨',
    [CELL.Diamond]: '💎',
    [CELL.Lava]: '🔥',
    [CELL.Empty]: '⬛'
  }

  let state = 'playing'
  let grid = []
  let revealed = []
  let playerX = 0
  let playerY = 0
  let diamondPos = { x: 0, y: 0 }
  let depth = 0
  let message = ''

  function randInt(min, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - min)) + min
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v))
  }

  function makeGrid() {
    const g = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => CELL.Dirt))
    const r = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => false))

    const startX = Math.floor(WIDTH / 2)
    playerX = startX
    playerY = 0
    r[0][startX] = true
    g[0][startX] = CELL.Empty

    const revealInit = (x, y) => {
      if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return
      r[y][x] = true
      if (g[y][x] === CELL.Dirt) g[y][x] = CELL.Empty
    }

    revealInit(startX, 1)
    revealInit(startX - 1, 0)
    revealInit(startX + 1, 0)

    const dy = randInt(Math.floor(HEIGHT * 0.35), HEIGHT - 2)
    const dx = randInt(0, WIDTH)
    diamondPos = { x: dx, y: dy }
    g[dy][dx] = CELL.Diamond

    for (let y = 1; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        if (x === diamondPos.x && y === diamondPos.y) continue
        const stoneChance = 0.06 + y * 0.002
        const lavaChance = 0.035 + y * 0.004
        const roll = Math.random()
        if (roll < clamp(stoneChance, 0, 0.2)) g[y][x] = CELL.Stone
        else if (roll < clamp(stoneChance + lavaChance, 0, 0.55)) g[y][x] = CELL.Lava
      }
    }

    grid = g
    revealed = r
    depth = 0
    message = 'Tap next to ⛏️ or use ◀ ▼ ▶. Find 💎 and avoid 🔥.'
  }

  function restart() {
    makeGrid()
    state = 'playing'
    revealAround()
  }

  function inBounds(x, y) {
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT
  }

  function cellAt(x, y) {
    if (!inBounds(x, y)) return CELL.Stone
    return grid[y][x]
  }

  function isWalkable(cell) {
    return cell !== CELL.Stone
  }

  function revealCell(x, y) {
    if (!inBounds(x, y)) return
    if (!revealed?.[y]) return
    if (!revealed[y][x]) {
      const nextRow = revealed[y].slice()
      nextRow[x] = true
      revealed = [...revealed.slice(0, y), nextRow, ...revealed.slice(y + 1)]
    }
    if (grid?.[y]?.[x] === CELL.Dirt) {
      const nextRow = grid[y].slice()
      nextRow[x] = CELL.Empty
      grid = [...grid.slice(0, y), nextRow, ...grid.slice(y + 1)]
    }
  }

  function setState(s, msg) {
    state = s
    if (msg) message = msg
  }

  function tryMove(dx, dy) {
    if (state === 'ready') state = 'playing'
    if (state !== 'playing') return

    const nx = playerX + dx
    const ny = playerY + dy
    if (!inBounds(nx, ny)) return

    revealCell(nx, ny)
    const cell = cellAt(nx, ny)
    if (!isWalkable(cell)) return

    playerX = nx
    playerY = ny
    depth = ny
    revealAround()

    if (cell === CELL.Lava) {
      setState('lost', 'You hit lava. Game over.')
      return
    }
    if (cell === CELL.Diamond) {
      setState('won', 'You found the diamond!')
      return
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault()
      tryMove(-1, 0)
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault()
      tryMove(1, 0)
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault()
      tryMove(0, 1)
    } else if (e.key === 'Enter' && state !== 'playing') {
      e.preventDefault()
      restart()
    }
  }

  function revealAround() {
    revealCell(playerX, playerY + 1)
    revealCell(playerX - 1, playerY)
    revealCell(playerX + 1, playerY)
  }

  makeGrid()
  revealAround()

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  function cellEmoji(x, y) {
    if (playerX === x && playerY === y) return '⛏️'
    if (!revealed?.[y] || !grid?.[y]) return '⬜'
    if (!revealed[y][x]) return '⬜'
    return EMOJI[grid[y][x]] ?? '⬛'
  }

  function cellClass(x, y) {
    if (playerX === x && playerY === y) return 'player'
    if (!revealed?.[y] || !grid?.[y]) return 'hidden'
    if (!revealed[y][x]) return 'hidden'
    const t = grid[y][x]
    if (t === CELL.Lava) return 'lava'
    if (t === CELL.Diamond) return 'diamond'
    if (t === CELL.Stone) return 'stone'
    return 'dug'
  }

  function tapCell(x, y) {
    if (state === 'ready') state = 'playing'
    if (state !== 'playing') return
    const dx = x - playerX
    const dy = y - playerY
    if (Math.abs(dx) + Math.abs(dy) !== 1) return
    tryMove(dx, dy)
  }

  const VIEW_ROWS = 13
  $: viewTop = clamp(playerY - Math.floor(VIEW_ROWS / 2), 0, HEIGHT - VIEW_ROWS)
</script>

<section class="game">
  <header class="hud">
    <div class="title">
      <h1>Digging Game</h1>
      <p>{message}</p>
    </div>
    <div class="stats">
      <span>Depth: {depth}</span>
      <button on:click={restart}>{state === 'playing' ? 'Restart' : 'Play'}</button>
    </div>
  </header>

  <div class="board" style="--w: {WIDTH}">
    {#each Array(VIEW_ROWS) as _, rowOffset}
      {#key rowOffset}
        {#each Array(WIDTH) as _, x}
          {@const y = viewTop + rowOffset}
          <button
            class={"cell " + cellClass(x, y)}
            on:pointerdown={() => tapCell(x, y)}
            aria-label={"cell-" + x + "-" + y}
          >
            {cellEmoji(x, y)}
          </button>
        {/each}
      {/key}
    {/each}
  </div>

  <div class="controls" aria-label="controls">
    <button class="control" on:pointerdown={() => tryMove(-1, 0)} aria-label="left">◀</button>
    <button class="control" on:pointerdown={() => tryMove(0, 1)} aria-label="down">▼</button>
    <button class="control" on:pointerdown={() => tryMove(1, 0)} aria-label="right">▶</button>
  </div>
</section>

<style>
  .game {
    display: grid;
    gap: 1rem;
    align-items: center;
    justify-items: center;
    width: 100%;
  }
  .hud {
    width: 100%;
    max-width: 720px;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }
  .title {
    display: grid;
    gap: .25rem;
  }
  .title h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  .title p {
    margin: 0;
    opacity: 0.85;
  }
  .stats {
    display: grid;
    gap: .5rem;
    justify-items: end;
  }
  .stats button {
    padding: .5rem .9rem;
    border-radius: .6rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    cursor: pointer;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(var(--w), 1fr);
    gap: 6px;
    width: 100%;
    max-width: 720px;
    background: #0b1220;
    padding: 12px;
    border-radius: 16px;
    border: 2px solid #111827;
  }
  .cell {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 2px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    font-size: clamp(18px, 3.3vw, 28px);
    line-height: 1;
    cursor: pointer;
    user-select: none;
  }
  .cell.hidden {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
  }
  .cell.dug {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.10);
  }
  .cell.stone {
    background: rgba(55, 65, 81, 0.35);
    border-color: rgba(255,255,255,0.12);
  }
  .cell.lava {
    background: rgba(220, 38, 38, 0.25);
    border-color: rgba(220, 38, 38, 0.55);
  }
  .cell.diamond {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.55);
  }
  .cell.player {
    background: rgba(34, 197, 94, 0.18);
    border-color: rgba(34, 197, 94, 0.55);
  }
  .controls {
    display: flex;
    gap: .75rem;
    align-items: center;
    justify-content: center;
  }
  .control {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .control:active {
    transform: scale(0.96);
  }
</style>
