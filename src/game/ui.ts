import type { RealtimeChannel } from '@supabase/supabase-js';
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
import { clearOnlineSession, loadOnlineSession, loadState, saveOnlineSession, saveState } from './persistence';
import { playSound } from './audio';
import { applyOnlineMove, mapRoomToGameView } from './online/logic';
import { getSupabaseClient, isSupabaseConfigured } from './online/supabase';
import {
  createOnlineRoom,
  fetchOnlineRoom,
  joinOnlineRoom,
  leaveOnlineRoom,
  requestOnlineRematch,
  submitOnlineMove,
  subscribeToOnlineRoom,
} from './online/rooms';
import type { OnlineClientState, OnlineRoomRecord } from './online/types';

// ---- State ----

type AppState = GameState | OnlineClientState | null;
type SetupMode = 'local' | 'online-create' | 'online-join';

let state: AppState = null;
let setupMode: SetupMode = 'local';
let setupMessage = '';
let setupLoading = false;
let roomChannel: RealtimeChannel | null = null;
let roomPollTimer: number | null = null;

// ---- DOM Helpers ----

function qs<T extends HTMLElement>(selector: string, parent: Element | Document = document): T {
  const el = parent.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
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

function isOnlineState(value: AppState): value is OnlineClientState {
  return !!value && 'mode' in value && value.mode === 'online';
}

function getRenderableState(): GameState {
  if (!state) throw new Error('Game state is missing.');
  return isOnlineState(state) ? mapRoomToGameView(state) : state;
}

function renderTurnContent(currentTurn: Mark, currentName: string): string {
  if (isOnlineState(state) && state.room.status === 'playing' && state.session.mark === currentTurn) {
    return '<span class="turn-name">Tu turno</span>';
  }

  return `<span class="turn-prefix">Turno de</span><span class="turn-name">${escapeHtml(currentName)}</span>`;
}

function getOnlineStatusMessage(): string {
  if (!isOnlineState(state)) return '';
  if (state.connectionStatus === 'connecting') return 'Conectando...';
  if (state.connectionStatus === 'reconnecting') return 'Reconectando...';
  if (state.connectionStatus === 'disconnected') return 'Sin conexión con la sala';
  if (state.connectionStatus === 'error') return state.errorMessage ?? 'No se pudo sincronizar la sala';
  if (state.room.status === 'abandoned') return 'El rival salió de la partida';
  if (state.room.status === 'draw') return 'Empate. Esperando revancha';
  return '';
}

function getSoundEnabled(): boolean {
  return state ? state.soundEnabled : true;
}

function render() {
  const app = qs<HTMLDivElement>('#app');
  if (!state || (!isOnlineState(state) && state.phase === 'setup')) {
    app.innerHTML = renderSetupScreen();
    bindSetupEvents();
    return;
  }

  if (isOnlineState(state) && state.room.status === 'waiting') {
    app.innerHTML = renderOnlineLobby();
    bindLobbyEvents();
    return;
  }

  const alreadyMounted = !!document.querySelector('.game-screen');
  if (alreadyMounted) {
    updateGameScreen();
  } else {
    app.innerHTML = renderGameScreen();
    bindGameEvents();
  }

  const view = getRenderableState();
  if (view.phase === 'won' || view.phase === 'draw') {
    setTimeout(() => showResultModal(), 50);
  }
}

// ---- Targeted game screen update (no full innerHTML replacement) ----

function updateGameScreen() {
  if (!state) return;
  const view = getRenderableState();
  const { board, currentTurn, players, phase, soundEnabled, result } = view;
  const canMove = isOnlineState(state) ? mapRoomToGameView(state).canMove : phase === 'playing';
  const winLine: number[] = isWin(result) ? result.line : [];

  document.querySelectorAll<HTMLButtonElement>('.cell').forEach((btn) => {
    const i = parseInt(btn.dataset['index'] ?? '-1', 10);
    if (i < 0) return;
    const cell = board[i];
    const mark = cell ?? '';
    const isWinCell = winLine.includes(i);
    const shouldDisable = phase !== 'playing' || cell !== null || !canMove;

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
      ? renderTurnContent(currentTurn, currentName)
      : '';
  }

  document.querySelectorAll<HTMLElement>('.score-card').forEach((badge) => {
    const isX = badge.dataset['player'] === 'X';
    const isActive = phase === 'playing' && (isX ? currentTurn === 'X' : currentTurn === 'O');
    badge.classList.toggle('active', isActive);
  });

  const onlineStatus = document.querySelector<HTMLElement>('.online-status');
  if (onlineStatus && isOnlineState(state)) onlineStatus.textContent = getOnlineStatusMessage();

  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.textContent = soundEnabled ? 'Sonido activado' : 'Sonido desactivado';
    soundBtn.setAttribute('aria-label', soundEnabled ? 'Desactivar sonido' : 'Activar sonido');
  }

  if (phase === 'won' || phase === 'draw') {
    showResultModal();
  } else {
    hideResultModal();
  }
}

// ---- Setup Screen ----

function renderSetupScreen(): string {
  const onlineDisabled = !isSupabaseConfigured();
  return `
    <div class="screen setup-screen" role="main">
      <div class="ambient ambient-primary" aria-hidden="true"></div>
      <div class="ambient ambient-secondary" aria-hidden="true"></div>

      <header class="setup-identity">
        <h1 class="game-title">TRES EN RAYA</h1>
        <p class="subtitle">Elige cómo quieres jugar</p>
      </header>

      <div class="mode-tabs" role="tablist" aria-label="Modo de juego">
        <button class="btn mode-tab${setupMode === 'local' ? ' active' : ''}" type="button" data-mode="local" ${setupLoading ? 'disabled' : ''}>Local</button>
        <button class="btn mode-tab${setupMode !== 'local' ? ' active' : ''}" type="button" data-mode="online-create" ${onlineDisabled || setupLoading ? 'disabled' : ''}>Online</button>
      </div>

      ${setupMessage ? `<p class="setup-message" role="status">${escapeHtml(setupMessage)}</p>` : ''}
      ${onlineDisabled ? '<p class="setup-message" role="status">Configura Supabase para activar el modo online.</p>' : ''}

      ${setupMode === 'local' ? renderLocalSetupForm() : renderOnlineSetupForm()}
    </div>
  `;
}

function renderLocalSetupForm(): string {
  return `
    <form class="setup-form" id="setup-form" novalidate>
      <div class="field player-input player-input-x">
        <label class="sr-only" for="player-x">Nombre del jugador 1</label>
        <span class="input-mark mark-X" aria-hidden="true">${renderMarkIcon('X')}</span>
        <input id="player-x" type="text" maxlength="20" placeholder="Nombre del jugador 1" autocomplete="off" autofocus aria-required="true" aria-describedby="error-x" />
        <span class="field-error" id="error-x" aria-live="polite"></span>
      </div>
      <div class="field player-input player-input-o">
        <label class="sr-only" for="player-o">Nombre del jugador 2</label>
        <span class="input-mark mark-O" aria-hidden="true">${renderMarkIcon('O')}</span>
        <input id="player-o" type="text" maxlength="20" placeholder="Nombre del jugador 2" autocomplete="off" aria-required="true" aria-describedby="error-o" />
        <span class="field-error" id="error-o" aria-live="polite"></span>
      </div>
      ${renderHeroMarks()}
      <div class="setup-actions"><button type="submit" class="btn btn-primary">Comenzar</button></div>
    </form>
  `;
}

function renderOnlineSetupForm(): string {
  const isJoin = setupMode === 'online-join';
  return `
    <form class="setup-form" id="online-form" novalidate>
      <div class="online-switch" aria-label="Acción online">
        <button class="btn mode-tab${!isJoin ? ' active' : ''}" type="button" data-mode="online-create" ${setupLoading ? 'disabled' : ''}>Crear sala</button>
        <button class="btn mode-tab${isJoin ? ' active' : ''}" type="button" data-mode="online-join" ${setupLoading ? 'disabled' : ''}>Unirse</button>
      </div>
      <div class="field player-input player-input-x">
        <label class="sr-only" for="online-name">Tu nombre</label>
        <span class="input-mark mark-X" aria-hidden="true">${renderMarkIcon(isJoin ? 'O' : 'X')}</span>
        <input id="online-name" type="text" maxlength="20" placeholder="Tu nombre" autocomplete="off" autofocus aria-required="true" aria-describedby="online-error" ${setupLoading ? 'disabled' : ''} />
      </div>
      ${isJoin ? `
        <div class="field player-input player-input-o">
          <label class="sr-only" for="room-code">Código de sala</label>
          <span class="input-mark mark-O" aria-hidden="true">#</span>
          <input id="room-code" type="text" maxlength="6" placeholder="Código de sala" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" inputmode="text" pattern="[A-Z0-9]*" class="room-code-input" aria-required="true" ${setupLoading ? 'disabled' : ''} />
        </div>
      ` : ''}
      <span class="field-error" id="online-error" aria-live="polite"></span>
      ${renderHeroMarks()}
      <div class="setup-actions">
        <button type="submit" class="btn btn-primary" ${setupLoading ? 'disabled' : ''}>${setupLoading ? (isJoin ? 'Uniendo...' : 'Creando...') : (isJoin ? 'Unirse' : 'Crear sala')}</button>
      </div>
    </form>
  `;
}

function renderHeroMarks(): string {
  return `
    <div class="hero-marks" aria-hidden="true">
      <span class="hero-x">${renderMarkIcon('X')}</span>
      <span class="hero-o">${renderMarkIcon('O')}</span>
    </div>
  `;
}

function bindSetupEvents() {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setupMode = button.dataset['mode'] as SetupMode;
      setupMessage = '';
      render();
    });
  });

  requestAnimationFrame(() => {
    const input = document.querySelector<HTMLInputElement>(setupMode === 'local' ? '#player-x' : '#online-name');
    input?.focus({ preventScroll: true });
  });

  document.getElementById('setup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameX = validatePlayerName(qs<HTMLInputElement>('#player-x').value);
    const nameO = validatePlayerName(qs<HTMLInputElement>('#player-o').value);
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
    cleanupRoomSubscription();
    state = initialGameState({ X: nameX!, O: nameO! }, getSoundEnabled());
    saveState(state);
    clearOnlineSession();
    render();
  });

  document.getElementById('online-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    void submitOnlineSetup();
  });

  document.getElementById('room-code')?.addEventListener('input', (e) => {
    const input = e.currentTarget as HTMLInputElement;
    input.value = input.value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
  });
}

async function submitOnlineSetup() {
  if (!isSupabaseConfigured()) {
    qs<HTMLSpanElement>('#online-error').textContent = 'Configura Supabase para activar el modo online.';
    return;
  }

  const name = qs<HTMLInputElement>('#online-name').value;
  const errorEl = qs<HTMLSpanElement>('#online-error');
  errorEl.textContent = '';
  setOnlineSetupLoading(true);

  try {
    const result = setupMode === 'online-join'
      ? await joinOnlineRoom(qs<HTMLInputElement>('#room-code').value, name)
      : await createOnlineRoom(name);

    cleanupRoomSubscription();
    saveState(null);
    saveOnlineSession(result.session);
    setupLoading = false;
    state = {
      mode: 'online',
      room: result.room,
      session: result.session,
      connectionStatus: 'connected',
      soundEnabled: getSoundEnabled(),
    };
    subscribeToCurrentRoom();
    render();
  } catch (error) {
    errorEl.textContent = error instanceof Error ? error.message : 'No se pudo iniciar el modo online.';
    setOnlineSetupLoading(false);
  }
}

function setOnlineSetupLoading(isLoading: boolean) {
  setupLoading = isLoading;
  const submit = document.querySelector<HTMLButtonElement>('#online-form button[type="submit"]');
  const isJoin = setupMode === 'online-join';
  if (submit) {
    submit.disabled = isLoading;
    submit.textContent = isLoading ? (isJoin ? 'Uniendo...' : 'Creando...') : (isJoin ? 'Unirse' : 'Crear sala');
  }
  document.querySelectorAll<HTMLInputElement>('#online-form input').forEach((input) => {
    input.disabled = isLoading;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.disabled = isLoading || (button.dataset['mode']?.startsWith('online') === true && !isSupabaseConfigured());
  });
}

// ---- Online Lobby ----

function renderOnlineLobby(): string {
  if (!isOnlineState(state)) return '';
  return `
    <div class="screen setup-screen online-lobby" role="main">
      <div class="ambient ambient-primary" aria-hidden="true"></div>
      <div class="ambient ambient-secondary" aria-hidden="true"></div>
      <header class="setup-identity">
        <h1 class="game-title">SALA ${escapeHtml(state.room.code)}</h1>
        <p class="subtitle">Comparte este código con tu rival</p>
      </header>
      <div class="room-code-card" aria-label="Código de sala">${escapeHtml(state.room.code)}</div>
      <div class="lobby-disclaimer" role="status">
        <span>Estamos esperando que tu rival se una a la sala</span>
      </div>
      ${renderHeroMarks()}
      <div class="setup-actions">
        <button type="button" class="btn btn-secondary" id="lobby-back-menu">Volver al menu</button>
      </div>
    </div>
  `;
}

function bindLobbyEvents() {
  document.getElementById('lobby-back-menu')?.addEventListener('click', () => {
    void leaveCurrentOnlineRoom();
  });
}

// ---- Game Screen ----

function renderGameScreen(): string {
  if (!state) return '';
  const view = getRenderableState();
  const { board, currentTurn, players, phase, soundEnabled, result } = view;
  const onlineView = isOnlineState(state) ? mapRoomToGameView(state) : null;
  const canMove = onlineView ? onlineView.canMove : phase === 'playing';
  const winLine: number[] = isWin(result) ? result.line : [];
  const safePlayers = { X: escapeHtml(players.X), O: escapeHtml(players.O) };

  const cells = board.map((cell, i) => {
    const isWinCell = winLine.includes(i);
    const disabled = phase !== 'playing' || cell !== null || !canMove ? 'disabled aria-disabled="true"' : '';
    const mark = cell ?? '';
    return `<button class="cell${mark ? ` mark-${mark}` : ''}${isWinCell ? ' win-cell' : ''}" data-index="${i}" ${disabled} aria-label="Celda ${i + 1}${mark ? `: ${mark}` : ', vacía'}">${mark ? renderMarkIcon(mark) : ''}</button>`;
  }).join('');

  const currentName = players[currentTurn];
  const onlineStatus = getOnlineStatusMessage();
  return `
    <div class="screen game-screen" role="main">
      <div class="ambient ambient-primary" aria-hidden="true"></div>
      <div class="ambient ambient-secondary" aria-hidden="true"></div>

      <header class="game-header">
        <button class="btn btn-back" id="new-game-btn" aria-label="Volver al menu inicial">${iconSvg('back')}</button>
        <div class="turn-indicator mark-${currentTurn}" aria-live="polite">
          ${phase === 'playing' ? renderTurnContent(currentTurn, currentName) : ''}
        </div>
        <div class="turn-underline" aria-hidden="true"></div>
        ${onlineView ? `<p class="online-status" aria-live="polite">${escapeHtml(onlineStatus)}</p>` : ''}
      </header>

      <div class="board" role="grid" aria-label="Tablero de juego">${cells}</div>

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
          ${onlineView ? '' : `<button class="btn btn-fab" id="reset-btn" aria-label="Reiniciar partida">${iconSvg('reset')}</button>`}
          <button class="btn btn-ghost sound-toggle" id="sound-toggle" aria-label="${soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}">
            ${soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
          </button>
        </div>
      </footer>

      <div id="win-modal" class="modal hidden" role="dialog" aria-modal="true" aria-label="Resultado de la partida">
        <div class="modal-content">
          <div class="modal-icon" aria-hidden="true">♕</div>
          <h2 class="modal-title" id="modal-title"></h2>
          <button class="btn btn-primary" id="modal-play-again">${onlineView ? 'Pedir revancha' : 'Jugar de nuevo'}</button>
          <button class="btn btn-secondary" id="modal-back-menu">Volver al menu</button>
        </div>
      </div>
    </div>
  `;
}

function showResultModal() {
  if (!state) return;
  const modal = document.getElementById('win-modal');
  const titleEl = document.getElementById('modal-title');
  if (!modal || !titleEl) return;

  const view = getRenderableState();
  if (isWin(view.result)) {
    titleEl.textContent = `¡${view.players[view.result.winner]} gana!`;
  } else if (isDraw(view.result)) {
    titleEl.textContent = 'Empate';
  }

  modal.classList.remove('hidden');
  modal.classList.add('visible');
}

function hideResultModal() {
  const modal = document.getElementById('win-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('visible');
}

function bindGameEvents() {
  document.querySelectorAll<HTMLButtonElement>('.cell').forEach((btn) => {
    btn.addEventListener('click', () => {
      void handleCellClick(btn);
    });
  });

  document.getElementById('sound-toggle')?.addEventListener('click', () => {
    if (!state) return;
    state = { ...state, soundEnabled: !state.soundEnabled };
    if (!isOnlineState(state)) saveState(state);
    render();
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (!state || isOnlineState(state)) return;
    state = resetBoard(state);
    saveState(state);
    render();
  });

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    void leaveCurrentOnlineRoom();
  });

  document.getElementById('modal-play-again')?.addEventListener('click', () => {
    void playAgain();
  });

  document.getElementById('modal-back-menu')?.addEventListener('click', () => {
    void leaveCurrentOnlineRoom();
  });
}

async function handleCellClick(btn: HTMLButtonElement) {
  if (!state) return;
  const index = parseInt(btn.dataset['index'] ?? '-1', 10);
  if (index < 0) return;

  if (isOnlineState(state)) {
    const view = mapRoomToGameView(state);
    if (!view.canMove || state.room.board[index] !== null) return;
    const previousRoom = state.room;
    const optimisticRoom = applyOnlineMove(previousRoom, state.session.mark, index);
    if (!optimisticRoom) return;

    playSound('move', state.soundEnabled);
    state = { ...state, room: optimisticRoom, connectionStatus: 'connected', errorMessage: undefined };
    render();

    try {
      const room = await submitOnlineMove(previousRoom, state.session, index);
      state = { ...state, room, connectionStatus: 'connected', errorMessage: undefined };
      if (isWin(room.result)) playSound('win', state.soundEnabled);
      if (isDraw(room.result)) playSound('draw', state.soundEnabled);
      render();
    } catch (error) {
      state = { ...state, room: previousRoom, connectionStatus: 'error', errorMessage: error instanceof Error ? error.message : 'No pudimos enviar tu movimiento.' };
      render();
    }
    return;
  }

  if (state.phase !== 'playing' || state.board[index] !== null) return;
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
      if (!state || isOnlineState(state)) return;
      state = { ...resetBoard(state), board: emptyBoard() };
      saveState(state);
      render();
    }, 1200);
  } else {
    render();
  }
}

async function playAgain() {
  if (!state) return;
  document.getElementById('win-modal')?.classList.add('hidden');

  if (isOnlineState(state)) {
    try {
      const room = await requestOnlineRematch(state.room, state.session);
      state = { ...state, room, connectionStatus: 'connected', errorMessage: undefined };
      render();
    } catch (error) {
      state = { ...state, connectionStatus: 'error', errorMessage: error instanceof Error ? error.message : 'No pudimos pedir la revancha.' };
      render();
    }
    return;
  }

  state = resetBoard(state);
  saveState(state);
  render();
}

async function leaveCurrentOnlineRoom() {
  if (isOnlineState(state)) {
    const { room, session } = state;
    void leaveOnlineRoom(room, session);
  }

  cleanupRoomSubscription();
  clearOnlineSession();
  saveState(null);
  state = null;
  setupMode = 'local';
  setupLoading = false;
  render();
}

function subscribeToCurrentRoom() {
  if (!isOnlineState(state)) return;
  cleanupRoomSubscription();
  const subscription = subscribeToOnlineRoom(state.room.code, (room) => {
    applyIncomingOnlineRoom(room);
  });
  roomChannel = subscription.channel;
  roomPollTimer = window.setInterval(() => {
    void pollCurrentRoom();
  }, 1000);
}

function cleanupRoomSubscription() {
  if (roomChannel) {
    void getSupabaseClient().removeChannel(roomChannel);
    roomChannel = null;
  }
  if (roomPollTimer !== null) {
    window.clearInterval(roomPollTimer);
    roomPollTimer = null;
  }
}

async function pollCurrentRoom() {
  if (!isOnlineState(state)) return;
  const room = await fetchOnlineRoom(state.room.code);
  if (!room) {
    cleanupRoomSubscription();
    clearOnlineSession();
    saveState(null);
    state = null;
    setupMode = 'local';
    setupLoading = false;
    setupMessage = 'No pudimos sincronizar la sala.';
    render();
    return;
  }

  applyIncomingOnlineRoom(room);
}

function applyIncomingOnlineRoom(room: OnlineRoomRecord) {
  if (!isOnlineState(state)) return;
  if (!hasOnlineRoomChanged(state.room, room)) return;

  if (room.status === 'abandoned') {
    cleanupRoomSubscription();
    clearOnlineSession();
    saveState(null);
    state = null;
    setupMode = 'local';
    setupLoading = false;
    setupMessage = 'Tu rival volvió al menú.';
    render();
    return;
  }

  state = { ...state, room, connectionStatus: 'connected', errorMessage: undefined };
  render();
}

function hasOnlineRoomChanged(current: OnlineRoomRecord, incoming: OnlineRoomRecord): boolean {
  if (current.updated_at && incoming.updated_at && current.updated_at === incoming.updated_at) return false;
  return JSON.stringify({
    status: current.status,
    players: current.players,
    board: current.board,
    current_turn: current.current_turn,
    result: current.result,
    rematch_requests: current.rematch_requests,
  }) !== JSON.stringify({
    status: incoming.status,
    players: incoming.players,
    board: incoming.board,
    current_turn: incoming.current_turn,
    result: incoming.result,
    rematch_requests: incoming.rematch_requests,
  });
}

// ---- Init ----

async function init() {
  const onlineSession = loadOnlineSession();
  if (onlineSession && isSupabaseConfigured()) {
    const room = await fetchOnlineRoom(onlineSession.roomCode);
    if (room) {
      state = {
        mode: 'online',
        room,
        session: onlineSession,
        connectionStatus: 'connected',
        soundEnabled: true,
      };
      subscribeToCurrentRoom();
      render();
      return;
    }
    clearOnlineSession();
    setupMessage = 'No pudimos reanudar la sala online.';
  }

  state = loadState();
  render();
}

void init();
