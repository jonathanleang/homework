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
      return
    }
    if (level === '2') {
      a = randInt(10, 99)
      b = randInt(0, 9)
      return
    }
    if (level === '3') {
      ;[a, b] = pickNoBorrowTwoDigitPair()
      return
    }
    ;[a, b] = pickBorrowTwoDigitPair()
  }

  function startAutoNext() {
    clearTimer()
    autoNext = 5
    timer = setInterval(() => {
      autoNext -= 1
      if (autoNext <= 0) newProblem()
    }, 1000)
  }

  function check() {
    const n = parseInt(answer, 10)
    if (!Number.isFinite(n)) return
    const correct = a - b
    if (n === correct) {
      isCorrect = true
      message = 'Correct!'
      startAutoNext()
    } else {
      isCorrect = false
      message = `Try again. Answer is ${correct}.`
      clearTimer()
    }
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
    newProblem()
  })

  onDestroy(() => {
    if (timer) clearInterval(timer)
  })
</script>

<section class="wrap">
  <div class="top">
    <label class="level">
      <span>Level</span>
      <select bind:value={level} on:change={newProblem}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select>
    </label>
    <div class="desc">{levelTitle}</div>
  </div>

  <div class="card">
    <div class="problem" aria-label="problem">{a} − {b} = ?</div>

    <div class="answer-row">
      <input
        type="number"
        bind:value={answer}
        inputmode="numeric"
        on:keydown={(e) => {
          if (e.key === 'Enter') check()
        }}
      />
      <button on:click={check}>Check</button>
      <button on:click={newProblem}>
        {isCorrect ? (autoNext ? `Next (${autoNext})` : 'Next') : 'New'}
      </button>
    </div>

    {#if message}
      <div class="msg" class:ok={isCorrect}>{message}</div>
    {/if}
  </div>
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
    justify-items: center;
    text-align: center;
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
    font-size: .95rem;
  }
  .card {
    width: min(92vw, 560px);
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
    box-shadow: 0 10px 20px rgba(0,0,0,.06);
  }
  .problem {
    font-size: 3rem;
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
  input[type="number"] {
    width: 10rem;
    padding: .55rem .7rem;
    border-radius: .7rem;
    border: 1px solid #d1d5db;
    font-size: 1.1rem;
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
</style>
