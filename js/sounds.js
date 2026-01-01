const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playLaunchSound() {
    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 0.8;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.8);
    filter.Q.value = 10;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.8);
}

function playExplosionSound() {
    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 1.5;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        output[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3000, now);
    lowpass.frequency.exponentialRampToValueAtTime(200, now + 1);

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 1.5);

    const boom = audioContext.createOscillator();
    const boomGain = audioContext.createGain();

    boom.frequency.setValueAtTime(80, now);
    boom.frequency.exponentialRampToValueAtTime(20, now + 0.3);
    boom.type = 'sine';

    boomGain.gain.setValueAtTime(0.1, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    boom.connect(boomGain);
    boomGain.connect(audioContext.destination);

    boom.start(now);
    boom.stop(now + 0.3);
}

function playHeartSound() {
    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 1.5;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        output[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(4000, now);
    lowpass.frequency.exponentialRampToValueAtTime(200, now + 1);

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 1.5);

    const boom = audioContext.createOscillator();
    const boomGain = audioContext.createGain();

    boom.frequency.setValueAtTime(90, now);
    boom.frequency.exponentialRampToValueAtTime(25, now + 0.3);
    boom.type = 'sine';

    boomGain.gain.setValueAtTime(0.12, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    boom.connect(boomGain);
    boomGain.connect(audioContext.destination);

    boom.start(now);
    boom.stop(now + 0.3);
}

function play2026Sound() {
    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 3;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const decay = Math.pow(1 - (i / bufferSize), 0.5);
        output[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(5000, now);
    lowpass.frequency.exponentialRampToValueAtTime(150, now + 2.5);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 3);

    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 3);

    for (let i = 0; i < 5; i++) {
        const boom = audioContext.createOscillator();
        const boomGain = audioContext.createGain();

        boom.frequency.setValueAtTime(60 - i * 5, now + i * 0.1);
        boom.frequency.exponentialRampToValueAtTime(15, now + i * 0.1 + 0.5);
        boom.type = 'sine';

        boomGain.gain.setValueAtTime(0.12, now + i * 0.1);
        boomGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);

        boom.connect(boomGain);
        boomGain.connect(audioContext.destination);

        boom.start(now + i * 0.1);
        boom.stop(now + i * 0.1 + 0.5);
    }

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const sparkBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
            const sparkOutput = sparkBuffer.getChannelData(0);
            for (let j = 0; j < sparkBuffer.length; j++) {
                sparkOutput[j] = (Math.random() * 2 - 1) * (1 - j / sparkBuffer.length);
            }

            const spark = audioContext.createBufferSource();
            spark.buffer = sparkBuffer;

            const sparkFilter = audioContext.createBiquadFilter();
            sparkFilter.type = 'bandpass';
            sparkFilter.frequency.value = 2000 + Math.random() * 3000;
            sparkFilter.Q.value = 5;

            const sparkGain = audioContext.createGain();
            sparkGain.gain.setValueAtTime(0.03, audioContext.currentTime);
            sparkGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            spark.connect(sparkFilter);
            sparkFilter.connect(sparkGain);
            sparkGain.connect(audioContext.destination);

            spark.start(audioContext.currentTime);
            spark.stop(audioContext.currentTime + 0.2);
        }, i * 60);
    }
}

document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });
