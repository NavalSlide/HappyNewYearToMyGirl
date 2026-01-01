const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const particles = [];
const hearts = [];
const floatingHearts = [];
let fireworkCount = 0;
let canLaunchNext = true;
let show2026Started = false;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEnd = isMobile && (navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 2);

const MAX_PARTICLES = isLowEnd ? 500 : 1500;
const MAX_HEARTS = isLowEnd ? 1 : 3;
const STAR_COUNT = isLowEnd ? 100 : 150;

let lastUsedImages = [];

// MODO DEBUG: cambia a true para solo ver corazones
const DEBUG_MODE = false;

// AJUSTES DE POSICIÓN PARA CADA IMAGEN (puedes cambiar estos valores)
const imagePositions = [
    { offsetX: 10, offsetY: 35 },  // Img1.jpg
    { offsetX: -20, offsetY: 42 },  // Img2.jpg
    { offsetX: 27, offsetY: 47 },  // img3.jpg
    { offsetX: 0, offsetY: 45 }   // img4.jpg
];

const images = [];
const imageFiles = ['img/Img1.jpg', 'img/Img2.jpg', 'img/img3.jpg', 'img/img4.jpg'];
imageFiles.forEach(src => {
    const img = new Image();
    img.src = src;
    images.push(img);
});

class Particle {
    constructor(x, y, color, velocity, isBig = false, isStatic = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.gravity = isStatic ? 0 : 0.05;
        this.isBig = isBig;
        this.isStatic = isStatic;
    }

    draw() {
        if (this.alpha <= 0) return;

        if (particles.length > MAX_PARTICLES) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        if (!isLowEnd) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.isStatic ? 20 : 5;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.isStatic ? 5 : (this.isBig ? 4 : 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (!this.isStatic) {
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.isBig ? 0.003 : 0.01;
        } else {
            this.alpha -= 0.0015;
        }
    }
}

class MiniHeart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.size = Math.random() * 15 + 10;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.gravity = 0.05;
    }

    draw() {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.size / 100, this.size / 100);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
            if (i === 0) ctx.moveTo(x * 5, y * 5);
            else ctx.lineTo(x * 5, y * 5);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff69b4';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        this.alpha -= 0.008;
    }
}

class FloatingHeart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;
        this.size = Math.random() * 30 + 20;
        this.speed = Math.random() * 1 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.sway = Math.random() * 2 - 1;
        this.swayOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x + Math.sin(this.swayOffset) * 20, this.y);
        ctx.scale(this.size / 100, this.size / 100);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
            if (i === 0) ctx.moveTo(x * 5, y * 5);
            else ctx.lineTo(x * 5, y * 5);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff69b4';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.y -= this.speed;
        this.swayOffset += 0.02;
        if (this.y < -100) {
            this.y = canvas.height + 50;
            this.x = Math.random() * canvas.width;
        }
    }
}

class Heart {
    constructor(x, y, image, imageIndex) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.imageIndex = imageIndex;
        this.alpha = 0;
        this.scale = 0;
        this.maxScale = Math.min(canvas.width / 4, 150);
        this.growing = true;

        this.offsetX = imagePositions[imageIndex].offsetX;
        this.offsetY = imagePositions[imageIndex].offsetY;
    }

    draw() {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale / this.maxScale, this.scale / this.maxScale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
            if (i === 0) ctx.moveTo(x * 5, y * 5);
            else ctx.lineTo(x * 5, y * 5);
        }
        ctx.closePath();
        ctx.clip();

        if (this.image.complete) {
            const imgSize = 200;
            ctx.drawImage(this.image, -imgSize / 2 + this.offsetX, -imgSize / 2 + this.offsetY, imgSize, imgSize);
        }

        ctx.restore();

        ctx.save();
        ctx.globalAlpha = this.alpha * 0.2;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale / this.maxScale, this.scale / this.maxScale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
            if (i === 0) ctx.moveTo(x * 5, y * 5);
            else ctx.lineTo(x * 5, y * 5);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff69b4';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = this.alpha * 0.08;
        ctx.translate(this.x, this.y);
        ctx.scale((this.scale / this.maxScale) * 1.2, (this.scale / this.maxScale) * 1.2);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
            if (i === 0) ctx.moveTo(x * 5, y * 5);
            else ctx.lineTo(x * 5, y * 5);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff1493';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (this.growing) {
            if (this.scale < this.maxScale) {
                this.scale += 3;
                this.alpha = Math.min(1, this.alpha + 0.04);
            } else {
                this.growing = false;
            }
        } else {
            this.alpha -= 0.005;
        }
    }
}

class Rocket {
    constructor(x, targetY, isBig = false, isHeart = false, imageIndex = 0) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.speed = isBig ? 3 : (isHeart ? 3.5 : 5);
        this.color = isHeart ? '#ff69b4' : '#fff';
        this.exploded = false;
        this.isBig = isBig;
        this.isHeart = isHeart;
        this.imageIndex = imageIndex;
        this.soundPlayed = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 1, this.y, 2, 10);
    }

    update() {
        if (this.y > this.targetY) {
            this.y -= this.speed;

            if (!this.soundPlayed && this.y < canvas.height - 50) {
                playLaunchSound();
                this.soundPlayed = true;
            }
        } else if (!this.exploded) {
            this.explode();
            this.exploded = true;
        }
    }

    explode() {
        if (this.isBig) {
            play2026Sound();
            this.createNumberExplosion();
        } else if (this.isHeart) {
            playHeartSound();
            this.createHeartExplosion();
        } else {
            playExplosionSound();
            this.createExplosion();
        }
    }

    createExplosion() {
        const explosionType = Math.floor(Math.random() * 5);

        switch (explosionType) {
            case 0:
                this.createCircleExplosion();
                break;
            case 1:
                this.createRingExplosion();
                break;
            case 2:
                this.createWillowExplosion();
                break;
            case 3:
                this.createChrysanthemumExplosion();
                break;
            case 4:
                this.createPalmExplosion();
                break;
        }
    }

    createCircleExplosion() {
        const colors = ['#ff0844', '#ffb700', '#00ff88', '#00b8ff', '#ff00ff'];
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = {
                x: Math.cos(angle) * (Math.random() * 2 + 4),
                y: Math.sin(angle) * (Math.random() * 2 + 4)
            };
            particles.push(new Particle(this.x, this.y, mainColor, velocity));
        }
    }

    createRingExplosion() {
        const colors = ['#ff0844', '#ffb700', '#00ff88', '#00b8ff', '#ff00ff'];
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        const particleCount = 80;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 5;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            particles.push(new Particle(this.x, this.y, mainColor, velocity));
        }
    }

    createWillowExplosion() {
        const colors = ['#ffd700', '#ffed4e', '#fff44f'];
        const particleCount = 120;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 2
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(this.x, this.y, color, velocity));
        }
    }

    createChrysanthemumExplosion() {
        const colors = ['#ff1493', '#ff69b4', '#ff85c1', '#ffc0cb'];
        const particleCount = 150;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 4 + 3;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(this.x, this.y, color, velocity, true));
        }
    }

    createPalmExplosion() {
        const colors = ['#00ff88', '#00ffff', '#00ff00'];
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 3;
            const velocity = {
                x: Math.cos(angle) * speed * 0.3,
                y: -Math.abs(Math.sin(angle) * speed)
            };
            particles.push(new Particle(this.x, this.y, mainColor, velocity));
        }
    }

    createHeartExplosion() {
        if (hearts.length >= MAX_HEARTS) return;

        const colors = ['#ff69b4', '#ff1493', '#ff85c1', '#ffc0cb'];
        const particleCount = isLowEnd ? 80 : 120;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = {
                x: Math.cos(angle) * (Math.random() * 4 + 3),
                y: Math.sin(angle) * (Math.random() * 4 + 3)
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(this.x, this.y, color, velocity, true));
        }

        const miniHeartCount = isLowEnd ? 15 : 20;
        for (let i = 0; i < miniHeartCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 40;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            particles.push(new MiniHeart(x, y));
        }

        hearts.push(new Heart(this.x, this.y, images[this.imageIndex], this.imageIndex));
        canLaunchNext = false;
    }

    createNumberExplosion() {
        const colors = ['#ffd700', '#ffed4e', '#fff44f', '#ffaa00', '#ff6b00'];

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const scale = Math.min(canvas.width / 300, canvas.height / 200);

        const numberPatterns = [
            [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [1, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
            [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [3, 2], [0, 3], [3, 3], [0, 4], [3, 4], [0, 5], [3, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
            [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [1, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
            [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [0, 4], [3, 4], [0, 5], [3, 5], [0, 6], [1, 6], [2, 6], [3, 6]]
        ];

        const spacing = 60 * scale;
        const dotSize = 15 * scale;
        const startX = centerX - (numberPatterns.length * spacing * 1.3) / 2;

        numberPatterns.forEach((pattern, digitIndex) => {
            const digitX = startX + digitIndex * spacing * 1.3;
            pattern.forEach(([col, row]) => {
                const x = digitX + col * dotSize;
                const y = centerY - 50 * scale + row * dotSize;
                const color = colors[Math.floor(Math.random() * colors.length)];
                particles.push(new Particle(x, y, color, { x: 0, y: 0 }, false, true));
            });
        });

        const explosionParticles = isLowEnd ? 250 : 400;
        for (let i = 0; i < explosionParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * (Math.random() * 6 + 4),
                y: Math.sin(angle) * (Math.random() * 6 + 4)
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(centerX, centerY, color, velocity, true));
        }

        show2026Started = true;
        const floatingCount = isLowEnd ? 10 : 15;
        for (let i = 0; i < floatingCount; i++) {
            floatingHearts.push(new FloatingHeart());
        }
    }
}

const rockets = [];
const numberParticles = [];
let numberCreated = false;

function launchFirework(isBig = false, isHeart = false, imageIndex = 0) {
    const x = Math.random() * (canvas.width - 100) + 50;
    const targetY = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
    rockets.push(new Rocket(x, targetY, isBig, isHeart, imageIndex));

    if (!isHeart) {
        setTimeout(() => {
            playLaunchSound();
        }, 100);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rockets.forEach((rocket, index) => {
        rocket.update();
        if (!rocket.exploded) {
            rocket.draw();
        }

        if (rocket.isBig && rocket.exploded && !numberCreated) {
            numberCreated = true;
            const colors = ['#ffd700', '#ffed4e', '#fff44f', '#ffaa00', '#ff6b00'];
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scale = Math.min(canvas.width / 300, canvas.height / 200);

            const numberPatterns = [
                [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [1, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
                [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1], [0, 2], [3, 2], [0, 3], [3, 3], [0, 4], [3, 4], [0, 5], [3, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
                [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [1, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6]],
                [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [0, 4], [3, 4], [0, 5], [3, 5], [0, 6], [1, 6], [2, 6], [3, 6]]
            ];

            const spacing = 60 * scale;
            const dotSize = 15 * scale;
            const startX = centerX - (numberPatterns.length * spacing * 1.3) / 2;

            numberPatterns.forEach((pattern, digitIndex) => {
                const digitX = startX + digitIndex * spacing * 1.3;
                pattern.forEach(([col, row]) => {
                    const x = digitX + col * dotSize;
                    const y = centerY - 50 * scale + row * dotSize;
                    numberParticles.push({ x, y });
                });
            });
        }

        if (rocket.exploded && rocket.y < 0 && !rocket.isBig) {
            rockets.splice(index, 1);
        }
    });

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    hearts.forEach((heart, index) => {
        heart.update();
        heart.draw();
        if (heart.alpha <= 0) {
            hearts.splice(index, 1);
            if (hearts.length === 0) {
                canLaunchNext = true;
            }
        }
    });

    floatingHearts.forEach(heart => {
        heart.update();
        heart.draw();
    });

    if (numberCreated && Math.random() < 0.3) {
        const colors = ['#ffd700', '#ffed4e', '#fff44f', '#ffaa00', '#ff6b00'];
        const randomDot = numberParticles[Math.floor(Math.random() * numberParticles.length)];
        if (randomDot) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(randomDot.x, randomDot.y, color, velocity, false, false));
        }
    }

    requestAnimationFrame(animate);
}

const fireworkSequence = [0, 1, 2, 3, 4, 5, 6, 7];

function shuffleHearts() {
    const sequence = [false];
    let heartCount = 0;
    let normalCount = 1;

    while (sequence.length < 8) {
        if (heartCount < 4 && normalCount < 4) {
            const lastWasHeart = sequence[sequence.length - 1];
            if (lastWasHeart) {
                sequence.push(false);
                normalCount++;
            } else {
                const useHeart = Math.random() > 0.5;
                sequence.push(useHeart);
                if (useHeart) heartCount++;
                else normalCount++;
            }
        } else if (heartCount < 4) {
            const lastWasHeart = sequence[sequence.length - 1];
            if (lastWasHeart) {
                sequence.push(false);
                normalCount++;
            } else {
                sequence.push(true);
                heartCount++;
            }
        } else {
            sequence.push(false);
            normalCount++;
        }
    }

    return sequence;
}

const heartSequence = shuffleHearts();

let heartIndex = 0;
let fireworkQueue = [];
let started = false;

const syncedLyrics = [
    { text: "Que se quede el infinito sin estrellas", time: 17.571702 },
    { text: "O que pierda el ancho mar su inmensidad", time: 21.451225 },
    { text: "Pero el negro de tus ojos que no muera", time: 25.587146 },
    { text: "Y el canela de tu piel se quede igual", time: 29.955353 },
    { text: "", time: 33.339618 },
    { text: "Si perdiera el arcoíris su belleza", time: 34.051212 },
    { text: "Y las flores su perfume y su color", time: 38.019383 },
    { text: "No sería tan inmensa mi tristeza", time: 42.043253 },
    { text: "Como aquella de quedarme sin tu amor", time: 46.595226 },
    { text: "", time: 48.771313 },
    { text: "Me importas tú, y tú, y tú", time: 49.250901 },
    { text: "Y solamente tú, y tú, y tú", time: 53.795394 },
    { text: "Me importas tú, y tú, y tú", time: 57.83507 },
    { text: "Y nadie más que tú", time: 61.755202 },
    { text: "", time: 63.635075 },
    { text: "Me importas tú, y tú, y tú", time: 66.315307 },
    { text: "Y solamente tú, y tú, y tú", time: 70.091061 },
    { text: "Me importas tú, y tú, y tú", time: 73.931094 },
    { text: "Y nadie más que tú", time: 78.203314 }
];

let currentLyricIndex = 0;

function highlightTu(text) {
    return text.replace(/tú/gi, '<span class="highlight">tú</span>');
}

function updateLyrics() {
    if (!started) return;

    const currentTime = music.currentTime;

    if (currentLyricIndex < syncedLyrics.length) {
        const currentLyric = syncedLyrics[currentLyricIndex];

        if (currentTime >= currentLyric.time) {
            if (currentLyric.text) {
                lyricsDisplay.innerHTML = highlightTu(currentLyric.text);
                lyricsDisplay.classList.add('show');
            } else {
                lyricsDisplay.classList.remove('show');
            }

            currentLyricIndex++;
        }
    }

    if (currentTime >= 78.5 && lyricsDisplay.classList.contains('show')) {
        lyricsDisplay.classList.remove('show');
    }

    requestAnimationFrame(updateLyrics);
}

const music = document.getElementById('background-music');
const introScreen = document.getElementById('intro-screen');
const startBtn = document.getElementById('start-btn');
const lyricsDisplay = document.getElementById('lyrics-display');
const replayScreen = document.getElementById('replay-screen');
const replayBtn = document.getElementById('replay-btn');

const initialVolume = isMobile ? 0.3 : 0.5;
const targetVolume = 0.5;

let volumeFadeInterval = null;

function fadeInVolume() {
    music.volume = initialVolume;
    let currentVol = initialVolume;

    volumeFadeInterval = setInterval(() => {
        if (currentVol < targetVolume) {
            currentVol += 0.02;
            music.volume = Math.min(currentVol, targetVolume);
        } else {
            clearInterval(volumeFadeInterval);
        }
    }, 100);
}

music.addEventListener('ended', () => {
    setTimeout(() => {
        replayScreen.style.display = 'flex';
    }, 2000);
});

replayBtn.addEventListener('click', () => {
    location.reload();
});

startBtn.addEventListener('click', () => {
    introScreen.classList.add('hidden');

    fadeInVolume();

    music.play().then(() => {
        console.log('Música iniciada correctamente');
    }).catch(error => {
        console.error('Error al reproducir música:', error);
        alert('No se pudo cargar la música. Verifica que el archivo music.mp3 existe.');
    });

    audioContext.resume();
    started = true;
    currentLyricIndex = 0;
    startFireworks();
    updateLyrics();
});

function startFireworks() {
    if (DEBUG_MODE) {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                launchFirework(false, true, i);
            }, 1000 + i * 3000);
        }
    } else {
        const totalDuration = 77000;
        const fireworkInterval = 2500;
        const totalFireworks = Math.floor(totalDuration / fireworkInterval);

        const firstLyricTime = 17571;
        const meImportasStart = 49250;
        const meImportasEnd = 78203;
        const heartsStartIndex = Math.ceil(firstLyricTime / fireworkInterval);

        for (let i = 0; i < totalFireworks; i++) {
            setTimeout(() => {
                const currentTime = i * fireworkInterval;

                if (i >= heartsStartIndex) {
                    let heartChance = 0.15;

                    if (currentTime >= meImportasStart && currentTime <= meImportasEnd) {
                        heartChance = 0.4;
                    }

                    if (Math.random() < heartChance && hearts.length < MAX_HEARTS) {
                        let availableImages = [0, 1, 2, 3].filter(img => !lastUsedImages.includes(img));

                        if (availableImages.length === 0) {
                            lastUsedImages = [];
                            availableImages = [0, 1, 2, 3];
                        }

                        const randomImageIndex = availableImages[Math.floor(Math.random() * availableImages.length)];
                        lastUsedImages.push(randomImageIndex);

                        if (lastUsedImages.length > 2) {
                            lastUsedImages.shift();
                        }

                        launchFirework(false, true, randomImageIndex);
                    } else {
                        launchFirework(false, false);
                    }
                } else {
                    launchFirework(false, false);
                }
            }, i * fireworkInterval);
        }

        setTimeout(() => {
            launchFirework(true);
        }, totalDuration + 2000);
    }
}

animate();
