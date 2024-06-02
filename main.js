const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    win.loadFile('index.html');

    const port = new SerialPort('COM3', {
        baudRate: 9600
    });

    port.on('data', function (data) {
        console.log('Data:', data);
        win.webContents.send('data-received');
    });

    ipcMain.on('submit-time', (event, time) => {
        port.write(time);
    });
}

app.whenReady().then(createWindow);
