const { app, BrowserWindow, protocol, net, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const PUBLIC = new Set([
  'index.html', 'styles.css', 'app.js', 'lib.js',
  'config.js', 'sw.js', 'manifest.webmanifest',
  'icon.svg', 'icon-192.png', 'icon-512.png'
]);

protocol.registerSchemesAsPrivileged([{
  scheme: 'playbook',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);

app.whenReady().then(() => {
  protocol.handle('playbook', (request) => {
    const url = new URL(request.url);
    const name = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || 'index.html';
    if (url.hostname !== 'app' || !PUBLIC.has(name)) {
      return new Response('Recurso indisponível', { status: 404 });
    }
    const file = path.join(__dirname, '..', 'dist', 'web', name);
    return net.fetch(pathToFileURL(file).href);
  });

  const win = new BrowserWindow({
    title: 'PLAYBOOK',
    width: 1170,
    height: 830,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: '#080d09',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('playbook://app/')) event.preventDefault();
  });
  void win.loadURL('playbook://app/');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
