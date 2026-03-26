<script>
  import { onMount } from 'svelte'
  let segments = 8
  let rotate = 0
  let spinning = false
  let planned = null
  let result = null
  let sayWinner = true
  const MIN_SEG = 1
  $: seg = Math.max(MIN_SEG, Math.floor(segments || MIN_SEG))
  $: step = 360 / seg
  $: wheelBg =
    seg > 500
      ? 'conic-gradient(#ef4444, #f97316, #facc15, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)'
      : 'repeating-conic-gradient(#fde68a 0 var(--a), #fca5a5 0 calc(var(--a) * 2))'
  const maxLabels = 20
  $: labelIndices = (() => {
    if (seg <= maxLabels) return Array.from({ length: seg }, (_, i) => i)
    const s = Math.max(1, Math.ceil((seg - 1) / (maxLabels - 1)))
    const set = new Set()
    for (let i = 0; i < seg; i += s) set.add(i)
    set.add(seg - 1)
    return Array.from(set).sort((a, b) => a - b)
  })()
  function numberToWords(n) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    if (!Number.isFinite(n)) return ''
    n = Math.floor(n)
    if (n === 0) return 'zero'
    if (n < 0) return `minus ${numberToWords(-n)}`
    if (n > 10000) return String(n)
    if (n === 10000) return 'ten thousand'
    const parts = []
    const thousands = Math.floor(n / 1000)
    const hundreds = Math.floor((n % 1000) / 100)
    const rem = n % 100
    if (thousands) parts.push(`${ones[thousands]} thousand`)
    if (hundreds) parts.push(`${ones[hundreds]} hundred`)
    if (rem) {
      if (rem < 10) {
        parts.push(ones[rem])
      } else if (rem < 20) {
        parts.push(teens[rem - 10])
      } else {
        const t = Math.floor(rem / 10)
        const o = rem % 10
        parts.push(o ? `${tens[t]}-${ones[o]}` : tens[t])
      }
    }
    return parts.join(' ')
  }
  $: resultWords = result ? numberToWords(result) : ''
  function speak(text) {
    if (!sayWinner) return
    if (!text) return
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    window.speechSynthesis.speak(u)
  }
  function spin() {
    if (spinning) return
    const turns = Math.floor(Math.random() * 10) + 10
    const target = Math.floor(Math.random() * seg)
    const mid = target * step + step / 2
    rotate = turns * 360 + 90 - mid
    planned = target + 1
    result = null
    spinning = true
  }
  function done() {
    if (spinning) {
      spinning = false
      result = planned
      speak(numberToWords(planned))
    }
  }
  onMount(() => {
    rotate = 0
  })
</script>

<div class="wrap">
  <div class="controls">
    <label>
      Segments
      <input
        type="number"
        bind:value={segments}
        min={MIN_SEG}
        step="1"
        inputmode="numeric"
        pattern="\\d*"
        on:input={(e) => {
          const v = parseInt(e.currentTarget.value || '')
          if (Number.isNaN(v)) {
            segments = MIN_SEG
            e.currentTarget.value = String(MIN_SEG)
          } else {
            segments = Math.max(MIN_SEG, v)
            if (segments !== v) e.currentTarget.value = String(segments)
          }
        }}
      />
    </label>
    <label class="check">
      <input type="checkbox" bind:checked={sayWinner} />
      <span class="check-label">Audio: say winner</span>
    </label>
    <button on:click={spin} disabled={spinning}>Spin</button>
  </div>
  <div class="stage">
    <div class="pointer"></div>
    <div class="wheel" style="--a: {step}deg; background: {wheelBg}; transform: rotate({rotate}deg);" on:transitionend={done}>
      {#each labelIndices as i}
        {#key seg + '-' + i}
          <span class="label" style="--angle: {(i * step + step / 2)}deg">{i + 1}</span>
        {/key}
      {/each}
    </div>
  </div>
  <div class="readout">
    {#if result}
      <div class="res">Winner: {result} ({resultWords})</div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    display: grid;
    gap: 1rem;
    justify-items: center;
  }
  .controls {
    display: flex;
    gap: .75rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }
  input[type="number"] {
    width: 6rem;
    padding: .4rem .5rem;
    border: 1px solid #d1d5db;
    border-radius: .5rem;
  }
  button {
    padding: .5rem 1rem;
    border-radius: .6rem;
    border: 1px solid #c7d2fe;
    background: #eef2ff;
    color: #111827;
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
  .stage {
    position: relative;
    width: min(82vw, 420px);
    aspect-ratio: 1/1;
    display: grid;
    place-items: center;
  }
  .wheel {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 6px solid #111827;
    transition: transform 5s cubic-bezier(.12,.7,.08,1);
    box-shadow: 0 6px 18px rgba(0,0,0,.2) inset, 0 10px 20px rgba(0,0,0,.12);
    display: grid;
    place-items: center;
  }
  .label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: rotate(var(--angle))
      translateX(calc(min(82vw, 420px) * 0.38))
      rotate(calc(-1 * var(--angle)))
      translateX(-50%);
    font-weight: 700;
    color: #111827;
    user-select: none;
    white-space: nowrap;
    text-align: center;
  }
  .pointer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -8px;
    width: 0;
    height: 0;
    border-left: 14px solid transparent;
    border-right: 14px solid transparent;
    border-top: 22px solid #ef4444;
    z-index: 2;
    filter: drop-shadow(0 2px 1px rgba(0,0,0,.2));
  }
  .readout {
    min-height: 1.5rem;
    font-size: 1.125rem;
  }
  .res {
    padding: .4rem .8rem;
    border-radius: .6rem;
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #111827;
  }
</style>
