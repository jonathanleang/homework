<script>
  import { onMount, onDestroy } from 'svelte';

  // Game state
  let gameState = 'start'; // start, playing, gameover
  let score = 0;
  let timeLeft = 30;
  let gameInterval;
  let spawnInterval;

  // Weapons: Hammer (single target, normal score), Bomb (small AoE, high score), Nuke (clears board, massive score)
  const weapons = [
    { id: 'hammer', emoji: '🔨', name: 'Hammer' },
    { id: 'bomb', emoji: '💣', name: 'Bomb' },
    { id: 'nuke', emoji: '🚀', name: 'Nuke Missile' } // Using rocket for missile
  ];
  let selectedWeapon = weapons[0];

  // Enemies
  const enemies = [
    { id: 'rat', emoji: '🐀', name: 'Rat' },
    { id: 'cockroach', emoji: '🪳', name: 'Cockroach' },
    { id: 'snake', emoji: '🐍', name: 'Snake' },
    { id: 'lizard', emoji: '🦎', name: 'Lizard' }
  ];

  // Grid (3x3)
  let holes = Array(9).fill(null);
  
  // Animation state for feedback
  let hitEffects = [];
  let effectIdCounter = 0;

  function startGame() {
    gameState = 'playing';
    score = 0;
    timeLeft = 30;
    holes = Array(9).fill(null);
    hitEffects = [];
    
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);

    gameInterval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    spawnInterval = setInterval(spawnEnemy, 800); // Spawn every 0.8s
  }

  function endGame() {
    gameState = 'gameover';
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    holes = Array(9).fill(null);
  }

  function spawnEnemy() {
    if (gameState !== 'playing') return;
    
    // Find empty holes
    const emptyIndices = holes
      .map((hole, index) => hole === null ? index : null)
      .filter(index => index !== null);
      
    if (emptyIndices.length === 0) return; // Board full
    
    // Randomly pick an empty hole
    const targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    
    // Randomly pick an enemy
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    // Determine how long it stays up (faster as game progresses)
    const stayTime = Math.max(500, 1500 - (30 - timeLeft) * 20); // 1.5s down to 0.5s
    
    const holeObj = {
      enemy,
      timeoutId: setTimeout(() => {
        // Despawn if still there
        if (holes[targetIndex] === holeObj) {
          holes[targetIndex] = null;
          holes = [...holes];
        }
      }, stayTime)
    };
    
    holes[targetIndex] = holeObj;
    holes = [...holes];
  }

  function selectWeapon(w) {
    selectedWeapon = w;
  }

  function addHitEffect(index, emoji, scoreGained) {
    const effect = {
      id: effectIdCounter++,
      index,
      emoji,
      scoreText: `+${scoreGained}`
    };
    hitEffects = [...hitEffects, effect];
    setTimeout(() => {
      hitEffects = hitEffects.filter(e => e.id !== effect.id);
    }, 500); // Effect lasts 0.5s
  }

  function hitHole(index) {
    if (gameState !== 'playing') return;

    if (selectedWeapon.id === 'nuke') {
      // Nuke clears the whole board
      let nukeScore = 0;
      holes.forEach((hole, i) => {
        if (hole !== null) {
          clearTimeout(hole.timeoutId);
          nukeScore += 5;
          addHitEffect(i, '💥', 5);
        }
      });
      holes = Array(9).fill(null);
      if (nukeScore > 0) {
        score += nukeScore;
      }
      // Nuke has a cool-down/auto-switch so it's not overpowered
      selectedWeapon = weapons[0]; // Switch back to hammer
      return;
    }

    if (holes[index] === null) return;

    if (selectedWeapon.id === 'hammer') {
      // Single hit
      clearTimeout(holes[index].timeoutId);
      holes[index] = null;
      holes = [...holes];
      score += 1;
      addHitEffect(index, '🔨', 1);
    } else if (selectedWeapon.id === 'bomb') {
      // Hit target and adjacent (cross pattern)
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const toHit = [
        index, // center
        index - 3, // top
        index + 3, // bottom
        col > 0 ? index - 1 : -1, // left
        col < 2 ? index + 1 : -1  // right
      ].filter(i => i >= 0 && i < 9);

      let bombScore = 0;
      toHit.forEach(i => {
        if (holes[i] !== null) {
          clearTimeout(holes[i].timeoutId);
          holes[i] = null;
          bombScore += 2;
          addHitEffect(i, '💥', 2);
        }
      });
      holes = [...holes];
      score += bombScore;
      // Auto-switch back to hammer after bomb use
      selectedWeapon = weapons[0];
    }
  }

  onDestroy(() => {
    if (gameInterval) clearInterval(gameInterval);
    if (spawnInterval) clearInterval(spawnInterval);
    holes.forEach(hole => {
      if (hole && hole.timeoutId) clearTimeout(hole.timeoutId);
    });
  });
</script>

<div class="game-wrapper">
  {#if gameState === 'start'}
    <div class="overlay">
      <h2>Whack-A-Pest</h2>
      <p>Smash rats, roaches, snakes, and lizards!</p>
      <div class="weapons-preview">
        {#each weapons as w}
          <div class="wp"><span class="emoji">{w.emoji}</span> {w.name}</div>
        {/each}
      </div>
      <button class="start-btn" on:click={startGame}>Start Game</button>
    </div>
  {:else if gameState === 'gameover'}
    <div class="overlay">
      <h2>Time's Up!</h2>
      <p>Final Score: {score}</p>
      <button class="start-btn" on:click={startGame}>Play Again</button>
    </div>
  {/if}

  <header class="game-header">
    <div class="stats">
      <div class="stat-box">Score: {score}</div>
      <div class="stat-box time" class:low-time={timeLeft <= 10}>Time: {timeLeft}s</div>
    </div>

    <div class="weapon-selector">
      {#each weapons as w}
        <button 
          class="weapon-btn" 
          class:selected={selectedWeapon.id === w.id}
          on:click={() => selectWeapon(w)}
          aria-label={w.name}
        >
          {w.emoji}
        </button>
      {/each}
    </div>
    <div class="weapon-info">Current Weapon: <strong>{selectedWeapon.name}</strong></div>
  </header>

  <div class="board-container">
    <div class="board" class:hammer-cursor={selectedWeapon.id === 'hammer'} class:bomb-cursor={selectedWeapon.id === 'bomb'} class:nuke-cursor={selectedWeapon.id === 'nuke'}>
      {#each holes as hole, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="hole-container" on:mousedown|preventDefault={() => hitHole(index)} on:touchstart|preventDefault={() => hitHole(index)}>
          <div class="hole"></div>
          {#if hole !== null}
            <div class="enemy">
              {hole.enemy.emoji}
            </div>
          {/if}
          
          {#each hitEffects.filter(e => e.index === index) as effect (effect.id)}
            <div class="hit-effect">
              <div class="hit-emoji">{effect.emoji}</div>
              <div class="hit-score">{effect.scoreText}</div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .game-wrapper {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background: #4ade80; /* Grass green */
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    user-select: none;
    touch-action: manipulation;
    min-height: 80dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 30;
    color: white;
    text-align: center;
    border-radius: 16px;
  }

  .overlay h2 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    color: #fca5a5;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .overlay p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .weapons-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: rgba(255,255,255,0.1);
    padding: 1rem;
    border-radius: 12px;
  }

  .wp {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .wp .emoji {
    font-size: 2rem;
  }

  .start-btn {
    padding: 1rem 2.5rem;
    font-size: 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 6px 0 #b91c1c;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .start-btn:active {
    transform: translateY(6px);
    box-shadow: 0 0 0 #b91c1c;
  }

  .game-header {
    background: #166534;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: inset 0 4px 6px rgba(0,0,0,0.3);
  }

  .stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .stat-box {
    background: #0f172a;
    color: #fde047;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: monospace;
    border: 2px solid #334155;
  }

  .time.low-time {
    color: #ef4444;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .weapon-selector {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .weapon-btn {
    font-size: 2.5rem;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    border: 3px solid #334155;
    background: #1e293b;
    cursor: pointer;
    transition: transform 0.1s;
    display: grid;
    place-items: center;
    padding: 0;
  }

  .weapon-btn.selected {
    border-color: #fde047;
    background: #475569;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(253, 224, 71, 0.5);
  }

  .weapon-info {
    text-align: center;
    color: #bbf7d0;
    font-size: 1.1rem;
  }

  .board-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1 / 1;
    cursor: crosshair;
  }

  .hole-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: visible;
  }

  .hole {
    position: absolute;
    bottom: 10%;
    width: 80%;
    height: 40%;
    background: #78350f;
    border-radius: 50%;
    box-shadow: inset 0 10px 20px rgba(0,0,0,0.8), 0 5px 0 #451a03;
    z-index: 1;
  }

  .enemy {
    position: absolute;
    bottom: 25%;
    font-size: 4rem;
    z-index: 2;
    animation: popup 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    pointer-events: none;
  }

  @keyframes popup {
    0% { transform: translateY(100%) scale(0.5); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }

  .hit-effect {
    position: absolute;
    bottom: 40%;
    z-index: 10;
    pointer-events: none;
    animation: floatUp 0.5s ease-out forwards;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hit-emoji {
    font-size: 3rem;
  }

  .hit-score {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
  }

  @keyframes floatUp {
    0% { transform: translateY(0) scale(0.5); opacity: 1; }
    100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
  }

  /* Custom Cursors - Fallbacks if emojis don't work natively as cursors in all browsers */
  .hammer-cursor { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:40px;'><text y='50%'>🔨</text></svg>") 16 16, crosshair; }
  .bomb-cursor { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:40px;'><text y='50%'>💣</text></svg>") 16 16, crosshair; }
  .nuke-cursor { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:40px;'><text y='50%'>🚀</text></svg>") 16 16, crosshair; }

</style>
