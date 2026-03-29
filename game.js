const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const emailForm = document.getElementById('emailForm');
const confirmationMsg = document.getElementById('confirmation-msg');
const instrOverlay = document.getElementById('instructions');

let width, height, cellSize = 10;
let player, enemy, walls = new Set();
let gameOver = false;
let gameStarted = false;

// CONTROL SETTINGS
const GAME_SPEED = 120; // Higher = Slower. 120ms is a comfortable "Strategy" pace.

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Reset State
    gameOver = false;
    gameStarted = false;
    walls.clear();
    modal.style.display = 'none';
    instrOverlay.style.display = 'block';
    instrOverlay.innerHTML = '<span class="desktop-instr">PRESS ANY KEY OR TAP CONTROLS TO START</span>';

    // Start positions: Player on left, Enemy on right
    player = { 
        x: Math.floor(50 / cellSize) * cellSize, 
        y: Math.floor((height / 2) / cellSize) * cellSize, 
        dx: 1, dy: 0, color: '#00f2ff' 
    };
    enemy = { 
        x: Math.floor((width - 50) / cellSize) * cellSize, 
        y: Math.floor((height / 2) / cellSize) * cellSize, 
        dx: -1, dy: 0, color: '#ff003c' 
    };
    
    // Draw initial frame
    render();
}

function render() {
    // 1. CLEAR SCREEN - This fixes the "Red Screen" bleed
    ctx.fillStyle = '#0a0a0a'; 
    ctx.fillRect(0, 0, width, height);

    // 2. DRAW WALLS
    walls.forEach(wall => {
        const [wx, wy, color] = wall.split(',');
        ctx.fillStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;
        ctx.fillRect(parseInt(wx), parseInt(wy), cellSize - 1, cellSize - 1);
    });

    // 3. DRAW CURRENT HEADS
    [player, enemy].forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, cellSize - 1, cellSize - 1);
    });
}

function update() {
    if (gameOver || !gameStarted) return;

    // Save current positions to walls BEFORE moving
    walls.add(`${player.x},${player.y},${player.color}`);
    walls.add(`${enemy.x},${enemy.y},${enemy.color}`);

    // Move
    player.x += player.dx * cellSize;
    player.y += player.dy * cellSize;
    enemy.x += enemy.dx * cellSize;
    enemy.y += enemy.dy * cellSize;

    // Check Collisions
    if (hitWall(player.x, player.y) || outOfBounds(player)) {
        endGame("You've Been Proxied!", "#ff003c");
    } else if (hitWall(enemy.x, enemy.y) || outOfBounds(enemy)) {
        endGame("Proxy Established!", "#00f2ff");
    }

    // AI Logic: Simple obstacle avoidance
    if (Math.random() < 0.2) {
        const directions = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
        const safe = directions.filter(d => !hitWall(enemy.x + d.x*cellSize, enemy.y + d.y*cellSize));
        if (safe.length > 0) {
            const move = safe[Math.floor(Math.random() * safe.length)];
            enemy.dx = move.x; enemy.dy = move.y;
        }
    }

    render();
    setTimeout(update, GAME_SPEED);
}

function hitWall(x, y) {
    // Check if x,y exists in our wall set (ignoring color)
    return Array.from(walls).some(w => w.startsWith(`${x},${y}`));
}

function outOfBounds(p) {
    return p.x < 0 || p.x >= width || p.y < 0 || p.y >= height;
}

function endGame(msg, color) {
    gameOver = true;
    resultText.innerText = msg;
    resultText.style.color = color;
    setTimeout(() => { modal.style.display = 'block'; }, 500);
}

// INPUT HANDLING
window.addEventListener('keydown', e => {
    if (!gameStarted) { gameStarted = true; update(); return; }
    if (e.key === 'ArrowUp' && player.dy === 0) { player.dx = 0; player.dy = -1; }
    if (e.key === 'ArrowDown' && player.dy === 0) { player.dx = 0; player.dy = 1; }
    if (e.key === 'ArrowLeft' && player.dx === 0) { player.dx = -1; player.dy = 0; }
    if (e.key === 'ArrowRight' && player.dx === 0) { player.dx = 1; player.dy = 0; }
});

// Start via mobile buttons
const mobileStart = () => { if(!gameStarted) { gameStarted = true; update(); } };
document.getElementById('up').onclick = () => { mobileStart(); if(player.dy===0){player.dx=0; player.dy=-1;} };
document.getElementById('down').onclick = () => { mobileStart(); if(player.dy===0){player.dx=0; player.dy=1;} };
document.getElementById('left').onclick = () => { mobileStart(); if(player.dx===0){player.dx=-1; player.dy=0;} };
document.getElementById('right').onclick = () => { mobileStart(); if(player.dx===0){player.dx=1; player.dy=0;} };

emailForm.onsubmit = (e) => {
    e.preventDefault();
    document.getElementById('emailInput').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('sub-text').style.display = 'none';
    confirmationMsg.style.display = 'block';
};

window.onresize = init;
init();
