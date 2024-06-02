const { app, BrowserWindow, ipcMain } = require('electron');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');

SerialPort.list()
	.then(ports => {
		ports.forEach(port => {
			console.log(port.path);
		});
	})
	.catch(err => {
		console.error('Error:', err.message);
	});

let mainWindow;
let port;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});

	mainWindow.loadFile('index.html');
}

function initializeSerialConnection() {
	port = new SerialPort('/dev/cu.usbmodem101', { baudRate: 9600 });
	const parser = port.pipe(new Readline({ delimiter: '\n' }));

	port.on('open', () => {
		console.log('Serial port opened');
	});

	port.on('error', err => {
		console.error('Error:', err.message);
	});

	parser.on('data', data => {
		console.log('Data from Arduino:', data);
		mainWindow.webContents.send('data-received', data);
	});
}

app.on('ready', () => {
	createWindow();
	initializeSerialConnection();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('submit-time', (event, time) => {
	if (port && port.isOpen) {
		port.write(time + 'e');
		console.log('Data sent to Arduino:', time + 'e');
	} else {
		console.error('Serial port is not open');
	}
});
