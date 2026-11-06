import { isAudio, readableSize, timecode, progressKey, driveListUrl } from './lib.js';
import { saveAudioToStorage, getAllStoredMetadata, getAudioBlob, deleteAudioFromStorage } from './db.js';

const $ = (id) => document.getElementById(id);
const audio = $('audio');
const config = window.PLAYBOOK_CONFIG || {};
const embeddedApp = location.protocol === 'playbook:' || Boolean(window.Capacitor?.isNativePlatform?.());
const directDriveEnabled = !embeddedApp && String(config.googleClientId || '').endsWith('.apps.googleusercontent.com');
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const STORE_KEY = 'playbook-v02:state:v1';
const state = { token: '', drive: [], local: [], files: new Map(), current: null, objectUrl: null, lastSaved: 0, store: loadStore(), requestId: 0 };

let sleepTimer = null;
let sleepEndTime = 0;
let sleepMode = '0';

function loadStore() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return { progress: data?.progress && typeof data.progress === 'object' ? data.progress : {}, marks: data?.marks && typeof data.marks === 'object' ? data.marks : {}, speed: Number(data?.speed) || 1 };
  } catch { return { progress: {}, marks: {}, speed: 1 }; }
}
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state.store)); }
  catch { announce('Sem espaço para salvar o progresso neste navegador.', true); }
}
function announce(message, error = false) {
  const el = $('notice');
  el.textContent = message;
  el.classList.toggle('error', error);
}
function setWorking(working) {
  $('refresh-drive').disabled = working;
  $('login').disabled = working;
  $('choose-local').disabled = working;
}
function books() { return [...state.local, ...state.drive]; }
function labelFor(book) { return book.source === 'local' ? 'Neste aparelho (Offline)' : 'Google Drive'; }

function updateSleepIndicator() {
  const el = $('sleep-indicator');
  if (!el) return;
  if (!sleepTimer && sleepMode !== 'end') {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  if (sleepMode === 'end') {
    el.textContent = '🌙 Modo sono: pausará ao terminar este audiolivro';
  } else {
    const leftSec = Math.max(0, Math.round((sleepEndTime - Date.now()) / 1000));
    el.textContent = `🌙 Modo sono: desligando em ${timecode(leftSec)}`;
  }
}

function setSleepTimer(val) {
  if (sleepTimer) clearInterval(sleepTimer);
  sleepTimer = null;
  sleepMode = val;
  if (val === '0' || val === 'end') {
    updateSleepIndicator();
    return;
  }
  const mins = Number(val);
  sleepEndTime = Date.now() + mins * 60 * 1000;
  updateSleepIndicator();
  sleepTimer = setInterval(() => {
    const left = sleepEndTime - Date.now();
    if (left <= 0) {
      clearInterval(sleepTimer);
      sleepTimer = null;
      if ($('sleep-timer')) $('sleep-timer').value = '0';
      sleepMode = '0';
      audio.pause();
      announce('Modo sono ativado: áudio pausado.');
    }
    updateSleepIndicator();
  }, 1000);
}

function renderBooks() {
  const query = $('search').value.trim().toLocaleLowerCase('pt-BR');
  const source = $('source-filter').value;
  const all = books();
  const filtered = all.filter((book) => (source === 'all' || source === book.source) && book.name.toLocaleLowerCase('pt-BR').includes(query));
  $('book-count').textContent = `${all.length} ${all.length === 1 ? 'livro' : 'livros'}`;
  const list = $('library-list');
  list.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    const title = document.createElement('b');
    title.textContent = query ? 'Nenhum título encontrado.' : 'Sua biblioteca começa aqui.';
    const detail = document.createElement('p');
    detail.textContent = query ? 'Tente pesquisar outra palavra.' : 'Adicione um MP3 para guardar no aparelho ou conecte o Google Drive.';
    empty.append(title, detail);
    list.append(empty);
    return;
  }
  for (const book of filtered) {
    const row = document.createElement('div');
    row.className = 'book-row';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'book' + (state.current && progressKey(state.current) === progressKey(book) ? ' active' : '');
    button.setAttribute('aria-label', `Abrir ${book.name} (${labelFor(book)})`);
    const icon = document.createElement('span'); icon.className = 'book-icon'; icon.textContent = '♫';
    const meta = document.createElement('span'); meta.className = 'book-meta';
    const title = document.createElement('span'); title.className = 'book-title'; title.textContent = book.name;
    const caption = document.createElement('span'); caption.className = 'book-caption';

    const savedProg = state.store.progress[progressKey(book)]?.time;
    const progStr = savedProg ? ` · Parou em ${timecode(savedProg)}` : '';
    caption.textContent = `${labelFor(book)}${readableSize(book.size) ? ' · ' + readableSize(book.size) : ''}${progStr}`;

    const play = document.createElement('span'); play.className = 'book-play'; play.textContent = '▶';
    meta.append(title, caption); button.append(icon, meta, play);
    button.addEventListener('click', () => { void openBook(book); });
    row.append(button);

    if (book.source === 'local') {
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'book-delete';
      delBtn.title = 'Excluir do aparelho';
      delBtn.setAttribute('aria-label', `Excluir ${book.name} do aparelho`);
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Excluir "${book.name}" deste aparelho para liberar espaço?`)) {
          await removeLocalBook(book);
        }
      });
      row.append(delBtn);
    }
    list.append(row);
  }
}

async function removeLocalBook(book) {
  if (state.current && progressKey(state.current) === progressKey(book)) {
    closeCurrent();
    state.current = null;
    $('track-name').textContent = 'Escolha seu próximo livro';
    $('track-info').textContent = 'Pronto para começar';
    $('play').disabled = true;
  }
  await deleteAudioFromStorage(book.id);
  state.files.delete(book.id);
  state.local = state.local.filter((b) => b.id !== book.id);
  const key = progressKey(book);
  delete state.store.progress[key];
  delete state.store.marks[key];
  persist();
  renderBooks();
  announce(`Audiolivro "${book.name}" removido do aparelho.`);
}

function closeCurrent() {
  saveProgress();
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
}

function setTrackInfo(book) {
  $('track-name').textContent = book.name;
  $('track-info').textContent = labelFor(book);
  $('source-chip').textContent = book.source === 'drive' ? 'GOOGLE DRIVE' : 'OFFLINE NO APARELHO';
  $('play').disabled = false;
  $('back').disabled = false;
  $('forward').disabled = false;
  $('seek').disabled = false;
  $('bookmark').disabled = false;
  $('play').textContent = '▶';
  $('play').setAttribute('aria-label', 'Reproduzir');
  $('elapsed').textContent = '00:00';
  $('duration').textContent = '00:00';
  $('seek').value = '0';
  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: book.name, artist: 'PLAYBOOK TDS', album: 'Meus Audiolivros', artwork: [{ src: new URL('icon-512.png', document.baseURI).href, sizes: '512x512', type: 'image/png' }] });
  }
  renderMarks();
  renderBooks();
}

function saveProgress(force = false) {
  if (!state.current || !Number.isFinite(audio.currentTime)) return;
  if (!force && performance.now() - state.lastSaved < 3500) return;
  state.lastSaved = performance.now();
  state.store.progress[progressKey(state.current)] = { time: audio.currentTime, updated: Date.now() };
  persist();
}

function renderMarks() {
  const marks = $('marks'); marks.replaceChildren();
  if (!state.current) return;
  const key = progressKey(state.current);
  for (const stamp of state.store.marks[key] || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '◆ ' + timecode(stamp);
    button.title = 'Ir para ' + timecode(stamp);
    button.addEventListener('click', () => { if (Number.isFinite(audio.duration)) audio.currentTime = stamp; });
    marks.append(button);
  }
}

function updateProgress() {
  const current = Number(audio.currentTime) || 0;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  $('elapsed').textContent = timecode(current);
  $('duration').textContent = timecode(duration);
  if (duration > 0) $('seek').value = String(Math.round(current / duration * 1000));
  saveProgress();
}

async function registeredWorker() {
  if (!('serviceWorker' in navigator)) return false;
  if (navigator.serviceWorker.controller) return true;
  try { await navigator.serviceWorker.ready; } catch { return false; }
  if (navigator.serviceWorker.controller) return true;
  return await new Promise((resolve) => {
    const done = () => { clearTimeout(timer); navigator.serviceWorker.removeEventListener('controllerchange', onChange); resolve(Boolean(navigator.serviceWorker.controller)); };
    const onChange = () => done();
    const timer = setTimeout(done, 2200);
    navigator.serviceWorker.addEventListener('controllerchange', onChange, { once: true });
  });
}
function sendTokenToWorker() {
  navigator.serviceWorker?.controller?.postMessage({ type: 'PLAYBOOK_DRIVE_TOKEN', token: state.token });
}

async function downloadToMemory(book, requestId) {
  const maxFallbackBytes = 120 * 1024 * 1024;
  if (Number(book.size) > maxFallbackBytes) throw new Error('Este MP3 é grande. Atualize a página para ativar a reprodução por transmissão e tente novamente.');
  announce(`Preparando ${book.name}...`);
  const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(book.id)}?alt=media`);
  const declared = Number(response.headers.get('content-length'));
  if (declared > maxFallbackBytes) { await response.body?.cancel(); throw new Error('Arquivo grande demais para o modo de compatibilidade. Atualize a página.'); }
  if (!response.body?.getReader) {
    const blob = await response.blob();
    if (blob.size > maxFallbackBytes) throw new Error('Áudio grande demais para a memória do navegador.');
    if (requestId !== state.requestId) return null;
    return URL.createObjectURL(blob);
  }
  const reader = response.body.getReader();
  const parts = []; let loaded = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (requestId !== state.requestId) { await reader.cancel(); return null; }
    loaded += value.byteLength;
    if (loaded > maxFallbackBytes) { await reader.cancel(); throw new Error('Arquivo grande demais para reprodução na memória.'); }
    parts.push(value);
    announce(`Baixando áudio temporário: ${readableSize(loaded)}${book.size ? ' / ' + readableSize(book.size) : ''}`);
  }
  return URL.createObjectURL(new Blob(parts, { type: book.mimeType || 'audio/mpeg' }));
}

async function openBook(book) {
  const requestId = ++state.requestId;
  closeCurrent();
  state.current = book;
  setTrackInfo(book);
  try {
    if (book.source === 'local') {
      let file = state.files.get(book.id);
      if (!file) {
        announce(`Carregando ${book.name} do armazenamento local...`);
        file = await getAudioBlob(book.id);
        if (file) {
          state.files.set(book.id, file);
        }
      }
      if (!file) throw new Error('Arquivo não encontrado no armazenamento deste aparelho.');
      state.objectUrl = URL.createObjectURL(file);
      audio.src = state.objectUrl;
    } else {
      if (!state.token) throw new Error('Conecte novamente sua conta Google.');
      if (await registeredWorker()) {
        sendTokenToWorker();
        audio.src = new URL(`__drive/${encodeURIComponent(book.id)}?v=${encodeURIComponent(book.modifiedTime || '')}`, document.baseURI).href;
      } else {
        const url = await downloadToMemory(book, requestId);
        if (!url || requestId !== state.requestId) { if (url) URL.revokeObjectURL(url); return; }
        state.objectUrl = url;
        audio.src = url;
      }
    }
    if (requestId !== state.requestId) return;
    audio.load();
    announce(`Carregado: ${book.name}. Toque em ▶ para ouvir.`);
  } catch (error) {
    if (requestId !== state.requestId) return;
    $('play').disabled = true;
    announce(error.message || 'Não foi possível abrir o arquivo.', true);
  }
}

async function driveFetch(url) {
  if (!state.token) throw new Error('Conecte sua conta Google novamente.');
  let response;
  try { response = await fetch(url, { headers: { Authorization: `Bearer ${state.token}` }, cache: 'no-store' }); }
  catch { throw new Error('Sem conexão com o Google Drive. Verifique a internet.'); }
  if (response.status === 401) throw new Error('A conexão com o Google expirou. Clique em Conectar Google novamente.');
  if (response.status === 403) throw new Error('Acesso negado pelo Google. Confira as permissões e a configuração da Drive API.');
  if (!response.ok) throw new Error(`Erro ${response.status} ao acessar o Google Drive.`);
  return response;
}

async function connectGoogle() {
  if (!directDriveEnabled) {
    announce('Abra o Drive pelo seletor de arquivos do aparelho. A conexão direta pelo Google é opcional na versão web.', false);
    return;
  }
  const clientId = String(config.googleClientId || '').trim();
  if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
    announce('Falta configurar o Client ID do Google no arquivo config.js. Consulte README.md.', true);
    return;
  }
  if (!window.google?.accounts?.oauth2) {
    announce('Não foi possível carregar a autenticação Google. Verifique a conexão à internet.', true);
    return;
  }
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    hint: config.accountHint || undefined,
    callback: async (response) => {
      if (response.error || !response.access_token) { announce('Login não concluído: ' + (response.error_description || response.error || 'sem autorização'), true); return; }
      state.token = response.access_token;
      sendTokenToWorker();
      $('login').hidden = true;
      $('logout').hidden = false;
      $('account-label').textContent = 'Google conectado';
      try {
        const aboutResponse = await driveFetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)');
        const about = await aboutResponse.json();
        if (about?.user?.emailAddress) $('account-label').textContent = about.user.emailAddress;
      } catch { /* nome da conta é opcional */ }
      void refreshDrive();
    },
    error_callback: () => announce('A janela de login foi fechada ou bloqueada.', true)
  });
  client.requestAccessToken({ prompt: '' });
}

async function refreshDrive() {
  if (!state.token) { await connectGoogle(); return; }
  setWorking(true);
  announce('Procurando seus arquivos de áudio no Google Drive...');
  try {
    const found = [];
    let nextPage = '';
    for (let i = 0; i < 40; i++) {
      const response = await driveFetch(driveListUrl(nextPage));
      const data = await response.json();
      if (!Array.isArray(data.files)) throw new Error('O Google Drive devolveu uma lista inesperada.');
      found.push(...data.files.filter(isAudio).map((file) => ({...file, source: 'drive'})));
      if (!data.nextPageToken) { nextPage = ''; break; }
      nextPage = data.nextPageToken;
    }
    state.drive = found;
    renderBooks();
    announce(nextPage ? `Encontrados ${found.length} áudios. Há mais arquivos no Drive; limite de busca atingido.` : `Encontrados ${found.length} áudios no Drive. Escolha um título para ouvir.`);
  } catch (error) { announce(error.message || 'Não foi possível buscar arquivos.', true); }
  finally { setWorking(false); }
}

async function pickLocalFiles(event) {
  const files = [...(event.target.files || [])].filter(isAudio);
  $('file-input').value = '';
  if (!files.length) {
    announce('Nenhum arquivo de áudio compatível selecionado.', true);
    return;
  }
  setWorking(true);
  announce(`Guardando ${files.length} audiolivro(s) de forma permanente neste aparelho...`);
  let savedCount = 0;
  for (const file of files) {
    try {
      const metadata = await saveAudioToStorage(file);
      state.files.set(metadata.id, file);
      const existingIndex = state.local.findIndex((b) => b.id === metadata.id);
      if (existingIndex >= 0) {
        state.local[existingIndex] = metadata;
      } else {
        state.local.unshift(metadata);
      }
      savedCount++;
    } catch (err) {
      console.error('Erro ao salvar no IndexedDB:', err);
    }
  }
  setWorking(false);
  renderBooks();
  announce(savedCount ? `${savedCount} audiolivro(s) guardado(s) no aparelho! Não precisa reenviar ao recarregar a página.` : 'Erro ao guardar no aparelho.', !savedCount);
}

audio.addEventListener('loadedmetadata', () => {
  if (!state.current) return;
  const last = Number(state.store.progress[progressKey(state.current)]?.time) || 0;
  if (Number.isFinite(audio.duration) && last > 0 && last < audio.duration - 3) {
    try { audio.currentTime = last; } catch { /* seek não disponível ainda */ }
  }
  updateProgress();
});
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('pause', () => saveProgress(true));
audio.addEventListener('ended', () => {
  $('play').textContent = '▶';
  saveProgress(true);
  if (sleepMode === 'end') {
    if ($('sleep-timer')) $('sleep-timer').value = '0';
    sleepMode = '0';
    updateSleepIndicator();
    announce('Fim do audiolivro: modo sono concluído.');
  }
});
audio.addEventListener('play', () => { $('play').textContent = 'Ⅱ'; $('play').setAttribute('aria-label', 'Pausar'); });
audio.addEventListener('pause', () => { $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Reproduzir'); });
audio.addEventListener('error', () => { if (state.current) announce('Falha ao carregar áudio. Se for do Drive, conecte sua conta novamente e tente outra vez.', true); });
$('play').addEventListener('click', async () => {
  if (!state.current) return;
  if (audio.paused) {
    try { await audio.play(); } catch { announce('Não foi possível iniciar este áudio. Verifique a conexão e o formato MP3.', true); }
  } else audio.pause();
});
$('back').addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); });
$('forward').addEventListener('click', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration, audio.currentTime + 30); });
$('seek').addEventListener('input', () => { if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number($('seek').value) / 1000 * audio.duration; });
$('speed').addEventListener('change', () => { audio.playbackRate = Number($('speed').value) || 1; state.store.speed = audio.playbackRate; persist(); });
if ($('sleep-timer')) {
  $('sleep-timer').addEventListener('change', (e) => setSleepTimer(e.target.value));
}
$('bookmark').addEventListener('click', () => {
  if (!state.current || !Number.isFinite(audio.currentTime)) return;
  const key = progressKey(state.current);
  const marks = state.store.marks[key] || [];
  marks.push(Math.round(audio.currentTime));
  state.store.marks[key] = [...new Set(marks)].slice(-12).sort((a,b) => a-b);
  persist(); renderMarks(); announce('Posição marcada neste aparelho.');
});
$('choose-local').addEventListener('click', () => $('file-input').click());
$('file-input').addEventListener('change', (e) => { void pickLocalFiles(e); });
$('login').addEventListener('click', () => { void connectGoogle(); });
$('refresh-drive').addEventListener('click', () => {
  if (directDriveEnabled) void refreshDrive();
  else $('file-input').click();
});
$('search').addEventListener('input', renderBooks);
$('source-filter').addEventListener('change', renderBooks);
$('logout').addEventListener('click', () => {
  const previousToken = state.token;
  state.token = '';
  state.drive = [];
  sendTokenToWorker();
  if (state.current?.source === 'drive') { closeCurrent(); state.current = null; $('track-name').textContent = 'Escolha seu próximo livro'; $('track-info').textContent = 'Pronto para começar'; $('play').disabled = true; }
  $('logout').hidden = true;
  $('login').hidden = false;
  $('account-label').textContent = 'Biblioteca pessoal';
  renderBooks();
  if (previousToken && google?.accounts?.oauth2?.revoke) google.accounts.oauth2.revoke(previousToken, () => {});
  announce('Conta Google desconectada deste player.');
});

window.addEventListener('beforeunload', () => saveProgress(true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(true); });

if ('mediaSession' in navigator) {
  const actions = { play: () => audio.play().catch(() => {}), pause: () => audio.pause(), seekbackward: (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 15)); }, seekforward: (d) => { audio.currentTime += d.seekOffset || 30; }, seekto: (d) => { if (typeof d.seekTime === 'number') audio.currentTime = d.seekTime; } };
  for (const [name, callback] of Object.entries(actions)) {
    try { navigator.mediaSession.setActionHandler(name, callback); } catch { /* nem todo sistema suporta todos os controles */ }
  }
}
if (!embeddedApp && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', sendTokenToWorker);
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PLAYBOOK_TOKEN_REQUEST') event.ports?.[0]?.postMessage({ token: state.token });
  });
  navigator.serviceWorker.register(new URL('sw.js', document.baseURI).href).catch(() => announce('A instalação como aplicativo pode estar indisponível neste navegador.', true));
}
if (directDriveEnabled) {
  $('login').hidden = false;
  $('refresh-drive').textContent = '↻ Buscar no Drive';
  const googleScript = document.createElement('script');
  googleScript.src = 'https://accounts.google.com/gsi/client';
  googleScript.async = true;
  document.head.append(googleScript);
}
const initialSpeed = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.5].includes(state.store.speed) ? state.store.speed : 1;
$('speed').value = String(initialSpeed);
audio.playbackRate = initialSpeed;

async function initLocalLibrary() {
  try {
    const stored = await getAllStoredMetadata();
    if (Array.isArray(stored) && stored.length > 0) {
      state.local = stored;
      renderBooks();
    }
  } catch (err) {
    console.warn('Armazenamento IndexedDB não carregado:', err);
  }
}
void initLocalLibrary();
