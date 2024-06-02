const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');

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
	SerialPort.list()
		.then(ports => {
			const arduinoPort = ports.find(
				port =>
					port.manufacturer && port.manufacturer.includes('a')
			);

			if (arduinoPort) {
				port = new SerialPort(arduinoPort.path, { baudRate: 9600 });

				port.on('open', () => {
					console.log('Serial port opened');
				});

				port.on('error', err => {
					console.error('Error:', err.message);
				});

				port.on('data', data => {
					console.log('Data from Arduino:', data);
					mainWindow.webContents.send('data-received');
				});

				port.on('open', () => {
					if (port.isOpen) {
						console.log(
							'Serial port opened and connected to Arduino'
						);
					}
				});

				ipcMain.on('submit-time', (event, time) => {
					if (port && port.isOpen) {
						port.write(time + 'e');
						console.log('Data sent to Arduino:', time + 'e');
					} else {
						console.error(
							'Serial port is not open or not connected to Arduino'
						);
					}
				});
			} else {
				console.log('Arduino not found, retrying in 1 second...');
				setTimeout(initializeSerialConnection, 1000);
			}
		})
		.catch(err => {
			console.error('Error:', err.message);
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
