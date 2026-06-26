const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');
const usernameDisplay = document.getElementById('username-display');
const focusGameBtn = document.getElementById('focus-game');
const arcadePanel = document.getElementById('arcade-panel');
const startScreen = document.getElementById('start-screen');
const enterGameBtn = document.getElementById('enter-game');
const startFocusBtn = document.getElementById('start-focus');
const redeemOpenBtn = document.getElementById('redeem-open');
const redeemPanel = document.getElementById('redeem-panel');
const redeemInput = document.getElementById('redeem-code-input');
const redeemSubmitBtn = document.getElementById('redeem-submit');
const redeemCloseBtn = document.getElementById('redeem-close');
const redeemMessage = document.getElementById('redeem-message');
const eraButtons = document.querySelectorAll('[data-era]');
const timelineReadout = document.getElementById('timeline-readout');
const eraEffect = document.getElementById('era-effect');
const timeMachineCutscene = document.getElementById('time-machine-cutscene');
const timeCutsceneEra = document.getElementById('time-cutscene-era');
const timeCutsceneLine = document.getElementById('time-cutscene-line');
const gameToast = document.getElementById('game-toast');
const arcadeFrame = document.getElementById('arcade-frame');
const leaderboardList = document.getElementById('main-leaderboard');
const taskList = document.getElementById('task-list');
const refreshBoardBtn = document.getElementById('refresh-board');
const resetTasksBtn = document.getElementById('reset-tasks');
let tasksReady = false;
let timeCutsceneTimer = 0;
let toastTimer = 0;

// New elements for volume and visualizer
const volumeSlider = document.getElementById('volume-slider');
const visualizer = document.getElementById('visualizer');
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;

// Song titles
const songs = ['California Love', 'Money 2x', 'Headlines',];

// Keep track of song
let songIndex = localStorage.getItem('songIndex') ? parseInt(localStorage.getItem('songIndex')) : 2;

// Initially load song details into DOM
loadSong(songs[songIndex]);

// On page load: display username and restore playback state
window.addEventListener('load', () => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername && usernameDisplay) {
    usernameDisplay.textContent = `Welcome, ${savedUsername}!`;
  }

  const savedTime = localStorage.getItem('currentTime');
  const wasPlaying = localStorage.getItem('isPlaying') === 'true';
  
  if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
  }
  
  if (wasPlaying) {
    playSong();
  }
});

// Update song details
function loadSong(song) {
  title.innerText = song;
  audio.src = `music/${song}.mp3`;
  cover.src = `music/images/${song}.jpg`;
  localStorage.setItem('songIndex', songIndex);
  localStorage.setItem('currentSong', song);
  syncArcadeTrack();
}

// Play song
function playSong() {
  musicContainer.classList.add('play');
  playBtn.querySelector('i.fas').classList.remove('fa-play');
  playBtn.querySelector('i.fas').classList.add('fa-pause');

  audio.play();
  localStorage.setItem('isPlaying', 'true');
}

// Pause song
function pauseSong() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('i.fas').classList.add('fa-play');
  playBtn.querySelector('i.fas').classList.remove('fa-pause');

  audio.pause();
  localStorage.setItem('isPlaying', 'false');
}

// Previous song
function prevSong() {
  songIndex--;

  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }

  loadSong(songs[songIndex]);

  playSong();
}

// Next song
function nextSong() {
  songIndex++;

  if (songIndex > songs.length - 1) {
    songIndex = 0;
  }

  loadSong(songs[songIndex]);

  playSong();
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
  
  // Save current playback time every update
  localStorage.setItem('currentTime', currentTime);
}

// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

//get duration & currentTime for Time of song
function DurTime (e) {
	const {duration,currentTime} = e.srcElement;
	var sec;
	var sec_d;

	// define minutes currentTime
	let min = (currentTime==null)? 0:
	 Math.floor(currentTime/60);
	 min = min <10 ? '0'+min:min;

	// define seconds currentTime
	function get_sec (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec = Math.floor(x) - (60*i);
					sec = sec <10 ? '0'+sec:sec;
				}
			}
		}else{
	 		sec = Math.floor(x);
	 		sec = sec <10 ? '0'+sec:sec;
		 }
	} 

	get_sec (currentTime,sec);

	// change currentTime DOM
	if (currTime) currTime.innerHTML = min +':'+ sec;

	// define minutes duration
	let min_d = (isNaN(duration) === true)? '0':
		Math.floor(duration/60);
	 min_d = min_d <10 ? '0'+min_d:min_d;


	 function get_sec_d (x) {
		if(Math.floor(x) >= 60){
			
			for (var i = 1; i<=60; i++){
				if(Math.floor(x)>=(60*i) && Math.floor(x)<(60*(i+1))) {
					sec_d = Math.floor(x) - (60*i);
					sec_d = sec_d <10 ? '0'+sec_d:sec_d;
				}
			}
		}else{
	 		sec_d = (isNaN(duration) === true)? '0':
	 		Math.floor(x);
	 		sec_d = sec_d <10 ? '0'+sec_d:sec_d;
		 }
	} 

	// define seconds duration
	
	get_sec_d (duration);

	// change duration DOM
	if (durTime) durTime.innerHTML = min_d +':'+ sec_d;
		
};

// Volume control
function initAudioContext() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaElementAudioSource(audio);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function drawVisualizer() {
  if (!analyser) return;
  
  const ctx = visualizer.getContext('2d');
  analyser.getByteFrequencyData(dataArray);
  
  ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
  ctx.fillRect(0, 0, visualizer.width, visualizer.height);
  
  const barWidth = visualizer.width / dataArray.length;
  let x = 0;
  
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * visualizer.height;
    const hue = (i / dataArray.length) * 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(x, visualizer.height - barHeight, barWidth - 1, barHeight);
    x += barWidth;
  }
  
  animationId = requestAnimationFrame(drawVisualizer);
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    const ctx = visualizer.getContext('2d');
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.fillRect(0, 0, visualizer.width, visualizer.height);
  }
}

volumeSlider.addEventListener('input', (e) => {
  audio.volume = e.target.value / 100;
  localStorage.setItem('volume', e.target.value);
});

// Restore saved volume
const savedVolume = localStorage.getItem('volume') || 30;
volumeSlider.value = savedVolume;
audio.volume = savedVolume / 100;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (document.body.classList.contains('game-focus') && e.code !== 'Escape') {
    return;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    const isPlaying = musicContainer.classList.contains('play');
    isPlaying ? pauseSong() : playSong();
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    prevSong();
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    nextSong();
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
    audio.volume = volumeSlider.value / 100;
    localStorage.setItem('volume', volumeSlider.value);
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
    audio.volume = volumeSlider.value / 100;
    localStorage.setItem('volume', volumeSlider.value);
  } else if (e.code === 'Escape') {
    setGameFocus(false);
  }
});

// Event listeners
playBtn.addEventListener('click', () => {
  const isPlaying = musicContainer.classList.contains('play');

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
    initAudioContext();
    drawVisualizer();
  }
});

// Pause visualizer when music ends
audio.addEventListener('pause', stopVisualizer);

// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Time/song update
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar
progressContainer.addEventListener('click', setProgress);

// Song ends
audio.addEventListener('ended', nextSong);

// Time of song
audio.addEventListener('timeupdate',DurTime);

const arcadeTasks = [
  { id: 'warmup', title: 'Prime the phonograph', detail: 'Start one Music-Shooter-X run.' },
  { id: 'stage2', title: 'Reach Sector II', detail: 'Outlast the first wave of brass invaders.' },
  { id: 'combo5', title: 'Five-shot salon trick', detail: 'Chain five enemy defeats without dropping pace.' },
  { id: 'bomb', title: 'Release the powder keg', detail: 'Clear the screen when the music gets unruly.' },
  { id: 'credits', title: 'Fill the coin purse', detail: 'Earn enough credits to commission an upgrade.' },
  { id: 'upgrade', title: 'Visit the workshop', detail: 'Open the pause/menu store and improve your vessel.' },
  { id: 'fullscreen', title: 'Pull the velvet curtain', detail: 'Use Focus Game for the full cabinet view.' },
  { id: 'musiclink', title: 'Tune the ether-dial', detail: 'Switch songs and reload the phonograph drive.' },
  { id: 'timejump', title: 'Rip the timeline open', detail: 'Jump through the time machine during a run.' },
  { id: 'future', title: 'Visit 3026', detail: 'Survive the future-light era.' }
];
tasksReady = true;

function getTaskState() {
  try {
    return JSON.parse(localStorage.getItem('arcadeTaskState')) || {};
  } catch (error) {
    return {};
  }
}

function saveTaskState(taskState) {
  localStorage.setItem('arcadeTaskState', JSON.stringify(taskState));
}

function completeTask(taskId) {
  if (!tasksReady) return;
  const taskState = getTaskState();
  taskState[taskId] = true;
  saveTaskState(taskState);
  renderTasks();
}

function renderTasks() {
  if (!tasksReady || !taskList) return;
  const taskState = getTaskState();
  taskList.innerHTML = arcadeTasks.map(task => {
    const complete = !!taskState[task.id];
    return `
      <button class="task-row${complete ? ' complete' : ''}" type="button" data-task-id="${task.id}">
        <span class="task-check">${complete ? 'OK' : ''}</span>
        <span>
          <strong>${task.title}</strong>
          <small>${task.detail}</small>
        </span>
      </button>
    `;
  }).join('');
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  let entries = [];
  try {
    entries = JSON.parse(localStorage.getItem('shooterLeaderboard')) || [];
  } catch (error) {
    entries = [];
  }

  if (!entries.length) {
    leaderboardList.innerHTML = '<div class="empty-state">No scores yet. Finish a run to claim the board.</div>';
    return;
  }

  leaderboardList.innerHTML = entries.slice(0, 5).map((entry, index) => `
    <div class="leaderboard-row">
      <span class="leaderboard-rank">#${index + 1}</span>
      <strong>${entry.name || 'Anonymous'}</strong>
      <span>${Number(entry.score || 0).toLocaleString()} pts</span>
    </div>
  `).join('');
}

const eraLabels = {
  past: '1888 Past',
  present: '2026 Present',
  future: '3026 Future'
};

const eraDetails = {
  past: {
    effect: 'Brass armor, smoky trails, slower invaders.',
    line: 'The cabinet is opening a brass corridor.'
  },
  present: {
    effect: 'Neon volleys, cleaner timing windows, louder combo feedback.',
    line: 'The tunnel snaps into a neon city frequency.'
  },
  future: {
    effect: 'Faster light-creatures, heavier sync energy, volatile portals.',
    line: 'The drive folds forward into future light.'
  }
};

function showGameToast(text) {
  if (!gameToast) return;
  window.clearTimeout(toastTimer);
  gameToast.textContent = text;
  gameToast.classList.add('show');
  toastTimer = window.setTimeout(() => gameToast.classList.remove('show'), 1800);
}

function playTimeMachineCutscene(era) {
  if (!timeMachineCutscene) return;
  const label = eraLabels[era] || eraLabels.past;
  const detail = eraDetails[era] || eraDetails.past;
  window.clearTimeout(timeCutsceneTimer);
  if (timeCutsceneEra) timeCutsceneEra.textContent = label;
  if (timeCutsceneLine) timeCutsceneLine.textContent = detail.line;
  timeMachineCutscene.classList.remove('hidden', 'warp-play');
  timeMachineCutscene.setAttribute('aria-hidden', 'false');
  void timeMachineCutscene.offsetWidth;
  timeMachineCutscene.classList.add('warp-play');
  document.body.classList.add('time-warping');
  timeCutsceneTimer = window.setTimeout(() => {
    timeMachineCutscene.classList.add('hidden');
    timeMachineCutscene.classList.remove('warp-play');
    timeMachineCutscene.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('time-warping');
  }, 1700);
}

function getArcadeTargetOrigin() {
  return window.location.protocol === 'file:' ? '*' : window.location.origin;
}

function postToArcade(payload) {
  if (!arcadeFrame || !arcadeFrame.contentWindow) return;
  arcadeFrame.contentWindow.postMessage(payload, getArcadeTargetOrigin());
}

function showRedeemPanel(show) {
  if (!redeemPanel) return;
  redeemPanel.classList.toggle('hidden', !show);
  if (show && redeemInput) {
    redeemInput.focus();
    redeemInput.select();
  }
}

function submitRedeemCode() {
  const code = redeemInput ? redeemInput.value.trim() : '';
  if (code !== '676767') {
    if (redeemMessage) redeemMessage.textContent = 'Code not recognized.';
    return;
  }

  localStorage.setItem('musicShooterRedeemCode', code);
  postToArcade({ type: 'redeem-code', code });
  if (redeemMessage) redeemMessage.textContent = 'Admin unlocked for the shooter.';
  if (gameToast) {
    showGameToast('Redeemed: Admin unlocked');
  }
}
function syncArcadeTrack() {
  postToArcade({
    type: 'music-track-change',
    track: songs[songIndex]
  });
  completeTask('musiclink');
}

function setEra(era, options = {}) {
  const nextEra = eraLabels[era] ? era : 'past';
  const previousEra = document.body.dataset.era || 'past';
  const changed = previousEra !== nextEra;
  const cinematic = options.cinematic !== false && changed;

  document.body.dataset.era = nextEra;
  if (timelineReadout) timelineReadout.textContent = eraLabels[nextEra];
  if (eraEffect) eraEffect.textContent = eraDetails[nextEra].effect;
  eraButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.era === nextEra);
  });
  localStorage.setItem('musicShooterEra', nextEra);
  postToArcade({ type: 'era-change', era: nextEra, cinematic });

  if (cinematic) {
    playTimeMachineCutscene(nextEra);
    showGameToast(`Time jump locked: ${eraLabels[nextEra]}`);
    completeTask('timejump');
    if (nextEra === 'future') completeTask('future');
  }
}

function triggerArcadeStart(attempt = 0) {
  postToArcade({ type: 'start-game' });
  try {
    const startButton = arcadeFrame && arcadeFrame.contentDocument && arcadeFrame.contentDocument.getElementById('start-btn');
    if (startButton && !startButton.closest('.hidden')) {
      startButton.click();
      completeTask('warmup');
      return;
    }
  } catch (error) {
    // Message-based startup still works when direct iframe access is blocked.
  }

  if (attempt < 8) {
    window.setTimeout(() => triggerArcadeStart(attempt + 1), 250);
  }
}

function enterGame(options = {}) {
  document.body.classList.add('game-entered');
  triggerArcadeStart();
  if (options.focus) setGameFocus(true);
  else if (arcadeFrame) arcadeFrame.focus();
}

function setGameFocus(enabled) {
  document.body.classList.toggle('game-focus', enabled);
  if (focusGameBtn) {
    focusGameBtn.textContent = enabled ? 'Exit Focus' : 'Focus Game';
    focusGameBtn.setAttribute('aria-pressed', String(enabled));
  }
  if (enabled) {
    document.body.classList.add('game-entered');
    completeTask('fullscreen');
    const fullTarget = arcadePanel || arcadeFrame;
    if (fullTarget && fullTarget.requestFullscreen && !document.fullscreenElement) {
      fullTarget.requestFullscreen().catch(() => {});
    }
    if (arcadeFrame) arcadeFrame.focus();
  } else if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

if (focusGameBtn) {
  focusGameBtn.addEventListener('click', () => {
    setGameFocus(!document.body.classList.contains('game-focus'));
  });
}

if (enterGameBtn) {
  enterGameBtn.addEventListener('click', () => enterGame());
}

if (startFocusBtn) {
  startFocusBtn.addEventListener('click', () => enterGame({ focus: true }));
}

if (redeemOpenBtn) {
  redeemOpenBtn.addEventListener('click', () => showRedeemPanel(true));
}

if (redeemCloseBtn) {
  redeemCloseBtn.addEventListener('click', () => showRedeemPanel(false));
}

if (redeemSubmitBtn) {
  redeemSubmitBtn.addEventListener('click', submitRedeemCode);
}

if (redeemInput) {
  redeemInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitRedeemCode();
    if (event.key === 'Escape') showRedeemPanel(false);
  });
}
eraButtons.forEach(button => {
  button.addEventListener('click', () => setEra(button.dataset.era, { cinematic: true }));
});

window.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('game-focus')) {
    document.body.classList.remove('game-focus');
    if (focusGameBtn) {
      focusGameBtn.textContent = 'Focus Game';
      focusGameBtn.setAttribute('aria-pressed', 'false');
    }
  }
});

if (taskList) {
  taskList.addEventListener('click', event => {
    const taskButton = event.target.closest('[data-task-id]');
    if (!taskButton) return;
    const taskState = getTaskState();
    const taskId = taskButton.dataset.taskId;
    taskState[taskId] = !taskState[taskId];
    saveTaskState(taskState);
    renderTasks();
  });
}

if (resetTasksBtn) {
  resetTasksBtn.addEventListener('click', () => {
    localStorage.removeItem('arcadeTaskState');
    renderTasks();
  });
}

if (refreshBoardBtn) {
  refreshBoardBtn.addEventListener('click', renderLeaderboard);
}

if (arcadeFrame) {
  arcadeFrame.addEventListener('load', () => {
    syncArcadeTrack();
    setEra(localStorage.getItem('musicShooterEra') || document.body.dataset.era || 'past', { cinematic: false });
    if (document.body.classList.contains('game-entered')) triggerArcadeStart();
    renderLeaderboard();
  });
}




setEra(localStorage.getItem('musicShooterEra') || 'past', { cinematic: false });
renderTasks();
renderLeaderboard();
setInterval(renderLeaderboard, 5000);









