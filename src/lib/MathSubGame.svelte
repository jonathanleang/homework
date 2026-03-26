<script>
  import { onDestroy, onMount } from 'svelte'
  let level = '1'
  let a = 0
  let b = 0
  let answer = ''
  let message = ''
  let isCorrect = false
  let autoNext = 0
  let timer = null
  let history = []
  const HISTORY_KEY = 'sub_history'
  let mc = false
  let choices = []
  $: total = history.length
  $: correctCount = history.reduce((n, h) => n + (h.correct ? 1 : 0), 0)
  $: wrongCount = total - correctCount
  $: correctPct = total ? Math.round((correctCount / total) * 100) : 0
  const TARGET = 30
  let levelCorrect = 0
  let finished = false
  const PROGRESS_KEY = 'sub_progress'
  let showHistory = true
  const HISTORY_VIS_KEY = 'sub_history_show'

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function pickNoBorrowTwoDigitPair() {
    const tensA = randInt(1, 9)
    const tensB = randInt(0, tensA)
    const onesA = randInt(0, 9)
    const onesB = randInt(0, onesA)
    return [tensA * 10 + onesA, tensB * 10 + onesB]
  }

  function pickBorrowTwoDigitPair() {
    const onesA = randInt(0, 8)
    const onesB = randInt(onesA + 1, 9)
    const tensA = randInt(1, 9)
    const tensB = randInt(0, tensA - 1)
    return [tensA * 10 + onesA, tensB * 10 + onesB]
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    autoNext = 0
  }

  function newProblem() {
    clearTimer()
    message = ''
    isCorrect = false
    answer = ''
    if (level === '1') {
      a = randInt(0, 9)
      b = randInt(0, a)
      regenChoices()
      return
    }
    if (level === '2') {
      a = randInt(10, 99)
      b = randInt(0, 9)
      regenChoices()
      return
    }
    if (level === '3') {
      ;[a, b] = pickNoBorrowTwoDigitPair()
      regenChoices()
      return
    }
    ;[a, b] = pickBorrowTwoDigitPair()
    regenChoices()
  }

  function startAutoNext() {
    clearTimer()
    autoNext = 5
    timer = setInterval(() => {
      autoNext -= 1
      if (autoNext <= 0) newProblem()
    }, 1000)
  }

  function speak(text) {
    if (!text) return
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    window.speechSynthesis.speak(u)
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = arr[i]
      arr[i] = arr[j]
      arr[j] = t
    }
    return arr
  }
  function regenChoices() {
    const correct = a - b
    const set = new Set([correct])
    while (set.size < 4) {
      const delta = randInt(-10, 10)
      let v = correct + delta
      set.add(v)
    }
    choices = shuffle(Array.from(set))
  }
  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) history = JSON.parse(raw) || []
    } catch {}
  }
  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)))
    } catch {}
  }
  function clearHistory() {
    history = []
    saveHistory()
  }
  function loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      if (raw) {
        const obj = JSON.parse(raw)
        if (obj && typeof obj === 'object') {
          if (obj.level) level = String(obj.level)
          if (Number.isFinite(obj.levelCorrect)) levelCorrect = obj.levelCorrect
        }
      }
    } catch {}
  }
  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ level, levelCorrect }))
    } catch {}
  }
  function resetProgressToLevel(l) {
    level = String(l)
    levelCorrect = 0
    finished = false
    saveProgress()
  }
  function loadHistoryVisibility() {
    try {
      const raw = localStorage.getItem(HISTORY_VIS_KEY)
      if (raw != null) showHistory = !!JSON.parse(raw)
    } catch {}
  }
  function saveHistoryVisibility() {
    try {
      localStorage.setItem(HISTORY_VIS_KEY, JSON.stringify(showHistory))
    } catch {}
  }

  function check() {
    const n = parseInt(answer, 10)
    if (!Number.isFinite(n)) return
    const correct = a - b
    const ok = n === correct
    history = [
      ...history,
      {
        t: Date.now(),
        level,
        a,
        b,
        op: '−',
        answer: Number.isFinite(n) ? n : null,
        expected: correct,
        correct: ok,
      },
    ].slice(-50)
    saveHistory()
    if (n === correct) {
      isCorrect = true
      message = 'Correct!'
      speak('correct')
      levelCorrect += 1
      saveProgress()
      if (levelCorrect >= TARGET) {
        if (level !== '4') {
          resetProgressToLevel(Number(level) + 1)
          regenChoices()
          message = 'Level up!'
          speak('level up')
          newProblem()
          return
        }
        finished = true
        clearTimer()
        speak('winner')
        return
      }
      startAutoNext()
    } else {
      isCorrect = false
      message = `Try again. Answer is ${correct}.`
      speak('wrong')
      clearTimer()
    }
  }
  function pickChoice(c) {
    answer = String(c)
    check()
  }

  $: levelTitle =
    level === '1'
      ? 'Level 1: single digit - single digit'
      : level === '2'
        ? 'Level 2: two digit - single digit'
        : level === '3'
          ? 'Level 3: two digit - two digit (no borrow)'
          : 'Level 4: two digit - two digit (with borrow)'

  onMount(() => {
    loadProgress()
    newProblem()
    loadHistory()
    loadHistoryVisibility()
  })

  onDestroy(() => {
    if (timer) clearInterval(timer)
  })
</script>

<section class="wrap">
  <div class="top">
    <div class="title">Minus</div>
    <label class="level">
      <span>Level</span>
      <select bind:value={level} on:change={() => { resetProgressToLevel(level); regenChoices(); newProblem() }}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
    </label>
    <div class="desc">{levelTitle}</div>
    <label class="level">
      <input type="checkbox" bind:checked={mc} on:change={regenChoices} />
      <span>Multiple choice</span>
    </label>
    <div class="desc">Progress: {levelCorrect}/{TARGET}</div>
  </div>

  {#if !finished}
  <div class="card">
    <div class="problem" aria-label="problem">{a} − {b} = ?</div>

    <div class="answer-row">
      {#if !mc}
        <input
          type="number"
          bind:value={answer}
          inputmode="numeric"
          on:keydown={(e) => {
            if (e.key === 'Enter') check()
          }}
        />
      {/if}
      <button on:click={check}>Check</button>
      <button on:click={newProblem}>
        {isCorrect ? (autoNext ? `Next (${autoNext})` : 'Next') : 'New'}
      </button>
    </div>
    {#if mc}
      <div class="choices">
        {#each choices as c}
          <button class="choice" on:click={() => pickChoice(c)}>{c}</button>
        {/each}
      </div>
    {/if}

    {#if message}
      <div class="msg" class:ok={isCorrect}>{message}</div>
    {/if}
  </div>
  {:else}
  <div class="card">
    <div class="problem" aria-label="winner">Winner!</div>
    <div class="msg ok">You finished all levels.</div>
    <div class="statsline">Total: {total} · Correct: {correctCount} · Wrong: {wrongCount} · {correctPct}%</div>
    <div class="answer-row">
      <button on:click={() => { resetProgressToLevel(1); regenChoices(); newProblem() }}>Play Again</button>
    </div>
  </div>
  {/if}

  <div class="history">
    <div class="history-head">
      <div>History <span class="stats">Total: {total} · Correct: {correctCount} · Wrong: {wrongCount} · {correctPct}%</span></div>
      <div class="history-actions">
        <button class="toggle" on:click={() => { showHistory = !showHistory; saveHistoryVisibility() }}>{showHistory ? 'Hide' : 'Show'}</button>
        <button class="clear" on:click={clearHistory}>Clear</button>
      </div>
    </div>
    {#if !showHistory}
      <div class="empty">History hidden</div>
    {:else if history.length === 0}
      <div class="empty">No attempts yet</div>
    {:else}
      <ul>
        {#each [...history].reverse() as h, i}
          <li class:ok={h.correct}>
            <span class="q">{h.a} − {h.b} = {h.answer}</span>
            <span class="r">{h.correct ? 'correct' : `wrong (=${h.expected})`}</span>
            <span class="lv">L{h.level}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .wrap {
    display: grid;
    gap: .75rem;
    justify-items: center;
  }
  .top {
    display: flex;
    gap: .75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    text-align: left;
  }
  .title {
    font-weight: 800;
    color: var(--text-h);
  }
  .level {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    color: var(--text-h);
  }
  select {
    padding: .35rem .5rem;
    border-radius: .5rem;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
  }
  .desc {
    color: var(--text);
    font-size: .9rem;
  }
  .card {
    width: min(92vw, 560px);
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    padding: 1rem;
    display: grid;
    gap: .75rem;
    box-shadow: 0 10px 20px rgba(0,0,0,.06);
  }
  .problem {
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: -1px;
    color: #111827;
    text-align: center;
  }
  .answer-row {
    display: flex;
    gap: .5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .5rem;
  }
  .choice {
    padding: .6rem 1rem;
    border-radius: .7rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .choice:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
  }
  input[type="number"] {
    width: 10rem;
    padding: .65rem .8rem;
    border-radius: .7rem;
    border: 1px solid #d1d5db;
    font-size: 1.6rem;
    background: #e5e7eb;
    color: #111827;
  }
  button {
    padding: .55rem 1rem;
    border-radius: .7rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .msg {
    text-align: center;
    padding: .55rem .8rem;
    border-radius: .7rem;
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #111827;
  }
  .msg.ok {
    background: #dcfce7;
    border-color: #86efac;
  }
  .statsline {
    text-align: center;
    color: #111827;
  }
  .history {
    width: min(92vw, 560px);
    display: grid;
    gap: .5rem;
  }
  .history-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-h);
  }
  .history-actions {
    display: inline-flex;
    gap: .5rem;
  }
  .history-head .stats {
    margin-left: .5rem;
    color: #111827;
    font-size: .9rem;
  }
  .history .toggle {
    padding: .3rem .6rem;
    border-radius: .5rem;
    border: 1px solid #e5e7eb;
    background: #eef2ff;
    color: #111827;
  }
  .history .clear {
    padding: .3rem .6rem;
    border-radius: .5rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .history ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 6px;
    max-height: 220px;
    overflow: auto;
  }
  .history li {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: .5rem;
    font-size: .95rem;
    padding: .4rem .6rem;
    border: 1px solid #e5e7eb;
    border-radius: .5rem;
    background: #fff;
  }
  .history li.ok {
    border-color: #86efac;
    background: #f0fdf4;
  }
  .history .q { color: #111827; }
  .history .r { color: #111827; }
  .history .lv { color: #111827; }
</style>
