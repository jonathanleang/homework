<script>
  import { onDestroy, onMount } from 'svelte'

  const SETTINGS_KEY = 'copybook_print_settings'
  const SCORE_KEY = 'copybook_print_score'

  const PANGRAMS = [
    'THE QUICK BROWN FOX JUMPS OVER A LAZY DOG',
    'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
    'SPHINX OF BLACK QUARTZ, JUDGE MY VOW',
    'HOW VEXINGLY QUICK DAFT ZEBRAS JUMP',
    'WALTZ, BAD NYMPH, FOR QUICK JIGS VEX',
    'JIVED FOX NYMPH GRABS QUICK WALTZ',
  ]

  const LETTERS = {
    A: { strokes: [[[24, 90], [50, 10], [76, 90]], [[33, 60], [67, 60]]] },
    B: { strokes: [[[26, 10], [26, 90]], [[26, 10], [70, 25], [62, 45], [26, 45]], [[26, 45], [74, 62], [66, 90], [26, 90]]] },
    C: { strokes: [[[78, 22], [62, 12], [40, 12], [24, 28], [20, 50], [24, 72], [40, 88], [62, 88], [78, 78]]] },
    D: { strokes: [[[26, 10], [26, 90]], [[26, 10], [72, 30], [72, 70], [26, 90]]] },
    E: { strokes: [[[26, 10], [26, 90]], [[26, 10], [78, 10]], [[26, 50], [66, 50]], [[26, 90], [78, 90]]] },
    F: { strokes: [[[26, 10], [26, 90]], [[26, 10], [78, 10]], [[26, 50], [66, 50]]] },
    G: { strokes: [[[78, 22], [62, 12], [40, 12], [24, 28], [20, 50], [24, 72], [40, 88], [62, 88], [78, 78], [66, 62], [56, 62]]] },
    H: { strokes: [[[26, 10], [26, 90]], [[74, 10], [74, 90]], [[26, 50], [74, 50]]] },
    I: { strokes: [[[32, 10], [68, 10]], [[50, 10], [50, 90]], [[32, 90], [68, 90]]] },
    J: { strokes: [[[30, 10], [70, 10]], [[62, 10], [62, 74], [54, 88], [36, 84], [28, 70]]] },
    K: { strokes: [[[26, 10], [26, 90]], [[74, 10], [30, 52]], [[36, 50], [74, 90]]] },
    L: { strokes: [[[26, 10], [26, 90]], [[26, 90], [78, 90]]] },
    M: { strokes: [[[22, 90], [22, 10]], [[22, 10], [50, 55]], [[50, 55], [78, 10]], [[78, 10], [78, 90]]] },
    N: { strokes: [[[26, 90], [26, 10]], [[26, 10], [74, 90]], [[74, 90], [74, 10]]] },
    O: { strokes: [[[50, 10], [32, 18], [22, 36], [22, 64], [32, 82], [50, 90], [68, 82], [78, 64], [78, 36], [68, 18], [50, 10]]] },
    P: { strokes: [[[26, 10], [26, 90]], [[26, 10], [72, 28], [62, 46], [26, 46]]] },
    Q: { strokes: [[[50, 10], [32, 18], [22, 36], [22, 64], [32, 82], [50, 90], [68, 82], [78, 64], [78, 36], [68, 18], [50, 10]], [[58, 70], [78, 92]]] },
    R: { strokes: [[[26, 10], [26, 90]], [[26, 10], [72, 28], [62, 46], [26, 46]], [[26, 46], [78, 90]]] },
    S: { strokes: [[[76, 22], [60, 12], [40, 14], [28, 26], [44, 46], [62, 56], [76, 70], [62, 88], [40, 88], [26, 78]]] },
    T: { strokes: [[[24, 10], [76, 10]], [[50, 10], [50, 90]]] },
    U: { strokes: [[[26, 10], [26, 70], [34, 86], [66, 86], [74, 70], [74, 10]]] },
    V: { strokes: [[[24, 10], [50, 90], [76, 10]]] },
    W: { strokes: [[[22, 10], [30, 90]], [[30, 90], [50, 55]], [[50, 55], [70, 90]], [[70, 90], [78, 10]]] },
    X: { strokes: [[[26, 10], [74, 90]], [[74, 10], [26, 90]]] },
    Y: { strokes: [[[26, 10], [50, 44], [74, 10]], [[50, 44], [50, 90]]] },
    Z: { strokes: [[[26, 10], [74, 10]], [[74, 10], [26, 90]], [[26, 90], [74, 90]]] },
  }

  const LOWER = {
    a: { strokes: [[[66, 58], [56, 54], [42, 54], [34, 62], [34, 78], [42, 88], [56, 88], [66, 78], [66, 62], [66, 90]]] },
    b: { strokes: [[[36, 20], [36, 90]], [[36, 54], [56, 54], [66, 64], [66, 78], [56, 88], [36, 82]]] },
    c: { strokes: [[[66, 62], [56, 54], [42, 56], [34, 66], [34, 78], [42, 88], [56, 88], [66, 80]]] },
    d: { strokes: [[[62, 62], [54, 54], [42, 54], [34, 62], [34, 78], [42, 88], [56, 88], [66, 78], [66, 64], [62, 62]], [[66, 20], [66, 90]]] },
    e: { strokes: [[[34, 72], [66, 72], [62, 60], [50, 54], [40, 58], [36, 68], [40, 84], [56, 88], [66, 80]]] },
    f: { strokes: [[[56, 20], [48, 26], [44, 38], [44, 72], [50, 90]], [[34, 50], [66, 50]]] },
    g: { strokes: [[[54, 54], [42, 58], [36, 70], [40, 84], [54, 88], [68, 84], [72, 70], [66, 58], [54, 54]], [[66, 84], [62, 96], [44, 98], [34, 92]]] },
    h: { strokes: [[[36, 20], [36, 90]], [[36, 54], [36, 54], [46, 50], [60, 52], [66, 64], [66, 90]]] },
    i: { strokes: [[[50, 54], [50, 90]], [[50, 34], [50, 36]]] },
    j: { strokes: [[[54, 54], [54, 92], [46, 98], [36, 92]], [[54, 34], [54, 36]]] },
    k: { strokes: [[[36, 20], [36, 90]], [[66, 56], [40, 72]], [[44, 68], [68, 90]]] },
    l: { strokes: [[[50, 20], [50, 90]]] },
    m: { strokes: [[[22, 54], [22, 90]], [[22, 54], [34, 50], [46, 52], [50, 64], [50, 90]], [[50, 54], [62, 50], [74, 52], [78, 64], [78, 90]]] },
    n: { strokes: [[[36, 54], [36, 90]], [[36, 54], [48, 50], [60, 52], [66, 64], [66, 90]]] },
    o: { strokes: [[[54, 54], [42, 58], [36, 70], [40, 84], [54, 88], [68, 84], [72, 70], [66, 58], [54, 54]]] },
    p: { strokes: [[[36, 54], [36, 96]], [[36, 54], [56, 54], [66, 64], [66, 78], [56, 88], [36, 82]]] },
    q: { strokes: [[[54, 54], [42, 58], [36, 70], [40, 84], [54, 88], [68, 84], [72, 70], [66, 58], [54, 54]], [[66, 82], [66, 96]]] },
    r: { strokes: [[[36, 54], [36, 90]], [[36, 62], [46, 52], [60, 56]]] },
    s: { strokes: [[[66, 60], [56, 54], [44, 56], [54, 68], [68, 76], [58, 88], [44, 84]]] },
    t: { strokes: [[[50, 20], [50, 90]], [[34, 54], [66, 54]]] },
    u: { strokes: [[[36, 54], [36, 78], [42, 88], [56, 88], [62, 78], [62, 54], [62, 90]]] },
    v: { strokes: [[[36, 54], [50, 90], [64, 54]]] },
    w: { strokes: [[[26, 54], [36, 90], [50, 66], [64, 90], [74, 54]]] },
    x: { strokes: [[[36, 54], [66, 90]], [[66, 54], [36, 90]]] },
    y: { strokes: [[[36, 54], [50, 76], [64, 54]], [[50, 76], [50, 96], [40, 98]]] },
    z: { strokes: [[[36, 54], [66, 54], [36, 90], [66, 90]]] },
  }

  let pangram = PANGRAMS[0]
  let pangramIndex = -1
  let letterCap = 'A'
  let letterSmall = 'a'
  let capStrokeIndex = 0
  let smallStrokeIndex = 0
  let message = ''

  let sayLetter = true
  let tolerance = 16
  let score = 0
  let didMount = false

  let capSvgEl = {
    setPointerCapture(pointerId) {
      pointerId
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1, height: 1 }
    },
  }
  let capDrawing = false
  let capBad = false
  let capLastT = 0
  let capStartOk = false
  let capWaypointIndex = 0
  let capTrail = []

  let smallSvgEl = {
    setPointerCapture(pointerId) {
      pointerId
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1, height: 1 }
    },
  }
  let smallDrawing = false
  let smallBad = false
  let smallLastT = 0
  let smallStartOk = false
  let smallWaypointIndex = 0
  let smallTrail = []

  let finishTimer = null

  $: capTotal = LETTERS[letterCap]?.strokes?.length || 0
  $: smallTotal = LOWER[letterSmall]?.strokes?.length || 0

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
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s && typeof s === 'object') {
          if (typeof s.sayLetter === 'boolean') sayLetter = s.sayLetter
          if (typeof s.tolerance === 'number') tolerance = Math.max(10, Math.min(28, s.tolerance))
        }
      }
    } catch {}
    try {
      const raw = localStorage.getItem(SCORE_KEY)
      if (raw) score = parseInt(raw, 10) || 0
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

  function strokePath(points) {
    if (!points?.length) return ''
    return `M ${points.map((p) => `${p[0]} ${p[1]}`).join(' L ')}`
  }

  function trailPath(points) {
    if (!points?.length) return ''
    return `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`
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

  function progressOnPolylineForward(px, py, poly, minT01) {
    let best = { dist: Infinity, t01: 0 }
    let walked = 0
    const total = Math.max(1, polylineLength(poly))
    for (let i = 1; i < poly.length; i++) {
      const [ax, ay] = poly[i - 1]
      const [bx, by] = poly[i]
      const segLen = Math.hypot(bx - ax, by - ay)
      const proj = projectPointToSegment(px, py, ax, ay, bx, by)
      const t01 = Math.max(0, Math.min(1, (walked + proj.tt * segLen) / total))
      if (t01 + 0.03 < minT01) {
        walked += segLen
        continue
      }
      if (proj.dist < best.dist) best = { dist: proj.dist, t01 }
      walked += segLen
    }
    if (best.dist !== Infinity) return best
    return progressOnPolyline(px, py, poly)
  }

  function isCurved(poly) {
    return Array.isArray(poly) && poly.length >= 5
  }

  function waypointTsForPoly(poly) {
    if (!isCurved(poly)) return []
    return [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
  }

  function pointAtT(poly, t01) {
    const total = Math.max(1, polylineLength(poly))
    const target = Math.max(0, Math.min(1, t01)) * total
    let walked = 0
    for (let i = 1; i < poly.length; i++) {
      const [ax, ay] = poly[i - 1]
      const [bx, by] = poly[i]
      const segLen = Math.hypot(bx - ax, by - ay)
      if (walked + segLen >= target) {
        const tt = segLen === 0 ? 0 : (target - walked) / segLen
        return { x: ax + (bx - ax) * tt, y: ay + (by - ay) * tt }
      }
      walked += segLen
    }
    const last = poly[poly.length - 1]
    return { x: last[0], y: last[1] }
  }

  function waypointsForPoly(poly) {
    const ts = waypointTsForPoly(poly)
    return ts.map((t01) => ({ t01, ...pointAtT(poly, t01) }))
  }

  function svgPointFromEventOnEl(e, el) {
    const rect = el?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    return { x, y }
  }

  function setLetter(nextLetter, nextIndex) {
    letterCap = nextLetter
    letterSmall = String(nextLetter).toLowerCase()
    pangramIndex = nextIndex
    capStrokeIndex = 0
    smallStrokeIndex = 0
    capBad = false
    capLastT = 0
    capStartOk = false
    capWaypointIndex = 0
    capTrail = []
    smallBad = false
    smallLastT = 0
    smallStartOk = false
    smallWaypointIndex = 0
    smallTrail = []
    message = 'Trace both: capital on the left, lowercase on the right.'
    speak(letterCap)
  }

  function nextLetterFromPangram() {
    const s = pangram
    for (let i = pangramIndex + 1; i < s.length; i++) {
      const ch = s[i]
      if (ch >= 'A' && ch <= 'Z') {
        setLetter(ch, i)
        return
      }
    }
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (ch >= 'A' && ch <= 'Z') {
        setLetter(ch, i)
        return
      }
    }
    setLetter('A', -1)
  }

  function newPangram() {
    if (finishTimer) {
      clearTimeout(finishTimer)
      finishTimer = null
    }
    pangram = PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)]
    pangramIndex = -1
    nextLetterFromPangram()
  }

  function restartLetter() {
    if (finishTimer) {
      clearTimeout(finishTimer)
      finishTimer = null
    }
    capStrokeIndex = 0
    smallStrokeIndex = 0
    capBad = false
    capLastT = 0
    capStartOk = false
    capWaypointIndex = 0
    capTrail = []
    smallBad = false
    smallLastT = 0
    smallStartOk = false
    smallWaypointIndex = 0
    smallTrail = []
    message = 'Trace both: capital on the left, lowercase on the right.'
    speak(letterCap)
  }

  function currentStroke(side) {
    if (side === 'cap') return LETTERS[letterCap]?.strokes?.[capStrokeIndex] || null
    return LOWER[letterSmall]?.strokes?.[smallStrokeIndex] || null
  }

  function tick(side, x, y) {
    const poly = currentStroke(side)
    if (!poly) return
    const minT01 = side === 'cap' ? capLastT : smallLastT
    const p = progressOnPolylineForward(x, y, poly, minT01)
    if (p.dist > tolerance) {
      if (side === 'cap') capBad = true
      else smallBad = true
      return
    }
    const wts = waypointTsForPoly(poly)
    if (wts.length) {
      const slack = 0.02
      const radius = tolerance * 1.15
      if (side === 'cap') {
        while (capWaypointIndex < wts.length) {
          const wt = wts[capWaypointIndex]
          const wp = pointAtT(poly, wt)
          const near = Math.hypot(x - wp.x, y - wp.y) <= radius
          if (near || p.t01 >= wt - slack) capWaypointIndex += 1
          else break
        }
      } else {
        while (smallWaypointIndex < wts.length) {
          const wt = wts[smallWaypointIndex]
          const wp = pointAtT(poly, wt)
          const near = Math.hypot(x - wp.x, y - wp.y) <= radius
          if (near || p.t01 >= wt - slack) smallWaypointIndex += 1
          else break
        }
      }
    }
    if (side === 'cap' && p.t01 + 0.02 < capLastT) {
      capBad = true
      return
    }
    if (side === 'small' && p.t01 + 0.02 < smallLastT) {
      smallBad = true
      return
    }
    if (side === 'cap') capLastT = Math.max(capLastT, p.t01)
    else smallLastT = Math.max(smallLastT, p.t01)
  }

  function startDraw(side, e) {
    const el = side === 'cap' ? capSvgEl : smallSvgEl
    if (!el) return
    e.preventDefault?.()
    if (typeof e?.pointerId === 'number') el.setPointerCapture?.(e.pointerId)

    const poly = currentStroke(side)
    if (!poly || !poly.length) return
    const total = side === 'cap' ? LETTERS[letterCap]?.strokes?.length || 0 : LOWER[letterSmall]?.strokes?.length || 0
    const idx = side === 'cap' ? capStrokeIndex : smallStrokeIndex
    if (idx >= total) return

    const p = svgPointFromEventOnEl(e, el)
    const [sx, sy] = poly[0]
    if (Math.hypot(p.x - sx, p.y - sy) > tolerance * 1.2) {
      if (side === 'cap') capDrawing = false
      else smallDrawing = false
      if (side === 'cap') capBad = true
      else smallBad = true
      message = side === 'cap' ? 'Capital: start at the dot.' : 'Lowercase: start at the dot.'
      return
    }

    if (side === 'cap') capDrawing = true
    else smallDrawing = true
    if (side === 'cap') capBad = false
    else smallBad = false
    if (side === 'cap') capLastT = 0
    else smallLastT = 0
    if (side === 'cap') capStartOk = true
    else smallStartOk = true
    if (side === 'cap') capWaypointIndex = 0
    else smallWaypointIndex = 0
    if (side === 'cap') capTrail = [p]
    else smallTrail = [p]
    tick(side, p.x, p.y)
  }

  function moveDraw(side, e) {
    if (side === 'cap' && !capDrawing) return
    if (side === 'small' && !smallDrawing) return
    e.preventDefault?.()
    const el = side === 'cap' ? capSvgEl : smallSvgEl
    const p = svgPointFromEventOnEl(e, el)
    if (side === 'cap') capTrail = [...capTrail, p]
    else smallTrail = [...smallTrail, p]
    tick(side, p.x, p.y)
  }

  function endDraw(side) {
    if (side === 'cap' && !capDrawing) return
    if (side === 'small' && !smallDrawing) return
    if (side === 'cap') capDrawing = false
    else smallDrawing = false
    const startOk = side === 'cap' ? capStartOk : smallStartOk
    const bad = side === 'cap' ? capBad : smallBad
    const lastT = side === 'cap' ? capLastT : smallLastT
    if (!startOk) {
      message = side === 'cap' ? 'Capital: start at the dot.' : 'Lowercase: start at the dot.'
      return
    }
    if (bad) {
      message = side === 'cap' ? 'Capital: try again — stay on the line.' : 'Lowercase: try again — stay on the line.'
      return
    }
    if (lastT < 0.92) {
      message = side === 'cap' ? 'Capital: keep going to the end of the stroke.' : 'Lowercase: keep going to the end of the stroke.'
      return
    }

    const poly = currentStroke(side)
    const wts = waypointTsForPoly(poly)
    const wIndex = side === 'cap' ? capWaypointIndex : smallWaypointIndex
    if (wts.length && wIndex < wts.length) {
      message = side === 'cap' ? 'Capital: follow the dots around the curve.' : 'Lowercase: follow the dots around the curve.'
      return
    }

    if (side === 'cap') capStrokeIndex += 1
    else smallStrokeIndex += 1

    if (side === 'cap') capTrail = []
    else smallTrail = []
    if (side === 'cap') capLastT = 0
    else smallLastT = 0
    if (side === 'cap') capStartOk = false
    else smallStartOk = false
    if (side === 'cap') capWaypointIndex = 0
    else smallWaypointIndex = 0

    const capTotal = LETTERS[letterCap]?.strokes?.length || 0
    const smallTotal = LOWER[letterSmall]?.strokes?.length || 0
    const capDone = capStrokeIndex >= capTotal
    const smallDone = smallStrokeIndex >= smallTotal

    if (capDone && smallDone) {
      score += 1
      message = 'Nice! Letter pair complete.'
      if (finishTimer) clearTimeout(finishTimer)
      finishTimer = setTimeout(() => nextLetterFromPangram(), 650)
      return
    }

    if (side === 'cap') {
      if (capStrokeIndex >= capTotal) message = 'Capital done. Now finish the lowercase.'
      else message = `Capital: stroke ${capStrokeIndex + 1}.`
    } else {
      if (smallStrokeIndex >= smallTotal) message = 'Lowercase done. Now finish the capital.'
      else message = `Lowercase: stroke ${smallStrokeIndex + 1}.`
    }
  }

  function resetScore() {
    score = 0
  }

  function arrowPath(poly, t01) {
    if (!poly || poly.length < 2) return ''
    const start = Math.max(0, Math.min(1, t01 || 0))
    const end = Math.max(0, Math.min(1, start + 0.18))
    if (end <= start + 0.001) return ''
    const steps = 6
    const points = []
    for (let i = 0; i <= steps; i++) {
      const tt = start + (end - start) * (i / steps)
      points.push(pointAtT(poly, tt))
    }
    return `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`
  }

  function endPoint(poly) {
    if (!poly || !poly.length) return null
    const last = poly[poly.length - 1]
    return { x: last[0], y: last[1] }
  }

  $: persist(sayLetter, tolerance, score)

  onMount(() => {
    load()
    didMount = true
    newPangram()
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
    <h1>Print Copybook</h1>
    <p>Practice print letter stroke order using pangrams.</p>
  </header>

  <section class="panel">
    <div class="controls">
      <button class="btn" on:click={newPangram}>New pangram</button>
      <button class="btn" on:click={nextLetterFromPangram}>Next letter</button>
      <button class="btn" on:click={restartLetter}>Restart letter</button>
      <button class="btn" on:click={resetScore}>Reset score</button>

      <label class="check">
        <input type="checkbox" bind:checked={sayLetter} />
        <span>Say letter</span>
      </label>

      <label class="control">
        <span>Difficulty</span>
        <select bind:value={tolerance}>
          <option value={22}>Easy</option>
          <option value={16}>Normal</option>
          <option value={12}>Hard</option>
        </select>
      </label>
    </div>

    <div class="status" aria-live="polite">
      <div class="row">
        <div class="badge">
          <span class="label">Letter</span>
          <span class="value">{letterCap} {letterSmall}</span>
        </div>
        <div class="badge">
          <span class="label">Capital</span>
          <span class="value">{Math.min(capStrokeIndex + 1, capTotal)}/{capTotal}</span>
        </div>
        <div class="badge">
          <span class="label">Lowercase</span>
          <span class="value">{Math.min(smallStrokeIndex + 1, smallTotal)}/{smallTotal}</span>
        </div>
        <div class="badge">
          <span class="label">Score</span>
          <span class="value">{score}</span>
        </div>
      </div>
      <div class="msg" class:bad={capBad || smallBad}>{message}</div>
    </div>
  </section>

  <section class="copybook">
    <div class="pangram" aria-label="pangram">
      {#each pangram.split('') as ch, i (i)}
        {#if i === pangramIndex}
          <span class="hl">{ch}</span>
        {:else}
          <span class="ch">{ch}</span>
        {/if}
      {/each}
    </div>

    <div class="boards">
      <div class="board">
        <div class="board-title">Capital</div>
        <svg
          bind:this={capSvgEl}
          class="svg"
          viewBox="0 0 100 100"
          role="img"
          aria-label="trace capital letter"
          on:pointerdown={(e) => startDraw('cap', e)}
          on:pointermove={(e) => moveDraw('cap', e)}
          on:pointerup={() => endDraw('cap')}
          on:pointercancel={() => endDraw('cap')}
          on:mouseleave={() => endDraw('cap')}
          style="touch-action: none;"
        >
          <defs>
            <filter id="soft2" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.18)" />
            </filter>
            <marker id="arrow2" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34, 197, 94, 0.95)" />
            </marker>
          </defs>

          <line x1="10" y1="20" x2="90" y2="20" class="guide" />
          <line x1="10" y1="50" x2="90" y2="50" class="guide mid" />
          <line x1="10" y1="90" x2="90" y2="90" class="guide" />

          {#each (LETTERS[letterCap]?.strokes || []) as s, idx (idx)}
            <path
              d={strokePath(s)}
              class="stroke"
              class:done={idx < capStrokeIndex}
              class:current={idx === capStrokeIndex}
            />
            <text x={s?.[0]?.[0] ?? 10} y={(s?.[0]?.[1] ?? 10) - 2} class="num">{idx + 1}</text>
            {#if idx === capStrokeIndex}
              <circle cx={s?.[0]?.[0] ?? 0} cy={s?.[0]?.[1] ?? 0} r="3.2" class="start" filter="url(#soft2)" />
              {#if endPoint(s)}
                <circle cx={endPoint(s).x} cy={endPoint(s).y} r="2.8" class="end" />
              {/if}
              {#each waypointsForPoly(s) as w, wi (wi)}
                <circle cx={w.x} cy={w.y} r="2.4" class="wp" class:done={wi < capWaypointIndex} />
              {/each}
              {#if arrowPath(s, capLastT)}
                <path d={arrowPath(s, capLastT)} class="arrow" marker-end="url(#arrow2)" />
              {/if}
            {/if}
          {/each}

          <path d={trailPath(capTrail)} class="trail" class:bad={capBad} />
        </svg>
        <div class="hint">Start at the dot, follow the arrow and dots.</div>
      </div>

      <div class="board">
        <div class="board-title">Lowercase</div>
        <svg
          bind:this={smallSvgEl}
          class="svg"
          viewBox="0 0 100 100"
          role="img"
          aria-label="trace lowercase letter"
          on:pointerdown={(e) => startDraw('small', e)}
          on:pointermove={(e) => moveDraw('small', e)}
          on:pointerup={() => endDraw('small')}
          on:pointercancel={() => endDraw('small')}
          on:mouseleave={() => endDraw('small')}
          style="touch-action: none;"
        >
          <defs>
            <filter id="soft3" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.18)" />
            </filter>
            <marker id="arrow3" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34, 197, 94, 0.95)" />
            </marker>
          </defs>

          <line x1="10" y1="20" x2="90" y2="20" class="guide" />
          <line x1="10" y1="50" x2="90" y2="50" class="guide mid" />
          <line x1="10" y1="90" x2="90" y2="90" class="guide" />

          {#each (LOWER[letterSmall]?.strokes || []) as s, idx (idx)}
            <path
              d={strokePath(s)}
              class="stroke"
              class:done={idx < smallStrokeIndex}
              class:current={idx === smallStrokeIndex}
            />
            <text x={s?.[0]?.[0] ?? 10} y={(s?.[0]?.[1] ?? 10) - 2} class="num">{idx + 1}</text>
            {#if idx === smallStrokeIndex}
              <circle cx={s?.[0]?.[0] ?? 0} cy={s?.[0]?.[1] ?? 0} r="3.2" class="start" filter="url(#soft3)" />
              {#if endPoint(s)}
                <circle cx={endPoint(s).x} cy={endPoint(s).y} r="2.8" class="end" />
              {/if}
              {#each waypointsForPoly(s) as w, wi (wi)}
                <circle cx={w.x} cy={w.y} r="2.4" class="wp" class:done={wi < smallWaypointIndex} />
              {/each}
              {#if arrowPath(s, smallLastT)}
                <path d={arrowPath(s, smallLastT)} class="arrow" marker-end="url(#arrow3)" />
              {/if}
            {/if}
          {/each}

          <path d={trailPath(smallTrail)} class="trail" class:bad={smallBad} />
        </svg>
        <div class="hint">Start at the dot, follow the arrow and dots.</div>
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

  .boards {
    display: grid;
    gap: .75rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 900px) {
    .boards {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
  }

  .board-title {
    font-weight: 900;
    color: #111827;
    letter-spacing: 0.08em;
    text-align: center;
  }

  .svg {
    width: 100%;
    max-width: 520px;
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
    stroke: rgba(17, 24, 39, 0.2);
    stroke-width: 9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .stroke.done {
    stroke: rgba(34, 197, 94, 0.35);
  }

  .stroke.current {
    stroke: rgba(37, 99, 235, 0.5);
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

  .end {
    fill: rgba(34, 197, 94, 0.25);
    stroke: rgba(34, 197, 94, 0.95);
    stroke-width: 1.8;
    pointer-events: none;
  }

  .arrow {
    fill: none;
    stroke: rgba(34, 197, 94, 0.95);
    stroke-width: 2.2;
    opacity: 0.7;
    stroke-linecap: round;
    pointer-events: none;
  }

  .wp {
    fill: rgba(17, 24, 39, 0.15);
    stroke: rgba(17, 24, 39, 0.7);
    stroke-width: 1.2;
    pointer-events: none;
  }

  .wp.done {
    fill: rgba(34, 197, 94, 0.25);
    stroke: rgba(34, 197, 94, 0.8);
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
