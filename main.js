const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

let mainWindow;
let aboutWindow;

function createMainWindow () {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 800 : 500,
    height: 600,
    resizable: isDev,
    icon: __dirname + '/assets/icons/Icon_256x256.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.loadURL('file://' + __dirname + '/app/index.html');
  mainWindow.loadFile(`${__dirname}/app/index.html`);
}

function createAboutWindow () {
  aboutWindow = new BrowserWindow({
    title: 'About',
    width: 300,
    height: 200,
    resizable: false,
    icon: __dirname + '/assets/icons/Icon_256x256.png',
  });

  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}


app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Global shortcuts moved to main menu
  // globalShortcut.register('CmdOrCtrl+R', () => (mainWindow.reload()));
  // if (isDev) {
  //   globalShortcut.register('CmdOrCtrl+Shift+R', () => (mainWindow.webContents.reloadIgnoringCache()));
  //   globalShortcut.register('CmdOrCtrl+Alt+R', () => (mainWindow.webContents.executeJavaScript('window.location.reload()')));
  //   globalShortcut.register('CmdOrCtrl+Shift+S', () => (mainWindow.webContents.send('save-as'))); // Doesn't work
  //   globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () => (mainWindow.toggleDevTools()));
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// ----------------- Menu ------------------------
const menu = [
  // Set our own app 'About' menu for Mac
  //...(isMac ? [{ role: 'appMenu'}] : []),
  ...(isMac ? [{
    label: app.name,
    submenu: [
    {
      label: 'About',
      click: createAboutWindow,
    }
  ]}] : []),
  // {
  //   label: 'File',
  //   submenu: [
  //     {
  //       label: 'Quit',
  //       accelerator: 'CmdOrCtrl+Q',
  //       click: () => app.quit(),
  //     },
  //   ],
  // },
  {
    role: 'fileMenu',
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow,
    }],
  }] : []), // Help/About menu only on non-Mac
  ...(isDev ? [
    {
      label: 'Developer',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'toggledevtools' },
      ],
    }] : [] // Hide menu if not in dev mode
  ),
];

// if(isMac) {
//   menu.unshift({ role: 'appMenu' });
// }

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink');
  console.log(options);
  shrinkImage(options);

});

async function shrinkImage ({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([imgPath], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({ 
          quality: [pngQuality, pngQuality],
        }),
      ],
    });

    shell.openPath(dest);

  } catch (err) {
    console.error(err);
  }
}

// ----------------- App Events ------------------------

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