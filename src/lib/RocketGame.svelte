<script>
  import { onMount, onDestroy } from 'svelte';

  let containerWidth = 300;
  let containerHeight = 500;

  let gameState = 'start'; // start, playing, gameover
  let score = 0;
  let lives = 3;

  let rocketLane = 1;
  let rocketY = 0;
  let rocketVy = 0;
  
  const gravity = -0.4;
  const boost = 12;
  
  let cameraY = 0;
  let objects = [];
  let nextSpawnY = 200;
  let animationFrame;
  let objectIdCounter = 0;
  let lastTime;

  function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    rocketLane = 1;
    rocketY = 200;
    rocketVy = boost;
    cameraY = 0;
    objects = [];
    nextSpawnY = 300;
    
    // Initial fuel so player doesn't instantly die
    objects.push({ id: objectIdCounter++, type: 'fuel', lane: 1, y: 200, hit: false });

    if (animationFrame) cancelAnimationFrame(animationFrame);
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(update);
  }

  function update(time) {
    if (gameState !== 'playing') return;

    lastTime = time;

    // Time independent physics (simplified for ~60fps)
    rocketVy += gravity;
    rocketY += rocketVy;

    // Camera follows rocket if it goes too high
    const targetCameraY = rocketY - containerHeight * 0.3;
    if (targetCameraY > cameraY) {
      cameraY = targetCameraY;
    }
    
    // Score based on height
    if (Math.floor(cameraY) > score) {
      score = Math.floor(cameraY);
    }

    // Fall down = game over
    if (rocketY < cameraY - 50) {
      gameState = 'gameover';
    }

    // Spawn objects
    while (nextSpawnY < cameraY + containerHeight + 200) {
      let isRock = Math.random() < 0.25;
      let type = isRock ? 'rock' : 'fuel';
      let lane = Math.floor(Math.random() * 3);
      objects.push({ id: objectIdCounter++, type, lane, y: nextSpawnY, hit: false });
      
      // Distance between objects
      nextSpawnY += Math.random() * 100 + 80;
    }

    // Collision detection
    for (let obj of objects) {
      if (!obj.hit && obj.lane === rocketLane) {
        // Simple Y distance check
        if (Math.abs(obj.y - rocketY) < 50) {
          obj.hit = true;
          if (obj.type === 'fuel') {
            rocketVy = boost; // Boost up!
          } else if (obj.type === 'rock') {
            lives -= 1;
            rocketVy = boost * 0.5; // Small bounce to not die instantly from falling
            if (lives <= 0) {
              gameState = 'gameover';
            }
          }
        }
      }
    }

    // Cleanup old objects
    objects = objects.filter(o => o.y > cameraY - 100 && !o.hit);

    // Force Svelte to react
    objects = objects;

    if (gameState === 'playing') {
      animationFrame = requestAnimationFrame(update);
    }
  }

  function moveLeft() {
    if (gameState === 'playing' && rocketLane > 0) {
      rocketLane -= 1;
    }
  }

  function moveRight() {
    if (gameState === 'playing' && rocketLane < 2) {
      rocketLane += 1;
    }
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowLeft') moveLeft();
    if (e.key === 'ArrowRight') moveRight();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
</script>

<div class="game-wrapper" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
  {#if gameState === 'start'}
    <div class="overlay">
      <h2>Rocket Jump</h2>
      <p>Touch fuel ⚡ to go up.</p>
      <p>Avoid rocks 🪨.</p>
      <p>Tap left/right to move.</p>
      <button on:click={startGame}>Start Game</button>
    </div>
  {:else if gameState === 'gameover'}
    <div class="overlay">
      <h2>Game Over</h2>
      <p>Score: {score}</p>
      <button on:click={startGame}>Play Again</button>
    </div>
  {/if}

  <div class="ui">
    <div class="score">Score: {score}</div>
    <div class="lives">
      {#each Array.from({length: lives}) as _}
        ❤️
      {/each}
    </div>
  </div>

  <div class="game-area">
    <!-- Lanes background -->
    <div class="lane" style="left: 0; width: 33.33%;"></div>
    <div class="lane" style="left: 33.33%; width: 33.33%;"></div>
    <div class="lane" style="left: 66.66%; width: 33.33%;"></div>

    <!-- Objects -->
    {#each objects as obj (obj.id)}
      <div class="object" style="
        left: {obj.lane * 33.33 + 16.66}%;
        bottom: {obj.y - cameraY}px;
      ">
        {obj.type === 'fuel' ? '⚡' : '🪨'}
      </div>
    {/each}

    <!-- Rocket -->
    <div class="rocket" class:falling={rocketVy < 0} style="
      left: {rocketLane * 33.33 + 16.66}%;
      bottom: {rocketY - cameraY}px;
    ">
      🚀
    </div>
  </div>

  <!-- Touch Controls -->
  <div class="touch-controls">
    <button class="left-half" on:pointerdown|preventDefault={moveLeft} aria-label="Move Left"></button>
    <button class="right-half" on:pointerdown|preventDefault={moveRight} aria-label="Move Right"></button>
  </div>
</div>

<style>
  .game-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    height: 80vh;
    margin: 0 auto;
    background: #0f172a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    user-select: none;
    touch-action: manipulation;
  }

  .ui {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    z-index: 10;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    pointer-events: none;
  }

  .game-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .lane {
    position: absolute;
    top: 0;
    bottom: 0;
    border-right: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .object {
    position: absolute;
    font-size: 2.5rem;
    transform: translateX(-50%);
    z-index: 5;
  }

  .rocket {
    position: absolute;
    font-size: 3rem;
    transform: translateX(-50%);
    z-index: 6;
    transition: left 0.1s ease-out;
  }

  .rocket.falling {
    /* Slight rotation when falling */
    transform: translateX(-50%) rotate(180deg);
  }

  .touch-controls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    z-index: 20;
  }

  .touch-controls button {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 30;
    color: white;
    text-align: center;
  }

  .overlay h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #38bdf8;
  }

  .overlay p {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }

  .overlay button {
    margin-top: 2rem;
    padding: 1rem 2rem;
    font-size: 1.5rem;
    background: #38bdf8;
    color: #0f172a;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }

  .overlay button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
</style>