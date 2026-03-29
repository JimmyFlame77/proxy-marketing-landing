const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const instrOverlay = document.getElementById('instructions');

// CONFIGURATION
const CELL = 10;
const SPEED = 100; // Movement every 100ms
const BG_COLOR = '#0a0a0a'; // Charcoal Black
const BLUE = '#00f2ff';
const RED = '#ff003c';

let gameActive = false;
let gameOver = false;
let lastUpdate = 0;
let walls = []; // Array of {x, y, color}

let p1 = { x: 0, y: 0, dx: 1, dy: 0, color: BLUE };
let p2 = { x: 0, y: 0, dx: -1, dy: 0, color: RED };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Align starts to the 10px grid
    p1.x = Math.floor(50 / CELL) * CELL;
    p1.y = Math.floor((canvas.height / 2) / CELL) * CELL;
    p1.dx = 1; p1.dy = 0;

    p2.x = Math.floor((canvas.width - 50) / CELL) * CELL;
    p2.y = Math.floor((canvas.height / 2) / CELL) * CELL;
    p2.dx = -1; p2.dy = 0;

    walls = [];
    gameOver = false;
    gameActive = false;
    modal.style.display = 'none';
    instrOverlay.style.display = 'block';
    
    render(); // Draw the first static frame
}

function render() {
    // 1. FORCE CLEAR - This prevents the red smear/background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. DRAW ALL TRAILS
    ctx.shadowBlur = 8;
    walls.forEach(w => {
        ctx.shadowColor = w.color;
        ctx.fillStyle = w.color;
        ctx.fillRect(w.x, w.y, CELL - 1, CELL - 1);
    });

    // 3. DRAW PLAYERS (HEADS)
    [p1, p2].forEach(p => {
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, CELL - 1, CELL - 1);
    });
}

function update(time) {
    if (gameOver || !gameActive) return;

    if (time - lastUpdate > SPEED) {
        // Record trails
        walls.push({ x: p1.x, y: p1.y, color: p1.color });
        walls.push({ x: p2.x, y: p2.y, color: p2.color });

        // Move
        p1.x += p1.dx * CELL;
        p1.y += p1.dy * CELL;
        p2.x += p2.dx * CELL;
        p2.y += p2.dy * CELL;

        // Wall/Self Collision
        if (checkHit(p1)) end("You've Been Proxied!", RED);
        else if (checkHit(p2)) end("Proxy Established!", BLUE);
        
        // Simple AI Logic
        runAI();

        lastUpdate = time;
        render();
    }
    requestAnimationFrame(update);
}

function checkHit(p) {
    // Bounds check
    if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) return true;
    // Trail check
    return walls.some(w => w.x === p.x && w.y === p.y);
}

function runAI() {
    // 10% chance to change direction if path is blocked
    const nextX = p2.x + p2.dx * CELL;
    const nextY = p2.y + p2.dy * CELL;
    
    if (Math.random() < 0.1 || nextX < 0 || nextX >= canvas.width || nextY < 0 || nextY >= canvas.height || walls.some(w => w.x === nextX && w.y === nextY)) {
        const dirs = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}];
        const safe = dirs.filter(d => {
            const nx = p2.x + d.x * CELL;
            const ny = p2.y + d.y * CELL;
            return nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height && !walls.some(w => w.x === nx && w.y === ny);
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
    setTimeout(() => { modal.style.display = 'block'; }, 500);
}

// INPUTS
window.addEventListener('keydown', e => {
    if (!gameActive && !gameOver) { 
        gameActive = true; 
        instrOverlay.style.display = 'none'; 
        update(0); 
    }
    if (e.key === 'ArrowUp' && p1.dy === 0) { p1.dx = 0; p1.dy = -1; }
    if (e.key === 'ArrowDown' && p1.dy === 0) { p1.dx = 0; p1.dy = 1; }
    if (e.key === 'ArrowLeft' && p1.dx === 0) { p1.dx = -1; p1.dy = 0; }
    if (e.key === 'ArrowRight' && p1.dx === 0) { p1.dx = 1; p1.dy = 0; }
});

const handleMobile = (x, y) => {
    if (!gameActive && !gameOver) { gameActive = true; instrOverlay.style.display = 'none'; update(0); }
    if ((x !== 0 && p1.dx === 0) || (y !== 0 && p1.dy === 0)) { p1.dx = x; p1.dy = y; }
};
document.getElementById('up').onclick = () => handleMobile(0, -1);
document.getElementById('down').onclick = () => handleMobile(0, 1);
document.getElementById('left').onclick = () => handleMobile(-1, 0);
document.getElementById('right').onclick = () => handleMobile(1, 0);

window.onresize = init;
init();
