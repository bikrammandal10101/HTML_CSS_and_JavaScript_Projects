document.addEventListener('DOMContentLoaded', () => {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const gameButtons = colors.map(c => document.getElementById(c));
  const startBtn  = document.getElementById('start');
  const resetBtn  = document.getElementById('reset');
  const strictBtn = document.getElementById('strict');
  const scoreEl   = document.getElementById('score');

  // Error / win sounds still via <audio>
  const errorSound = document.getElementById('error-sound');
  const winSound   = document.getElementById('win-sound');

  // Web Audio for colour beeps 
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const toneFreq = { red: 261.6, green: 329.6, blue: 392.0, yellow: 523.3 }; // C4‑E4‑G4‑C5

  function playTone(color) {
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = toneFreq[color];
    osc.type = 'square';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // Game state 
  let sequence = [], playerSeq = [];
  let level = 0, strict = false, playing = false, showingSeq = false;

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  function highlight(color) {
    const btn = document.getElementById(color);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 300);
  }

  function updateScore() {
    scoreEl.textContent = level.toString().padStart(2, '0');
  }

  function disableButtons(disabled) {
    gameButtons.forEach(b => b.classList.toggle('disabled', disabled));
  }

  function resetGame() {
    sequence = []; playerSeq = [];
    level = 0; playing = false; showingSeq = false;
    updateScore();
    disableButtons(true);
  }

  // Core game loops 
  async function showSequence() {
    showingSeq = true; disableButtons(true);
    for (const col of sequence) {
      highlight(col); playTone(col);
      await sleep(650);
    }
    showingSeq = false; disableButtons(false);
  }

  async function nextLevel() {
    level++; updateScore(); playerSeq = [];
    sequence.push(colors[Math.floor(Math.random()*4)]);
    await sleep(300);
    showSequence();
  }

  async function checkMove() {
    const idx = playerSeq.length - 1;
    if (playerSeq[idx] !== sequence[idx]) {
      errorSound.currentTime = 0; errorSound.play();
      if (strict) { await sleep(800); resetGame(); }
      else { playerSeq = []; await sleep(800); showSequence(); }
      return;
    }
    if (playerSeq.length === sequence.length) {
      if (level === 20) {
        winSound.currentTime = 0; winSound.play();
        celebrateWin(); await sleep(3000); resetGame();
      } else {
        await sleep(600); nextLevel();
      }
    }
  }

  function celebrateWin() {
    let f = 0; const inter = setInterval(() => {
      gameButtons.forEach(b => b.classList.add('active'));
      setTimeout(()=>gameButtons.forEach(b=>b.classList.remove('active')),150);
      f++; if (f>=6) clearInterval(inter);
    }, 300);
  }

  // Event bindings 
  startBtn.addEventListener('click', () => { if (playing) return; resetGame(); playing = true; disableButtons(false); nextLevel(); });
  resetBtn.addEventListener('click', resetGame);
  strictBtn.addEventListener('click', () => { strict = !strict; strictBtn.classList.toggle('active', strict); });

  gameButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (!playing || showingSeq) return;
      const color = colors[idx];
      highlight(color); playTone(color);
      playerSeq.push(color);
      checkMove();
    });
  });

  // init
  updateScore();
  disableButtons(true);
});
