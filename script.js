let WORK_MINUTES = 25;
let BREAK_MINUTES = 5;
let timeLeft = WORK_MINUTES * 60;
let isRunning = false;
let isWorkSession = true;
let timerInterval;
let isMuted = false;
let focusTimeElapsed = 0;

const timerDisplay = document.getElementById('timerDisplay');
const sessionType = document.getElementById('sessionType');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const closeSettings = document.getElementById('closeSettings');
const focusLengthInput = document.getElementById('focusLength');
const breakLengthInput = document.getElementById('breakLength');
const muteNotifCheckbox = document.getElementById('muteNotif');
const jarContainer = document.querySelector('.jar-container');
const jarImage = jarContainer.querySelector('.jar-image');
const fireflyCountEl = document.getElementById('fireflyCount');
let fireflyScore = parseInt(localStorage.getItem('fireflyScore') || '0');

function updateDisplay() {
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;
	timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateFireflyCount() {
	fireflyCountEl.textContent = fireflyScore;
	localStorage.setItem('fireflyScore', fireflyScore);
}

function switchSession() {
	isWorkSession = !isWorkSession;
	timeLeft = isWorkSession ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
	sessionType.textContent = isWorkSession ? 'focus' : 'break';
	document.body.className = isWorkSession ? 'work-session' : 'break-session';
	jarImage.src = isWorkSession ? 'assets/jar.png' : 'assets/jaropen.png';

	const fireflies = jarContainer.querySelectorAll('.firefly');
	fireflies.forEach(firefly => {
		if (isWorkSession) {
			firefly.dataset.noBounce = 'false';
			firefly.dataset.vx = ((Math.random() * 0.8) + 0.2) * (Math.random() < 0.5 ? -1 : 1);
			firefly.dataset.vy = ((Math.random() * 0.8) + 0.2) * (Math.random() < 0.5 ? -1 : 1);
		} else {
			firefly.dataset.noBounce = 'true';
			firefly.dataset.vx = (Math.random() * 1) - 0.5;
			firefly.dataset.vy = -((Math.random() * 1) + 1);
		}
	});

	playNotification();
	updateDisplay();
}

function playNotification() {
	if (isMuted) return;
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);		
	oscillator.frequency.value = 800;
	oscillator.type = 'sine';
	gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
	oscillator.start(audioContext.currentTime);
	oscillator.stop(audioContext.currentTime + 0.5);
}

function spawnFirefly() {
	const jarImage = jarContainer.querySelector('.jar-image');
	const jarRect = jarImage.getBoundingClientRect();
	const containerRect = jarContainer.getBoundingClientRect()
	const offsetLeft = 243;
	const offsetTop = 158;
	const offsetRight = 243;
	const offsetBottom = 80;
	const spawnAreaLeft = jarRect.left + offsetLeft;
	const spawnAreaTop = jarRect.top + offsetTop;
	const spawnAreaWidth = Math.max(100, jarRect.width - offsetLeft - offsetRight);
	const spawnAreaHeight = Math.max(100, jarRect.height - offsetTop - offsetBottom);
	const fireflyVariants = [
		'firefly^w^.png',
		'fireflylenny.png',
		'fireflymanface.png',
		'fireflysmiley.png',
		'fireflyXP.png'
	];
	const chosenFirefly = fireflyVariants[Math.floor(Math.random() * fireflyVariants.length)];
	const firefly = document.createElement('img');
	firefly.src = `/assets/${chosenFirefly}`;
	firefly.className = 'firefly';
	firefly.style.position = 'absolute';
	firefly.style.width = '100px';
	firefly.style.height = '100px';
	const left = spawnAreaLeft - containerRect.left + Math.random() * (spawnAreaWidth - 100);
	const top = spawnAreaTop - containerRect.top + Math.random() * (spawnAreaHeight - 100);
	const minLeft = spawnAreaLeft - containerRect.left;
	const minTop = spawnAreaTop - containerRect.top;
	const maxLeft = minLeft + spawnAreaWidth - 100;
	const maxTop = minTop + spawnAreaHeight - 100;
	firefly.style.left = `${left}px`;
	firefly.style.top = `${top}px`;
	firefly.dataset.minLeft = minLeft;
	firefly.dataset.minTop = minTop;
	firefly.dataset.maxLeft = maxLeft;
	firefly.dataset.maxTop = maxTop;
	firefly.dataset.vx = ((Math.random() * 0.8) + 0.2) * (Math.random() < 0.5 ? -1 : 1);
	firefly.dataset.vy = ((Math.random() * 0.8) + 0.2) * (Math.random() < 0.5 ? -1 : 1);
	jarContainer.style.position = 'relative';
	jarContainer.appendChild(firefly);
}

function animateFireflies() {
	const fireflies = jarContainer.querySelectorAll('.firefly');
	const screenTop = -250;
	fireflies.forEach(firefly => {
		let x = parseFloat(firefly.style.left);
		let y = parseFloat(firefly.style.top);
		let vx = parseFloat(firefly.dataset.vx);
		let vy = parseFloat(firefly.dataset.vy);
		const minLeft = parseFloat(firefly.dataset.minLeft);
		const minTop = parseFloat(firefly.dataset.minTop);
		const maxLeft = parseFloat(firefly.dataset.maxLeft);
		const maxTop = parseFloat(firefly.dataset.maxTop);
		const noBounce = firefly.dataset.noBounce === 'true';
		x += vx;
		y += vy;
		if (!noBounce) {
			if (x <= minLeft || x >= maxLeft) {
				vx = -vx;
				x = Math.min(Math.max(x, minLeft), maxLeft);
			}
			if (y <= minTop || y >= maxTop) {
				vy = -vy;
				y = Math.min(Math.max(y, minTop), maxTop);
			}
		} else {
			if (x <= minLeft) {
				x = minLeft;
				vx = Math.abs(vx);
			} else if (x >= maxLeft) {
				x = maxLeft;
				vx = -Math.abs(vx);
			}
			if (y + parseFloat(firefly.style.height) < screenTop) {
				fireflyScore += 1;
				updateFireflyCount();
				firefly.remove();
				return;
			}
		}
		firefly.style.left = `${x}px`;
		firefly.style.top = `${y}px`;
		firefly.dataset.vx = vx;
		firefly.dataset.vy = vy;
	});

	requestAnimationFrame(animateFireflies);
}

function startTimer() {
	if (isRunning) return;
	isRunning = true;
	startBtn.disabled = true;
	pauseBtn.disabled = false;
	timerInterval = setInterval(() => {
		timeLeft--;
		if (isWorkSession) {
			focusTimeElapsed++;
			if (focusTimeElapsed % 5 === 0) {
				spawnFirefly();
			}
		}
		updateDisplay();
		if (timeLeft === 0) {
			focusTimeElapsed = 0;
			switchSession();
			pauseBtn.disabled = false;
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    isWorkSession = true;
    timeLeft = WORK_MINUTES * 60;
    focusTimeElapsed = 0;
    sessionType.textContent = 'focus';
    document.body.className = 'work-session';
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    const fireflies = jarContainer.querySelectorAll('.firefly');
    fireflies.forEach(firefly => firefly.remove());
}

function skipTimer() {
	isRunning = false;
	clearInterval(timerInterval);
	switchSession();
	startTimer();
}

function toggleSettings() {
	settingsMenu.classList.toggle('hidden');
}

function closeSettingsMenu() {
	settingsMenu.classList.add('hidden');
}

function updateSettings() {
	const newFocusLength = parseInt(focusLengthInput.value);
	const newBreakLength = parseInt(breakLengthInput.value);
	WORK_MINUTES = newFocusLength;
	BREAK_MINUTES = newBreakLength;
	if (!isRunning) {
		if (isWorkSession) {
			timeLeft = WORK_MINUTES * 60;
		} else {
			timeLeft = BREAK_MINUTES * 60;
		}
		updateDisplay();
	}
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipTimer);
settingsBtn.addEventListener('click', toggleSettings);
closeSettings.addEventListener('click', closeSettingsMenu);
focusLengthInput.addEventListener('change', updateSettings);
breakLengthInput.addEventListener('change', updateSettings);
muteNotifCheckbox.addEventListener('change', (e) => {
	isMuted = e.target.checked;
});

document.addEventListener('click', (e) => {
	if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
		closeSettingsMenu();
	}
});

updateFireflyCount();
updateDisplay();
document.body.className = 'work-session';
requestAnimationFrame(animateFireflies);
