const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const instrOverlay = document.getElementById('instructions');

const CONFIG = {
    cellSize: 10,
    speed: 100, // Movement every 100ms
    colors: {
        bg: '#0a0a0a',
        player: '#00f2ff',
        enemy: '#ff003c'
    }
};

let lastTime = 0;
let walls = new Set();
let gameActive = false;
let gameOver = false;

let p1 = { x: 0, y: 0, dx: 1, dy: 0, color: CONFIG.colors.player };
let p2 = { x: 0, y: 0, dx: -1, dy: 0, color: CONFIG.colors.enemy };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Grid-aligned start positions
    p1.x = Math.floor(50 / CONFIG.cellSize) * CONFIG.cellSize;
    p1.y = Math.floor((canvas.height / 2) / CONFIG.cellSize) * CONFIG.cellSize;
    p1.dx = 1; p1.dy = 0;

    p2.x = Math.floor((canvas.width - 50) / CONFIG.cellSize) * CONFIG.cellSize;
    p2.y = Math.floor((canvas.height / 2) / CONFIG.cellSize) * CONFIG.cellSize;
    p2.dx = -1; p2.dy = 0;

    walls.clear();
    gameOver = false;
    gameActive = false;
    modal.style.display = 'none';
    
    instrOverlay.style.display = 'block';
    instrOverlay.innerHTML = '<span class="desktop-instr">PRESS ANY KEY TO START GRID</span>';
    
    draw();
}

function draw() {
    // TOTAL CLEAR - Stops the red bleed
    ctx.fillStyle = CONFIG.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Static Walls
    walls.forEach(wall => {
        const [x, y, color] = wall.split(',');
        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fillRect(parseInt(x), parseInt(y), CONFIG.cellSize - 1, CONFIG.cellSize - 1);
    });

    // Draw Heads
    [p1, p2].forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, CONFIG.cellSize - 1, CONFIG.cellSize - 1);
    });
}

function update(time) {
    if (gameOver || !gameActive) return;

    if (time - lastTime > CONFIG.speed) {
        // Record current positions as walls
        walls.add(`${p1.x},${p1.y},${p1.color}`);
        walls.add(`${p2.x},${p2.y},${p2.color}`);

        // Advance
        p1.x += p1.dx * CONFIG.cellSize;
        p1.y += p1.dy * CONFIG.cellSize;
        p2.x += p2.dx * CONFIG.cellSize;
        p2.y += p2.dy * CONFIG.cellSize;

        // Collision Logic
        if (isHit(p1)) end("You've Been Proxied!", CONFIG.colors.enemy);
        else if (isHit(p2)) end("Proxy Established!", CONFIG.colors.player);
        
        // Simple AI: Don't hit walls
        moveAI();

        lastTime = time;
        draw();
    }
    requestAnimationFrame(update);
}

function isHit(p) {
    if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) return true;
    return Array.from(walls).some(w => w.startsWith(`${p.x},${p.y}`));
}

function moveAI() {
    if (Math.random() < 0.1) {
        const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
        const safe = dirs.filter(d => {
            const nx = p2.x + d.x * CONFIG.cellSize;
            const ny = p2.y + d.y * CONFIG.cellSize;
            return nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height && !Array.from(walls).some(w => w.startsWith(`${nx},${ny}`));
        });
        if (safe.length > 0) {
            const move = safe[Math.floor(Math.random() * safe.length)];
            p2.dx = move.x; p2.dy = move.y;
        }
    }
}

function end(msg, color) {
    gameOver = true;
    resultText.innerText = msg;
    resultText.style.color = color;
    setTimeout(() => modal.style.display = 'block', 500);
}

// Global Controls
window.addEventListener('keydown', e => {
    if (!gameActive && !gameOver) { gameActive = true; instrOverlay.style.display = 'none'; update(); }
    
    if (e.key === 'ArrowUp' && p1.dy === 0) { p1.dx = 0; p1.dy = -1; }
    if (e.key === 'ArrowDown' && p1.dy === 0) { p1.dx = 0; p1.dy = 1; }
    if (e.key === 'ArrowLeft' && p1.dx === 0) { p1.dx = -1; p1.dy = 0; }
    if (e.key === 'ArrowRight' && p1.dx === 0) { p1.dx = 1; p1.dy = 0; }
});

// Mobile Controls
const ctrl = (x, y) => { 
    if (!gameActive && !gameOver) { gameActive = true; instrOverlay.style.display = 'none'; update(); }
    if ((x !== 0 && p1.dx === 0) || (y !== 0 && p1.dy === 0)) { p1.dx = x; p1.dy = y; }
};
document.getElementById('up').onclick = () => ctrl(0, -1);
document.getElementById('down').onclick = () => ctrl(0, 1);
document.getElementById('left').onclick = () => ctrl(-1, 0);
document.getElementById('right').onclick = () => ctrl(1, 0);

window.onresize = init;
init();
