let currentLevelIndex = 0;
let inactivityTimer = null;
const game = document.getElementById('game');
const infoPanel = document.getElementById('infoPanel');
const infoContent = document.getElementById('infoContent');
const dashboard = document.getElementById('dashboard');
const dashboardBtn = document.getElementById('dashboardBtn');
const closeInfo = document.getElementById('closeInfo');

// Load progress from localStorage
let progress = JSON.parse(localStorage.getItem('progress')) || {};

function saveProgress() {
    localStorage.setItem('progress', JSON.stringify(progress));
}

function showDashboard() {
    dashboard.innerHTML = '<h2>Progress</h2>';
    levels.forEach((lvl, idx) => {
        const status = progress[lvl.id] ? 'Completed' : 'Locked';
        const div = document.createElement('div');
        div.textContent = `${lvl.name}: ${status}`;
        dashboard.appendChild(div);
    });
    dashboard.classList.remove('hidden');
}

dashboardBtn.addEventListener('click', () => {
    if (dashboard.classList.contains('hidden')) {
        showDashboard();
    } else {
        dashboard.classList.add('hidden');
    }
});

closeInfo.addEventListener('click', () => {
    infoPanel.classList.add('hidden');
});

function loadLevel(index) {
    currentLevelIndex = index;
    game.innerHTML = '';
    dashboard.classList.add('hidden');
    const level = levels[index];

    level.pieces.forEach(piece => {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'piece';
        pieceEl.textContent = piece.label;
        pieceEl.draggable = true;
        pieceEl.id = piece.id;
        pieceEl.addEventListener('dragstart', () => startDrag(pieceEl));
        pieceEl.addEventListener('click', () => selectPiece(pieceEl));
        game.appendChild(pieceEl);

        const zone = document.createElement('div');
        zone.className = 'dropzone';
        zone.dataset.piece = piece.id;
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', e => onDrop(e, pieceEl, zone, piece.info));
        game.appendChild(zone);
    });
}

function selectPiece(el) {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => showHint(el.id), 5000);
}

function showHint(pieceId) {
    const zone = [...document.querySelectorAll('.dropzone')].find(z => z.dataset.piece === pieceId);
    if (zone) {
        zone.classList.add('hint');
        setTimeout(() => zone.classList.remove('hint'), 2000);
    }
}

function startDrag(el) {
    el.classList.remove('incorrect', 'correct');
    clearTimeout(inactivityTimer);
}

function onDrop(event, pieceEl, zone, info) {
    event.preventDefault();
    if (zone.dataset.piece === pieceEl.id) {
        zone.appendChild(pieceEl);
        pieceEl.classList.add('correct');
        pieceEl.draggable = false;
        checkCompletion(info);
    } else {
        pieceEl.classList.add('incorrect');
    }
}

function checkCompletion(info) {
    const remaining = document.querySelectorAll('.piece[draggable="true"]');
    if (remaining.length === 0) {
        const level = levels[currentLevelIndex];
        progress[level.id] = true;
        saveProgress();
        infoContent.textContent = level.pieces.map(p => p.info).join('\n');
        infoPanel.classList.remove('hidden');
        const nextIndex = currentLevelIndex + 1;
        if (nextIndex < levels.length) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next Level';
            nextBtn.addEventListener('click', () => loadLevel(nextIndex));
            infoPanel.appendChild(nextBtn);
        }
    }
}

window.addEventListener('load', () => {
    const firstUnlocked = levels.findIndex(lvl => !progress[lvl.id]);
    loadLevel(firstUnlocked === -1 ? 0 : firstUnlocked);
});
