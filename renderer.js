// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort } = require('serialport');
const tableify = require('tableify');

async function listSerialPorts() {
	await SerialPort.list().then((ports, err) => {
		if (err) {
			document.getElementById('error').textContent = err.message;
			return;
		} else {
			document.getElementById('error').textContent = '';
		}
		console.log('ports', ports);

		if (ports.length === 0) {
			document.getElementById('error').textContent =
				'No ports discovered';
		}
		console.log('ports', ports);

		tableHTML = tableify(ports);
		document.getElementById('ports').innerHTML = tableHTML;
		document.getElementById('error').textContent = 'Weve made it this far';
		// Find the port with the manufacturer "Adafruit"
		const adafruitPort = ports.find(
			port => port.manufacturer === 'Adafruit'
		);
		document.getElementById('error').textContent =
			'Right after adafruit port check';
		console.log('Adafruit port:', adafruitPort);
		document.getElementById('error').textContent = adafruitPort;
		if (adafruitPort) {
			document.getElementById('error').textContent = 'ohhh shittt';

			const serPort = new SerialPort(adafruitPort.path, {
				baudRate: 9600
			});
            document.getElementById('error').textContent = '2';

			serPort.on('open', function () {
				document.getElementById('error').textContent = 'Port opened';

				// Write data to the port
				serPort.write('000100e', function (err) {
					if (err) {
						return console.log('Error on write: ', err.message);
					}
					document.getElementById('error').textContent =
						'Data written';
				});
			});

			serPort.on('data', function (data) {
				console.log('Data:', data);
			});

			serPort.on('close', function () {
				console.log('Port closed');
			});

			serPort.on('error', function (err) {
				console.log('Error: ', err.message);
			});
		}
	});
}

function listPorts() {
	listSerialPorts();
	setTimeout(listPorts, 2000);
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
setTimeout(listPorts, 2000);

listSerialPorts();

// path: /dev/tty.usbmodem101
// manufacturer: Adafruit
