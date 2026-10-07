const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const appIcon = path.join(__dirname, 'img', 'iconPostIt.png');

let managerWindow;
const noteWindows = new Map();
let notes = [];

const colors = {
  yellow: '#ffe77a',
  pink: '#ffb7d5',
  blue: '#9edcff',
  green: '#b8efa4',
  purple: '#d8b8ff',
  orange: '#ffc487'
};

function dataFile() {
  return path.join(app.getPath('userData'), 'notes.json');
}

function loadNotes() {
  try {
    notes = JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
  } catch {
    notes = [];
  }
}

function saveNotes() {
  fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(notes, null, 2));
  managerWindow?.webContents.send('notes:changed', notes);
}

function createManager() {
  managerWindow = new BrowserWindow({
    width: 760,
    height: 620,
    minWidth: 620,
    minHeight: 480,
    title: 'Post-it Lembrete',
    icon: appIcon,
    backgroundColor: '#f6f1e8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  managerWindow.loadFile('index.html');
  managerWindow.on('closed', () => { managerWindow = null; });
}

function createNoteWindow(note) {
  if (noteWindows.has(note.id)) {
    noteWindows.get(note.id).focus();
    return;
  }

  const win = new BrowserWindow({
    x: note.x,
    y: note.y,
    width: note.width || 300,
    height: note.height || 280,
    minWidth: 220,
    minHeight: 180,
    frame: false,
    icon: appIcon,
    alwaysOnTop: note.alwaysOnTop !== false,
    skipTaskbar: note.alwaysOnTop === false,
    backgroundColor: colors[note.color] || colors.yellow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  noteWindows.set(note.id, win);
  win.loadFile('note.html', { query: { id: note.id } });

  const rememberBounds = () => {
    const current = notes.find((item) => item.id === note.id);
    if (!current || win.isDestroyed()) return;
    const bounds = win.getBounds();
    Object.assign(current, bounds);
    saveNotes();
  };

  win.on('moved', rememberBounds);
  win.on('resized', rememberBounds);
  // Capture the final geometry as well, including when the note is closed
  // immediately after being dragged or resized.
  win.on('close', rememberBounds);
  win.on('closed', () => noteWindows.delete(note.id));
}

function addNote(color = 'yellow') {
  const offset = notes.length % 8;
  const note = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: '',
    color: colors[color] ? color : 'yellow',
    x: 110 + offset * 28,
    y: 90 + offset * 28,
    width: 300,
    height: 280,
    alwaysOnTop: true,
    createdAt: new Date().toISOString()
  };
  notes.push(note);
  saveNotes();
  createNoteWindow(note);
  return note;
}

app.whenReady().then(() => {
  loadNotes();
  createManager();
  notes.forEach(createNoteWindow);

  app.on('activate', () => {
    if (!managerWindow) createManager();
    else managerWindow.show();
  });
});

app.on('window-all-closed', () => app.quit());

ipcMain.handle('notes:list', () => notes);
ipcMain.handle('notes:get', (_event, id) => notes.find((note) => note.id === id));
ipcMain.handle('notes:add', (_event, color) => addNote(color));
ipcMain.handle('notes:open', (_event, id) => {
  const note = notes.find((item) => item.id === id);
  if (note) createNoteWindow(note);
});
ipcMain.handle('notes:update', (_event, id, changes) => {
  const note = notes.find((item) => item.id === id);
  if (!note) return null;
  const allowed = ['text', 'color', 'alwaysOnTop'];
  for (const key of allowed) {
    if (Object.hasOwn(changes, key)) note[key] = changes[key];
  }
  const win = noteWindows.get(id);
  if (Object.hasOwn(changes, 'alwaysOnTop') && win) {
    win.setAlwaysOnTop(Boolean(changes.alwaysOnTop));
    win.setSkipTaskbar(!changes.alwaysOnTop);
  }
  if (Object.hasOwn(changes, 'color')) win?.setBackgroundColor(colors[note.color] || colors.yellow);
  saveNotes();
  return note;
});
ipcMain.handle('notes:delete', (_event, id) => {
  notes = notes.filter((note) => note.id !== id);
  const win = noteWindows.get(id);
  noteWindows.delete(id);
  win?.destroy();
  saveNotes();
});
ipcMain.handle('window:close-note', (event) => BrowserWindow.fromWebContents(event.sender)?.close());
ipcMain.handle('app:quit', () => app.quit());
