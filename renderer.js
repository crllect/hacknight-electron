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

        tableHTML = tableify(ports);
        document.getElementById('ports').innerHTML = tableHTML;

        // Find the port with the manufacturer "Adafruit"
        const adafruitPort = ports.find(port => port.manufacturer === 'Adafruit');

        if (adafruitPort) {
            // Open a new SerialPort instance for the Adafruit port
            const port = new SerialPort(adafruitPort.path, { baudRate: 9600 });

            // Write data to the port
            port.write('000100e', (err) => {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
                console.log('Message written');
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