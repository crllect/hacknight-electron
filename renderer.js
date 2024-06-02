const { ipcRenderer } = require('electron');
const form = document.getElementById('pomodoro-form');

form.addEventListener('submit', e => {
	e.preventDefault();

	const time = form.time.value;
	const interests = form.interests.value;

	const militaryTime = time.padStart(4, '0');

	ipcRenderer.send('submit-time', militaryTime);
});

ipcRenderer.on('data-received', () => {
	const breakLength = prompt('Enter a break length:');
	console.log('Break Length:', breakLength);
});
