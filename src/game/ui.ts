import type { GameState } from './types';
import {
  initialGameState,
  applyMove,
  checkResult,
  nextTurn,
  resetBoard,
  isDraw,
  isWin,
  emptyBoard,
} from './logic';
import { validatePlayerName } from './validation';
import { loadState, saveState } from './persistence';
import { playSound } from './audio';

// ---- State ----

let state: GameState | null = null;

// ---- DOM Helpers ----

function qs<T extends HTMLElement>(selector: string, parent: Element | Document = document): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function render() {
  const app = qs<HTMLDivElement>('#app');
  if (!state || state.phase === 'setup') {
    app.innerHTML = renderSetupScreen();
    bindSetupEvents();
  } else {
    const alreadyMounted = !!document.querySelector('.game-screen');
    if (alreadyMounted) {
      updateGameScreen();
    } else {
      app.innerHTML = renderGameScreen();
      bindGameEvents();
    }
    if (state.phase === 'won') {
      setTimeout(() => showWinModal(), 50);
    }
  }
}

// ---- Targeted game screen update (no full innerHTML replacement) ----

function updateGameScreen() {
  if (!state) return;
  const { board, currentTurn, players, phase, soundEnabled, result } = state;
  const winLine: number[] = isWin(result) ? result.line : [];

  // Update each cell in place
  document.querySelectorAll<HTMLButtonElement>('.cell').forEach((btn) => {
    const i = parseInt(btn.dataset['index'] ?? '-1', 10);
    if (i < 0) return;
    const cell = board[i];
    const mark = cell ?? '';
    const isWinCell = winLine.includes(i);
    const shouldDisable = phase !== 'playing' || cell !== null;

    btn.textContent = mark;
    btn.className = `cell${mark ? ` mark-${mark}` : ''}${isWinCell ? ' win-cell' : ''}`;
    btn.disabled = shouldDisable;
    btn.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
    btn.setAttribute('aria-label', `Celda ${i + 1}${mark ? `: ${mark}` : ', vacía'}`);
  });

  // Update turn indicator
  const turnEl = document.querySelector<HTMLElement>('.turn-indicator');
  if (turnEl) {
    const currentName = players[currentTurn];
    turnEl.innerHTML = phase === 'playing' ? `Turno de <strong>${currentName}</strong>` : '';
  }

  // Update player badge active classes
  document.querySelectorAll<HTMLElement>('.player-badge').forEach((badge) => {
    const isX = badge.querySelector('.mark-label.x') !== null;
    const isActive = phase === 'playing' && (isX ? currentTurn === 'X' : currentTurn === 'O');
    badge.classList.toggle('active', isActive);
  });

  // Update sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-label', soundEnabled ? 'Desactivar sonido' : 'Activar sonido');
  }
}

// ---- Setup Screen ----

function renderSetupScreen(): string {
  return `
    <div class="screen setup-screen" role="main">
      <h1 class="game-title">TRES EN RAYA</h1>
      <p class="subtitle">— Juego Retro —</p>
      <form class="setup-form" id="setup-form" novalidate>
        <div class="field">
          <label for="player-x">Jugador X</label>
          <input
            id="player-x"
            type="text"
            maxlength="20"
            placeholder="Nombre..."
            autocomplete="off"
            aria-required="true"
          />
          <span class="field-error" id="error-x" aria-live="polite"></span>
        </div>
        <div class="field">
          <label for="player-o">Jugador O</label>
          <input
            id="player-o"
            type="text"
            maxlength="20"
            placeholder="Nombre..."
            autocomplete="off"
            aria-required="true"
          />
          <span class="field-error" id="error-o" aria-live="polite"></span>
        </div>
        <button type="submit" class="btn btn-primary">COMENZAR</button>
      </form>
    </div>
  `;
}

function bindSetupEvents() {
  const form = document.getElementById('setup-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameX = validatePlayerName((qs<HTMLInputElement>('#player-x').value));
    const nameO = validatePlayerName((qs<HTMLInputElement>('#player-o').value));
    let valid = true;
    if (!nameX) {
      qs<HTMLSpanElement>('#error-x').textContent = 'Ingresa un nombre para el Jugador X.';
      valid = false;
    } else {
      qs<HTMLSpanElement>('#error-x').textContent = '';
    }
    if (!nameO) {
      qs<HTMLSpanElement>('#error-o').textContent = 'Ingresa un nombre para el Jugador O.';
      valid = false;
    } else {
      qs<HTMLSpanElement>('#error-o').textContent = '';
    }
    if (!valid) return;
    const soundEnabled = state?.soundEnabled ?? true;
    state = initialGameState({ X: nameX!, O: nameO! }, soundEnabled);
    saveState(state);
    render();
  });
}

// ---- Game Screen ----

function renderGameScreen(): string {
  if (!state) return '';
  const { board, currentTurn, players, phase, soundEnabled, result } = state;
  const winLine: number[] = isWin(result) ? result.line : [];

  const cells = board.map((cell, i) => {
    const isWinCell = winLine.includes(i);
    const disabled = phase !== 'playing' || cell !== null ? 'disabled aria-disabled="true"' : '';
    const mark = cell ?? '';
    return `<button
      class="cell${mark ? ` mark-${mark}` : ''}${isWinCell ? ' win-cell' : ''}"
      data-index="${i}"
      ${disabled}
      aria-label="Celda ${i + 1}${mark ? `: ${mark}` : ', vacía'}"
    >${mark}</button>`;
  }).join('');

  const currentName = players[currentTurn];

  return `
    <div class="screen game-screen" role="main">
      <header class="game-header">
        <h1 class="game-title-sm">TRES EN RAYA</h1>
        <div class="header-controls">
          <button class="btn btn-icon sound-toggle" id="sound-toggle" aria-label="${soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}">
            ${soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <div class="players-bar">
        <div class="player-badge${currentTurn === 'X' && phase === 'playing' ? ' active' : ''}">
          <span class="mark-label x">X</span>
          <span class="player-name">${players.X}</span>
        </div>
        <div class="turn-indicator" aria-live="polite">
          ${phase === 'playing' ? `Turno de <strong>${currentName}</strong>` : ''}
        </div>
        <div class="player-badge${currentTurn === 'O' && phase === 'playing' ? ' active' : ''}">
          <span class="mark-label o">O</span>
          <span class="player-name">${players.O}</span>
        </div>
      </div>

      <div class="board" role="grid" aria-label="Tablero de juego">
        ${cells}
      </div>

      <div class="game-actions">
        <button class="btn btn-secondary" id="reset-btn">REINICIAR</button>
        <button class="btn btn-ghost" id="new-game-btn">NUEVO JUEGO</button>
      </div>

      <div id="win-modal" class="modal hidden" role="dialog" aria-modal="true" aria-label="Resultado de la partida">
        <div class="modal-content">
          <div class="modal-icon">🏆</div>
          <h2 class="modal-title" id="modal-title"></h2>
          <p class="modal-subtitle" id="modal-subtitle"></p>
          <button class="btn btn-primary" id="modal-play-again">JUGAR DE NUEVO</button>
        </div>
      </div>
    </div>
  `;
}

function showWinModal() {
  if (!state) return;
  const modal = document.getElementById('win-modal');
  if (!modal) return;
  const titleEl = document.getElementById('modal-title');
  const subtitleEl = document.getElementById('modal-subtitle');
  if (!titleEl || !subtitleEl) return;

  const result = state.result;
  if (isWin(result)) {
    const winnerName = state.players[result.winner];
    titleEl.textContent = `¡${winnerName} gana!`;
    subtitleEl.textContent = `¡Felicitaciones ${winnerName}!`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('visible');

  document.getElementById('modal-play-again')?.addEventListener('click', () => {
    modal.classList.remove('visible');
    modal.classList.add('hidden');
    state = resetBoard(state!);
    saveState(state);
    render();
  });
}

function bindGameEvents() {
  // Cell clicks
  document.querySelectorAll<HTMLButtonElement>('.cell:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state || state.phase !== 'playing') return;
      const index = parseInt(btn.dataset['index'] ?? '-1', 10);
      if (index < 0 || state.board[index] !== null) return;

      playSound('move', state.soundEnabled);
      const newBoard = applyMove(state.board, index, state.currentTurn);
      const result = checkResult(newBoard);
      const nextPhase = isWin(result) ? 'won' : isDraw(result) ? 'draw' : 'playing';

      state = {
        ...state,
        board: newBoard,
        result,
        phase: nextPhase,
        currentTurn: nextPhase === 'playing' ? nextTurn(state.currentTurn) : state.currentTurn,
      };
      saveState(state);

      if (nextPhase === 'won') {
        playSound('win', state.soundEnabled);
        render();
        setTimeout(() => showWinModal(), 50);
      } else if (nextPhase === 'draw') {
        playSound('draw', state.soundEnabled);
        render();
        setTimeout(() => {
          state = { ...resetBoard(state!), board: emptyBoard() };
          saveState(state);
          render();
        }, 1200);
      } else {
        render();
      }
    });
  });

  // Sound toggle
  document.getElementById('sound-toggle')?.addEventListener('click', () => {
    if (!state) return;
    state = { ...state, soundEnabled: !state.soundEnabled };
    saveState(state);
    render();
  });

  // Reset
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (!state) return;
    state = resetBoard(state);
    saveState(state);
    render();
  });

  // New game → go back to setup
  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    state = null;
    saveState(null);
    render();
  });
}

// ---- Init ----

const saved = loadState();
state = saved;
render();
