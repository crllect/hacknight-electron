const { SerialPort } = require('serialport');
const tableify = require('tableify');

async function listSerialPorts() {
    try {
        const ports = await SerialPort.list();

        if (ports.length === 0) {
            document.getElementById('error').textContent = 'No ports discovered';
            document.getElementById('ports').innerHTML = '';
            return;
        }

        const tableHTML = tableify(ports);
        document.getElementById('ports').innerHTML = tableHTML;
        document.getElementById('error').textContent = 'Ports listed successfully';

        const adafruitPort = ports.find(port => port.manufacturer === 'Adafruit');
        
        if (adafruitPort && adafruitPort.path) {
            try {
                const serPort = new SerialPort(adafruitPort.path, { baudRate: 9600 });

                serPort.on('open', function () {
                    document.getElementById('error').textContent = 'Port opened';
                    serPort.write('000100e', function (err) {
                        if (err) {
                            document.getElementById('error').textContent = 'Error on write: ' + err.message;
                            return;
                        }
                        document.getElementById('error').textContent = 'Data written';
                    });
                });

                serPort.on('data', function (data) {
                    console.log('Data:', data);
                });

                serPort.on('close', function () {
                    document.getElementById('error').textContent = 'Port closed';
                });

                serPort.on('error', function (err) {
                    document.getElementById('error').textContent = 'Port error: ' + err.message;
                });
            } catch (error) {
                document.getElementById('error').textContent = 'Error when creating or interacting with SerialPort: ' + error.message;
            }
        } else if (adafruitPort) {
            document.getElementById('error').textContent = 'Adafruit port found but path is undefined';
        } else {
            document.getElementById('error').textContent = 'Adafruit port not found';
        }
    } catch (err) {
        document.getElementById('error').textContent = 'Failed to list serial ports: ' + err.message;
    }
}

function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
}

setTimeout(listPorts, 2000);
listSerialPorts();
