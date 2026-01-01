const lyrics = [
    "Que se quede el infinito sin estrellas",
    "O que pierda el ancho mar su inmensidad",
    "Pero el negro de tus ojos que no muera",
    "Y el canela de tu piel se quede igual",
    "",
    "Si perdiera el arcoíris su belleza",
    "Y las flores su perfume y su color",
    "No sería tan inmensa mi tristeza",
    "Como aquella de quedarme sin tu amor",
    "",
    "Me importas tú, y tú, y tú",
    "Y solamente tú, y tú, y tú",
    "Me importas tú, y tú, y tú",
    "Y nadie más que tú",
    "",
    "Me importas tú, y tú, y tú",
    "Y solamente tú, y tú, y tú",
    "Me importas tú, y tú, y tú",
    "Y nadie más que tú"
];

const music = document.getElementById('music');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const lyricsContainer = document.getElementById('lyrics-container');
const currentTimeDisplay = document.getElementById('current-time');
const output = document.getElementById('output');
const jsonOutput = document.getElementById('json-output');
const copyBtn = document.getElementById('copy-btn');

let currentIndex = 0;
let syncedLyrics = [];
let isPlaying = false;
let startTime = 0;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderLyrics() {
    lyricsContainer.innerHTML = '';
    lyrics.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';

        if (index === currentIndex) {
            div.classList.add('current');
        } else if (index < currentIndex) {
            div.classList.add('synced');
        }

        const text = document.createElement('span');
        text.textContent = line || '(pausa)';

        const time = document.createElement('span');
        time.className = 'time';
        if (syncedLyrics[index] !== undefined) {
            time.textContent = formatTime(syncedLyrics[index]);
        }

        div.appendChild(text);
        div.appendChild(time);
        lyricsContainer.appendChild(div);
    });
}

function updateTime() {
    if (isPlaying) {
        const currentTime = music.currentTime;
        currentTimeDisplay.textContent = formatTime(currentTime);
        requestAnimationFrame(updateTime);
    }
}

function syncCurrentLine() {
    if (currentIndex < lyrics.length) {
        const currentTime = music.currentTime;
        syncedLyrics[currentIndex] = currentTime;
        currentIndex++;
        renderLyrics();

        if (currentIndex >= lyrics.length) {
            finishSync();
        }
    }
}

function finishSync() {
    isPlaying = false;
    music.pause();

    const result = lyrics.map((line, index) => ({
        text: line,
        time: syncedLyrics[index] || 0
    }));

    jsonOutput.textContent = JSON.stringify(result, null, 2);
    output.style.display = 'block';

    startBtn.textContent = 'Completado';
    startBtn.disabled = true;
}

startBtn.addEventListener('click', () => {
    if (!isPlaying) {
        music.currentTime = 0;
        music.volume = 0.5;
        music.play();
        isPlaying = true;
        startBtn.textContent = 'Reproduciendo...';
        startBtn.disabled = true;
        updateTime();
    }
});

resetBtn.addEventListener('click', () => {
    music.pause();
    music.currentTime = 0;
    isPlaying = false;
    currentIndex = 0;
    syncedLyrics = [];
    startBtn.textContent = 'Iniciar';
    startBtn.disabled = false;
    output.style.display = 'none';
    currentTimeDisplay.textContent = '0:00';
    renderLyrics();
});

document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && isPlaying) {
        e.preventDefault();
        syncCurrentLine();
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonOutput.textContent).then(() => {
        copyBtn.textContent = '✓ Copiado!';
        setTimeout(() => {
            copyBtn.textContent = 'Copiar al Portapapeles';
        }, 2000);
    });
});

renderLyrics();
