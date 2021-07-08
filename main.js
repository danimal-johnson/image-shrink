const { app, BrowserWindow, Menu, globalShortcut } = require('electron');

// process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

let mainWindow;

function createMainWindow () {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    resizable: isDev,
    icon: __dirname + '/assets/icons/Icon_256x256.png',
  });

  // mainWindow.loadURL('file://' + __dirname + '/app/index.html');
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register('CmdOrCtrl+R', () => (mainWindow.reload()));
  if (isDev) {
    globalShortcut.register('CmdOrCtrl+Shift+R', () => (mainWindow.webContents.reloadIgnoringCache()));
    globalShortcut.register('CmdOrCtrl+Alt+R', () => (mainWindow.webContents.executeJavaScript('window.location.reload()')));
    globalShortcut.register('CmdOrCtrl+Shift+S', () => (mainWindow.webContents.send('save-as'))); // Doesn't work
    globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => (mainWindow.toggleDevTools()));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

const menu = [
  ...(isMac ? [{ role: 'appMenu'}] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit(),
      },
    ],
  },
];

// if(isMac) {
//   menu.unshift({ role: 'appMenu' });
// }

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// If this doesn't work on Mac, try this: (BrowserWindow.getAllWindows().length === 0)
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});