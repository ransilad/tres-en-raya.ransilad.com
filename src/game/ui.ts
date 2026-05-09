import type { GameState, Mark } from './types';
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  })[char] ?? char);
}

function iconSvg(name: 'back' | 'reset' | Mark, className = 'icon'): string {
  const paths = {
    back: '<path d="M14.5 5.5 8 12l6.5 6.5"/><path d="M8.75 12H20"/>',
    reset: '<path d="M20 6v5h-5"/><path d="M19.25 11A7.5 7.5 0 1 0 17 16.3"/>',
    X: '<path d="M6.5 6.5 17.5 17.5"/><path d="M17.5 6.5 6.5 17.5"/>',
    O: '<circle cx="12" cy="12" r="6.5"/>',
  };

  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

function renderMarkIcon(mark: Mark): string {
  return iconSvg(mark, `icon mark-icon mark-icon-${mark}`);
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

  document.querySelectorAll<HTMLButtonElement>('.cell').forEach((btn) => {
    const i = parseInt(btn.dataset['index'] ?? '-1', 10);
    if (i < 0) return;
    const cell = board[i];
    const mark = cell ?? '';
    const isWinCell = winLine.includes(i);
    const shouldDisable = phase !== 'playing' || cell !== null;

    btn.innerHTML = mark ? renderMarkIcon(mark) : '';
    btn.className = `cell${mark ? ` mark-${mark}` : ''}${isWinCell ? ' win-cell' : ''}`;
    btn.disabled = shouldDisable;
    btn.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
    btn.setAttribute('aria-label', `Celda ${i + 1}${mark ? `: ${mark}` : ', vacía'}`);
  });

  const turnEl = document.querySelector<HTMLElement>('.turn-indicator');
  if (turnEl) {
    const currentName = players[currentTurn];
    turnEl.className = `turn-indicator mark-${currentTurn}`;
    turnEl.innerHTML = phase === 'playing'
      ? `<span class="turn-prefix">Turno de</span><span class="turn-name">${escapeHtml(currentName)}</span>`
      : '';
  }

  document.querySelectorAll<HTMLElement>('.score-card').forEach((badge) => {
    const isX = badge.dataset['player'] === 'X';
    const isActive = phase === 'playing' && (isX ? currentTurn === 'X' : currentTurn === 'O');
    badge.classList.toggle('active', isActive);
  });

  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.textContent = soundEnabled ? 'Sonido activado' : 'Sonido desactivado';
    soundBtn.setAttribute('aria-label', soundEnabled ? 'Desactivar sonido' : 'Activar sonido');
  }

  if (phase === 'won') showWinModal();
}

// ---- Setup Screen ----

function renderSetupScreen(): string {
  return `
    <div class="screen setup-screen" role="main">
      <div class="ambient ambient-primary" aria-hidden="true"></div>
      <div class="ambient ambient-secondary" aria-hidden="true"></div>

      <header class="setup-identity">
        <h1 class="game-title">TRES EN RAYA</h1>
        <p class="subtitle">Ingresa los nombres para comenzar</p>
      </header>

      <form class="setup-form" id="setup-form" novalidate>
        <div class="field player-input player-input-x">
          <label class="sr-only" for="player-x">Nombre del jugador 1</label>
          <span class="input-mark mark-X" aria-hidden="true">${renderMarkIcon('X')}</span>
          <input
            id="player-x"
            type="text"
            maxlength="20"
            placeholder="Nombre del jugador 1"
            autocomplete="off"
            autofocus
            aria-required="true"
            aria-describedby="error-x"
          />
          <span class="field-error" id="error-x" aria-live="polite"></span>
        </div>
        <div class="field player-input player-input-o">
          <label class="sr-only" for="player-o">Nombre del jugador 2</label>
          <span class="input-mark mark-O" aria-hidden="true">${renderMarkIcon('O')}</span>
          <input
            id="player-o"
            type="text"
            maxlength="20"
            placeholder="Nombre del jugador 2"
            autocomplete="off"
            aria-required="true"
            aria-describedby="error-o"
          />
          <span class="field-error" id="error-o" aria-live="polite"></span>
        </div>

        <div class="hero-marks" aria-hidden="true">
          <span class="hero-x">${renderMarkIcon('X')}</span>
          <span class="hero-o">${renderMarkIcon('O')}</span>
        </div>

        <div class="setup-actions">
          <button type="submit" class="btn btn-primary">Comenzar</button>
        </div>
      </form>
    </div>
  `;
}

function bindSetupEvents() {
  const form = document.getElementById('setup-form') as HTMLFormElement;
  requestAnimationFrame(() => qs<HTMLInputElement>('#player-x').focus({ preventScroll: true }));

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
  const safePlayers = { X: escapeHtml(players.X), O: escapeHtml(players.O) };

  const cells = board.map((cell, i) => {
    const isWinCell = winLine.includes(i);
    const disabled = phase !== 'playing' || cell !== null ? 'disabled aria-disabled="true"' : '';
    const mark = cell ?? '';
    return `<button
      class="cell${mark ? ` mark-${mark}` : ''}${isWinCell ? ' win-cell' : ''}"
      data-index="${i}"
      ${disabled}
      aria-label="Celda ${i + 1}${mark ? `: ${mark}` : ', vacía'}"
    >${mark ? renderMarkIcon(mark) : ''}</button>`;
  }).join('');

  const currentName = players[currentTurn];

  return `
    <div class="screen game-screen" role="main">
      <div class="ambient ambient-primary" aria-hidden="true"></div>
      <div class="ambient ambient-secondary" aria-hidden="true"></div>

      <header class="game-header">
        <button class="btn btn-back" id="new-game-btn" aria-label="Volver al menu inicial">${iconSvg('back')}</button>
        <div class="turn-indicator mark-${currentTurn}" aria-live="polite">
          ${phase === 'playing' ? `<span class="turn-prefix">Turno de</span><span class="turn-name">${escapeHtml(currentName)}</span>` : ''}
        </div>
        <div class="turn-underline" aria-hidden="true"></div>
      </header>

      <div class="board" role="grid" aria-label="Tablero de juego">
        ${cells}
      </div>

      <footer class="game-footer">
        <div class="score-row" aria-label="Marcador">
          <div class="score-card score-card-x${currentTurn === 'X' && phase === 'playing' ? ' active' : ''}" data-player="X">
            <span class="score-label">${safePlayers.X}</span>
            <span class="score-mark mark-X" aria-hidden="true">${renderMarkIcon('X')}</span>
          </div>
          <span class="vs-label" aria-hidden="true">vs</span>
          <div class="score-card score-card-o${currentTurn === 'O' && phase === 'playing' ? ' active' : ''}" data-player="O">
            <span class="score-label">${safePlayers.O}</span>
            <span class="score-mark mark-O" aria-hidden="true">${renderMarkIcon('O')}</span>
          </div>
        </div>

        <div class="game-actions">
          <button class="btn btn-fab" id="reset-btn" aria-label="Reiniciar partida">${iconSvg('reset')}</button>
          <button class="btn btn-ghost sound-toggle" id="sound-toggle" aria-label="${soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}">
            ${soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
          </button>
        </div>
      </footer>

      <div id="win-modal" class="modal hidden" role="dialog" aria-modal="true" aria-label="Resultado de la partida">
        <div class="modal-content">
          <div class="modal-icon" aria-hidden="true">♕</div>
          <h2 class="modal-title" id="modal-title"></h2>
          <button class="btn btn-primary" id="modal-play-again">Jugar de nuevo</button>
          <button class="btn btn-secondary" id="modal-back-menu">Volver al menu</button>
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
  if (!titleEl) return;

  const result = state.result;
  if (isWin(result)) {
    const winnerName = state.players[result.winner];
    titleEl.textContent = `¡${winnerName} gana!`;
  }

  modal.classList.remove('hidden');
  modal.classList.add('visible');
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

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    state = null;
    saveState(null);
    render();
  });

  document.getElementById('modal-play-again')?.addEventListener('click', () => {
    if (!state) return;
    document.getElementById('win-modal')?.classList.add('hidden');
    state = resetBoard(state);
    saveState(state);
    render();
  });

  document.getElementById('modal-back-menu')?.addEventListener('click', () => {
    state = null;
    saveState(null);
    render();
  });
}

// ---- Init ----

const saved = loadState();
state = saved;
render();
