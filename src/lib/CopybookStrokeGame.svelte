<script>
  import { onDestroy, onMount } from 'svelte'

  const SETTINGS_KEY = 'copybook_stroke_settings'
  const SCORE_KEY = 'copybook_stroke_score'

  const PANGRAMS = [
    'THE QUICK BROWN FOX JUMPS OVER A LAZY DOG',
    'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
    'Sphinx of black quartz, judge my vow'.toUpperCase(),
    'How vexingly quick daft zebras jump'.toUpperCase(),
    'WALTZ, BAD NYMPH, FOR QUICK JIGS VEX'.toUpperCase(),
    'JIVED FOX NYMPH GRABS QUICK WALTZ'.toUpperCase()
  ]

  const LETTERS = {
    A: { name: 'A', strokes: [[[20, 90], [50, 10], [80, 90]], [[32, 60], [68, 60]]] },
    B: { name: 'B', strokes: [[[25, 10], [25, 90]], [[25, 10], [65, 25], [25, 45]], [[25, 45], [70, 65], [25, 90]]] },
    C: { name: 'C', strokes: [[[75, 20], [55, 10], [30, 20], [20, 50], [30, 80], [55, 90], [75, 80]]] },
    D: { name: 'D', strokes: [[[25, 10], [25, 90]], [[25, 10], [70, 35], [70, 65], [25, 90]]] },
    E: { name: 'E', strokes: [[[25, 10], [25, 90]], [[25, 10], [75, 10]], [[25, 50], [65, 50]], [[25, 90], [75, 90]]] },
    F: { name: 'F', strokes: [[[25, 10], [25, 90]], [[25, 10], [75, 10]], [[25, 50], [65, 50]]] },
    G: { name: 'G', strokes: [[[75, 25], [55, 10], [30, 20], [20, 50], [30, 80], [55, 90], [78, 75], [60, 75]]] },
    H: { name: 'H', strokes: [[[25, 10], [25, 90]], [[75, 10], [75, 90]], [[25, 50], [75, 50]]] },
    I: { name: 'I', strokes: [[[30, 10], [70, 10]], [[50, 10], [50, 90]], [[30, 90], [70, 90]]] },
    J: { name: 'J', strokes: [[[30, 10], [70, 10]], [[60, 10], [60, 75], [50, 90], [30, 80]]] },
    K: { name: 'K', strokes: [[[25, 10], [25, 90]], [[75, 10], [30, 55]], [[35, 50], [75, 90]]] },
    L: { name: 'L', strokes: [[[25, 10], [25, 90]], [[25, 90], [75, 90]]] },
    M: { name: 'M', strokes: [[[20, 90], [20, 10]], [[20, 10], [50, 55]], [[50, 55], [80, 10]], [[80, 10], [80, 90]]] },
    N: { name: 'N', strokes: [[[25, 90], [25, 10]], [[25, 10], [75, 90]], [[75, 90], [75, 10]]] },
    O: { name: 'O', strokes: [[[50, 10], [30, 20], [20, 50], [30, 80], [50, 90], [70, 80], [80, 50], [70, 20], [50, 10]]] },
    P: { name: 'P', strokes: [[[25, 10], [25, 90]], [[25, 10], [70, 25], [25, 45]]] },
    Q: { name: 'Q', strokes: [[[50, 10], [30, 20], [20, 50], [30, 80], [50, 90], [70, 80], [80, 50], [70, 20], [50, 10]], [[60, 70], [80, 92]]] },
    R: { name: 'R', strokes: [[[25, 10], [25, 90]], [[25, 10], [70, 25], [25, 45]], [[25, 45], [75, 90]]] },
    S: { name: 'S', strokes: [[[75, 20], [55, 10], [30, 20], [55, 50], [80, 75], [55, 90], [30, 80]]] },
    T: { name: 'T', strokes: [[[25, 10], [75, 10]], [[50, 10], [50, 90]]] },
    U: { name: 'U', strokes: [[[25, 10], [25, 70], [35, 90], [65, 90], [75, 70], [75, 10]]] },
    V: { name: 'V', strokes: [[[20, 10], [50, 90], [80, 10]]] },
    W: { name: 'W', strokes: [[[20, 10], [30, 90]], [[30, 90], [50, 55]], [[50, 55], [70, 90]], [[70, 90], [80, 10]]] },
    X: { name: 'X', strokes: [[[25, 10], [75, 90]], [[75, 10], [25, 90]]] },
    Y: { name: 'Y', strokes: [[[25, 10], [50, 45], [75, 10]], [[50, 45], [50, 90]]] },
    Z: { name: 'Z', strokes: [[[25, 10], [75, 10]], [[75, 10], [25, 90]], [[25, 90], [75, 90]]] }
  }

  let pangram = PANGRAMS[0]
  let letter = 'A'
  let strokeIndex = 0
  let message = 'Trace the highlighted stroke.'
  let sayLetter = true
  let tolerance = 18
  let score = 0
  let didMount = false
  let finishTimer = null

  let svgEl
  let drawing = false
  let trail = []
  let lastT = 0
  let bad = false

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

  function load() {
    try {
      const s = localStorage.getItem(SETTINGS_KEY)
      if (s) {
        const j = JSON.parse(s)
        if (j && typeof j === 'object') {
          if (typeof j.sayLetter === 'boolean') sayLetter = j.sayLetter
          if (typeof j.tolerance === 'number') tolerance = Math.max(10, Math.min(30, j.tolerance))
        }
      }
    } catch {}
    try {
      const s = localStorage.getItem(SCORE_KEY)
      if (s) score = parseInt(s, 10) || 0
    } catch {}
  }

  function save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sayLetter, tolerance }))
    } catch {}
    try {
      localStorage.setItem(SCORE_KEY, String(score))
    } catch {}
  }

  function persist(nextSayLetter, nextTolerance, nextScore) {
    if (!didMount) return
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ sayLetter: !!nextSayLetter, tolerance: nextTolerance })
      )
    } catch {}
    try {
      localStorage.setItem(SCORE_KEY, String(nextScore))
    } catch {}
  }

  function pickNew() {
    pangram = PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)]
    // pick a random letter from the pangram (A–Z)
    const pool = Array.from(new Set(pangram.replace(/[^A-Z]/g, '').split('')))
    letter = pool[Math.floor(Math.random() * pool.length)] || 'A'
    strokeIndex = 0
    trail = []
    lastT = 0
    bad = false
    message = 'Trace the highlighted stroke.'
    speak(letter)
  }

  function resetLetter() {
    strokeIndex = 0
    trail = []
    lastT = 0
    bad = false
    message = 'Trace the highlighted stroke.'
    speak(letter)
  }

  function polylineLength(points) {
    let sum = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - points[i - 1][0]
      const dy = points[i][1] - points[i - 1][1]
      sum += Math.hypot(dx, dy)
    }
    return sum
  }

  function projectPointToSegment(px, py, ax, ay, bx, by) {
    const vx = bx - ax
    const vy = by - ay
    const wx = px - ax
    const wy = py - ay
    const vv = vx * vx + vy * vy
    const t = vv === 0 ? 0 : (wx * vx + wy * vy) / vv
    const tt = Math.max(0, Math.min(1, t))
    const cx = ax + tt * vx
    const cy = ay + tt * vy
    return { tt, cx, cy, dist: Math.hypot(px - cx, py - cy) }
  }

  function progressOnPolyline(px, py, poly) {
    let best = { dist: Infinity, t: 0 }
    let walked = 0
    for (let i = 1; i < poly.length; i++) {
      const [ax, ay] = poly[i - 1]
      const [bx, by] = poly[i]
      const segLen = Math.hypot(bx - ax, by - ay)
      const proj = projectPointToSegment(px, py, ax, ay, bx, by)
      if (proj.dist < best.dist) {
        best = { dist: proj.dist, t: walked + proj.tt * segLen }
      }
      walked += segLen
    }
    const total = Math.max(1, polylineLength(poly))
    return { dist: best.dist, t01: Math.max(0, Math.min(1, best.t / total)) }
  }

  function svgPointFromEvent(e) {
    const rect = svgEl?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    return { x, y }
  }

  function startDraw(e) {
    if (!svgEl) return
    e.preventDefault?.()
    if (typeof e?.pointerId === 'number') {
      svgEl.setPointerCapture?.(e.pointerId)
    }
    drawing = true
    trail = []
    lastT = 0
    bad = false
    message = `Stroke ${strokeIndex + 1}: start at the dot.`
    const p = svgPointFromEvent(e)
    trail = [p]
    tick(p.x, p.y)
  }

  function moveDraw(e) {
    if (!drawing) return
    e.preventDefault?.()
    const p = svgPointFromEvent(e)
    trail = [...trail, p]
    tick(p.x, p.y)
  }

  function endDraw() {
    if (!drawing) return
    drawing = false
    if (bad) {
      message = 'Try again — stay on the line.'
      return
    }
    // if kid lifted too early
    if (lastT < 0.92) {
      message = 'Keep going to the end of the stroke.'
      return
    }
    strokeIndex += 1
    trail = []
    lastT = 0
    bad = false

    const totalStrokes = LETTERS[letter]?.strokes?.length || 0
    if (strokeIndex >= totalStrokes) {
      score += 1
      message = 'Nice! Letter complete.'
      if (finishTimer) clearTimeout(finishTimer)
      finishTimer = setTimeout(() => pickNew(), 650)
    } else {
      message = `Great! Now stroke ${strokeIndex + 1}.`
    }
  }

  function tick(x, y) {
    const poly = LETTERS[letter]?.strokes?.[strokeIndex]
    if (!poly) return

    const p = progressOnPolyline(x, y, poly)
    if (p.dist > tolerance) {
      bad = true
      return
    }
    // enforce “mostly forward” movement
    if (p.t01 + 0.02 < lastT) {
      bad = true
      return
    }
    lastT = Math.max(lastT, p.t01)
  }

  function strokePath(points) {
    if (!points?.length) return ''
    return `M ${points.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`
  }

  function trailPath(points) {
    if (!points?.length) return ''
    return `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`
  }

  $: persist(sayLetter, tolerance, score)

  onMount(() => {
    load()
    didMount = true
    pickNew()
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
    <h1>Copybook Letters</h1>
    <p>Trace each stroke in order. Use the pangram to see the letter in a sentence.</p>
  </header>

  <section class="panel">
    <div class="controls">
      <button class="btn" on:click={pickNew}>New pangram</button>
      <button class="btn" on:click={resetLetter}>Restart letter</button>

      <label class="check">
        <input type="checkbox" bind:checked={sayLetter} />
        <span>Say letter</span>
      </label>

      <label class="control">
        <span>Difficulty</span>
        <select bind:value={tolerance}>
          <option value={24}>Easy</option>
          <option value={18}>Normal</option>
          <option value={14}>Hard</option>
        </select>
      </label>
    </div>

    <div class="status" aria-live="polite">
      <div class="row">
        <div class="badge">
          <span class="label">Letter</span>
          <span class="value">{letter}</span>
        </div>
        <div class="badge">
          <span class="label">Stroke</span>
          <span class="value">{strokeIndex + 1}/{LETTERS[letter]?.strokes?.length || 0}</span>
        </div>
        <div class="badge">
          <span class="label">Score</span>
          <span class="value">{score}</span>
        </div>
      </div>
      <div class="msg" class:bad={bad}>{message}</div>
    </div>
  </section>

  <section class="copybook">
    <div class="pangram" aria-label="pangram">
      {#each pangram.split('') as ch, i (i)}
        {#if ch === letter}
          <span class="hl">{ch}</span>
        {:else}
          <span class="ch">{ch}</span>
        {/if}
      {/each}
    </div>

    <div class="board">
      <svg
        bind:this={svgEl}
        class="svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label="trace letter"
        on:pointerdown={startDraw}
        on:pointermove={moveDraw}
        on:pointerup={endDraw}
        on:pointercancel={endDraw}
        on:mouseleave={endDraw}
        style="touch-action: none;"
      >
        <defs>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.18)" />
          </filter>
        </defs>

        <line x1="10" y1="20" x2="90" y2="20" class="guide" />
        <line x1="10" y1="50" x2="90" y2="50" class="guide mid" />
        <line x1="10" y1="90" x2="90" y2="90" class="guide" />

        {#each (LETTERS[letter]?.strokes || []) as s, idx (idx)}
          <path
            d={strokePath(s)}
            class="stroke"
            class:done={idx < strokeIndex}
            class:current={idx === strokeIndex}
          />
          <text x={s?.[0]?.[0] ?? 10} y={(s?.[0]?.[1] ?? 10) - 2} class="num">{idx + 1}</text>
          {#if idx === strokeIndex}
            <circle cx={s?.[0]?.[0] ?? 0} cy={s?.[0]?.[1] ?? 0} r="3.2" class="start" filter="url(#soft)" />
          {/if}
        {/each}

        <path d={trailPath(trail)} class="trail" class:bad={bad} />
      </svg>
      <div class="hint">
        Draw on the highlighted line, starting at the dot. Lift your finger/mouse at the end of the stroke.
      </div>
    </div>
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

  .status {
    display: grid;
    gap: .6rem;
    text-align: center;
  }

  .row {
    display: flex;
    gap: .65rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .badge {
    display: grid;
    gap: .15rem;
    padding: .55rem .75rem;
    border-radius: .75rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    min-width: 7rem;
  }

  .badge .label {
    font-size: .8rem;
    color: #6b7280;
  }

  .badge .value {
    font-size: 1.2rem;
    font-weight: 900;
    color: #111827;
    letter-spacing: .08em;
  }

  .msg {
    font-weight: 700;
    color: #111827;
  }

  .msg.bad {
    color: #b91c1c;
  }

  .copybook {
    display: grid;
    gap: .85rem;
  }

  .pangram {
    padding: .85rem 1rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: linear-gradient(180deg, #ffffff, #f8fafc);
    text-align: center;
    font-weight: 800;
    letter-spacing: .06em;
    line-height: 1.35;
    user-select: none;
  }

  .pangram .hl {
    display: inline-block;
    padding: 0 .18rem;
    margin: 0 .05rem;
    border-radius: .35rem;
    background: #fde68a;
    border: 2px solid #111827;
  }

  .pangram .ch {
    opacity: 0.85;
  }

  .board {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background: #ffffff;
    padding: 1rem;
    display: grid;
    gap: .75rem;
  }

  .svg {
    width: min(520px, 92vw);
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    border-radius: 18px;
    border: 3px solid #111827;
    background: radial-gradient(circle at 25% 20%, #ffffff, #f3f4f6);
    overflow: hidden;
    display: block;
  }

  .guide {
    stroke: rgba(17, 24, 39, 0.22);
    stroke-width: 1.2;
  }

  .guide.mid {
    stroke-dasharray: 3 3;
  }

  .stroke {
    fill: none;
    stroke: rgba(17, 24, 39, 0.22);
    stroke-width: 9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .stroke.done {
    stroke: rgba(34, 197, 94, 0.35);
  }

  .stroke.current {
    stroke: rgba(37, 99, 235, 0.45);
    stroke-width: 11;
  }

  .num {
    font-size: 7px;
    font-weight: 900;
    fill: rgba(17, 24, 39, 0.55);
    user-select: none;
  }

  .start {
    fill: #2563eb;
    stroke: #111827;
    stroke-width: 1.5;
  }

  .trail {
    fill: none;
    stroke: rgba(17, 24, 39, 0.85);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }

  .trail.bad {
    stroke: rgba(220, 38, 38, 0.9);
  }

  .hint {
    text-align: center;
    color: #374151;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .panel,
    .board {
      padding: .85rem;
    }
  }
</style>
