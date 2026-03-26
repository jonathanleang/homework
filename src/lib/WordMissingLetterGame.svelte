<script>
  import { onMount } from 'svelte'

  const ANIMALS = [
    'ant',
    'bat',
    'bear',
    'bee',
    'bird',
    'camel',
    'cat',
    'cow',
    'deer',
    'dog',
    'duck',
    'fish',
    'fox',
    'frog',
    'goat',
    'horse',
    'lion',
    'panda',
    'sheep',
    'tiger',
  ]

  const OBJECTS = [
    'bag',
    'ball',
    'bed',
    'book',
    'bowl',
    'chair',
    'clock',
    'coat',
    'cup',
    'door',
    'fork',
    'lamp',
    'pencil',
    'phone',
    'plate',
    'ruler',
    'shoe',
    'spoon',
    'table',
    'window',
  ]

  const YEAR1_WORDS = [
    'and',
    'are',
    'big',
    'but',
    'can',
    'dad',
    'day',
    'did',
    'eat',
    'end',
    'fan',
    'for',
    'fun',
    'get',
    'had',
    'ham',
    'has',
    'hat',
    'help',
    'hen',
    'her',
    'him',
    'his',
    'hot',
    'house',
    'jam',
    'jump',
    'kid',
    'like',
    'lip',
    'log',
    'man',
    'mat',
    'milk',
    'mom',
    'not',
    'one',
    'pig',
    'play',
    'ran',
    'red',
    'run',
    'sad',
    'sat',
    'see',
    'she',
    'shop',
    'sit',
    'sun',
    'tap',
    'ten',
    'the',
    'top',
    'tree',
    'wet',
    'will',
    'yes',
    'you',
    'blue',
    'come',
    'down',
    'fast',
    'find',
    'from',
    'good',
    'have',
    'here',
    'home',
    'into',
    'jump',
    'just',
    'kind',
    'look',
    'love',
    'make',
    'many',
    'more',
    'name',
    'need',
    'open',
    'over',
    'park',
    'pink',
    'rain',
    'ride',
    'room',
    'said',
    'same',
    'sing',
    'slow',
    'snow',
    'stop',
    'take',
    'time',
    'want',
    'wash',
    'went',
    'what',
    'when',
    'with',
    'your',
  ]

  const WORDS = Array.from(new Set([...YEAR1_WORDS, ...ANIMALS, ...OBJECTS])).filter(
    (w) => typeof w === 'string' && w.length >= 3
  )

  const HISTORY_KEY = 'word_missing_history'
  const HISTORY_VIS_KEY = 'word_missing_history_show'

  let history = []
  let showHistory = true
  let word = ''
  let missingIndex = 0
  let choices = []
  let selected = ''
  let message = ''
  let isCorrect = false
  let score = 0
  let sayWord = true

  $: total = history.length
  $: correctCount = history.reduce((n, h) => n + (h.correct ? 1 : 0), 0)
  $: wrongCount = total - correctCount
  $: correctPct = total ? Math.round((correctCount / total) * 100) : 0
  $: masked = word ? word.slice(0, missingIndex) + '_' + word.slice(missingIndex + 1) : ''
  $: correctLetter = word ? word[missingIndex] : ''

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
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

  function speak(text) {
    if (!sayWord) return
    if (!text) return
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9
    window.speechSynthesis.speak(u)
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

  function clearHistory() {
    history = []
    saveHistory()
  }

  function resetScore() {
    score = 0
  }

  function newRound() {
    message = ''
    isCorrect = false
    selected = ''
    word = WORDS[randInt(0, WORDS.length - 1)]
    missingIndex = word.length === 1 ? 0 : randInt(0, word.length - 1)

    const set = new Set([word[missingIndex]])
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    while (set.size < 4) {
      set.add(alphabet[randInt(0, alphabet.length - 1)])
    }
    choices = shuffle(Array.from(set))
    speak(word)
  }

  function pick(letter) {
    if (!word) return
    selected = letter
    const ok = letter === correctLetter
    isCorrect = ok
    if (ok) {
      score += 1
      message = 'Correct!'
    } else {
      message = `Wrong. The missing letter is "${correctLetter}".`
    }
    history = [
      ...history,
      {
        t: Date.now(),
        word,
        masked,
        picked: letter,
        correctLetter,
        correct: ok,
      },
    ].slice(-50)
    saveHistory()
    if (ok) {
      setTimeout(() => newRound(), 700)
    }
  }

  onMount(() => {
    loadHistory()
    loadHistoryVisibility()
    newRound()
  })
</script>

<section class="wrap">
  <div class="top">
    <div class="title">Missing Letter</div>
    <div class="desc">Pick the missing letter to complete the word</div>
    <div class="desc">Score: {score}</div>
    <label class="check">
      <input type="checkbox" bind:checked={sayWord} />
      <span class="check-label">Audio: say word</span>
    </label>
  </div>

  <div class="card">
    <div class="word" aria-label="word">{masked}</div>
    <div class="choices" aria-label="choices">
      {#each choices as c}
        <button class="choice" on:click={() => pick(c)}>{c}</button>
      {/each}
    </div>
    {#if message}
      <div class="msg" class:ok={isCorrect}>{message}</div>
    {/if}
    <div class="actions">
      <button on:click={newRound}>New</button>
      <button on:click={resetScore}>Reset Score</button>
    </div>
  </div>

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
        {#each [...history].reverse() as h}
          <li class:ok={h.correct}>
            <span class="q">{h.masked} ({h.picked})</span>
            <span class="r">{h.correct ? 'correct' : `wrong (=${h.correctLetter})`}</span>
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
    display: grid;
    gap: .25rem;
    justify-items: center;
    text-align: center;
  }
  .title {
    font-weight: 800;
    color: var(--text-h);
  }
  .desc {
    color: var(--text);
    font-size: .95rem;
  }
  .check {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    user-select: none;
    color: var(--text-h);
  }
  .check-label {
    line-height: 1;
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
  .word {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: .08em;
    color: #111827;
    text-align: center;
  }
  .choices {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .5rem;
  }
  .choice {
    padding: .75rem 0;
    border-radius: .8rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    font-size: 1.4rem;
    font-weight: 800;
    text-transform: lowercase;
  }
  .choice:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
  }
  .actions {
    display: flex;
    gap: .5rem;
    justify-content: center;
    flex-wrap: wrap;
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
  .history .clear {
    padding: .3rem .6rem;
    border-radius: .5rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
  }
  .history .toggle {
    padding: .3rem .6rem;
    border-radius: .5rem;
    border: 1px solid #e5e7eb;
    background: #eef2ff;
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
    grid-template-columns: 1fr auto;
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
</style>
