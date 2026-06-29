const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
			
let timeLeft = WORK_MINUTES * 60;
let isRunning = false;
let isWorkSession = true;
let sessionsCompleted = 0;
let timerInterval;

const timerDisplay = document.getElementById('timerDisplay');
const sessionType = document.getElementById('sessionType');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionsCounter = document.getElementById('sessionsCompleted');

function updateDisplay() {
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;
	timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function switchSession() {
	isWorkSession = !isWorkSession;
	timeLeft = isWorkSession ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
	sessionType.textContent = isWorkSession ? 'Work Session' : 'Break Time';
	document.body.className = isWorkSession ? 'work-session' : 'break-session';
				
	if (isWorkSession) {
		sessionsCompleted++;
		sessionsCounter.textContent = sessionsCompleted;
	}
				
	playNotification();
	updateDisplay();
}

function playNotification() {
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

function startTimer() {
	if (isRunning) return;
	isRunning = true;
	startBtn.disabled = true;
	pauseBtn.disabled = false;

	timerInterval = setInterval(() => {
		timeLeft--;
		updateDisplay();

		if (timeLeft === 0) {
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
    sessionType.textContent = 'Work Session';
    document.body.className = 'work-session';
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();
document.body.className = 'work-session';
