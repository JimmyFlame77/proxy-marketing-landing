const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const instrOverlay = document.getElementById('instructions');

const CONFIG = {
    cellSize: 10,
    speed: 70, // FASTER: 70ms for high-intensity movement
    colors: { bg: '#0a0a0a', p1: '#00f2ff', p2: '#ff003c' }
};

let lastTime = 0, walls = new Set(), gameActive = false, gameOver = false;
let p1 = { x: 0, y: 0, dx: 1, dy: 0, color: CONFIG.colors.p1 };
let p2 = { x: 0, y: 0, dx: -1, dy: 0, color: CONFIG.colors.p2 };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Grid-aligned starts
    p1.x = Math.floor(100 / CONFIG.cellSize) * CONFIG.cellSize;
    p1.y = Math.floor((canvas.height / 2) / CONFIG.cellSize) * CONFIG.cellSize;
    p1.dx = 1; p1.dy = 0;

    p2.x = Math.floor((canvas.width - 100) / CONFIG.cellSize) * CONFIG.cellSize;
    p2.y = Math.floor((canvas.height / 2) / CONFIG.cellSize) * CONFIG.cellSize;
    p2.dx = -1; p2.dy = 0;

    walls.clear();
    gameOver = false;
    gameActive = false;
    modal.style.display = 'none';
    instrOverlay.style.display = 'block'; 
    draw();
}

function draw() {
    ctx.fillStyle = CONFIG.colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    walls.forEach(wall => {
        const [x, y, color] = wall.split(',');
        ctx.shadowBlur = 5; ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillRect(parseInt(x), parseInt(y), CONFIG.cellSize - 1, CONFIG.cellSize - 1);
    });

    [p1, p2].forEach(p => {
        ctx.shadowBlur = 20; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, CONFIG.cellSize - 1, CONFIG.cellSize - 1);
    });
}

function update(time) {
    if (gameOver || !gameActive) return;

    if (time - lastTime > CONFIG.speed) {
        walls.add(`${p1.x},${p1.y},${p1.color}`);
        walls.add(`${p2.x},${p2.y},${p2.color}`);

        p1.x += p1.dx * CONFIG.cellSize;
        p1.y += p1.dy * CONFIG.cellSize;
        p2.x += p2.dx * CONFIG.cellSize;
        p2.y += p2.dy * CONFIG.cellSize;

        if (isHit(p1)) end("You've Been Proxied!", CONFIG.colors.p2);
        else if (isHit(p2)) end("Proxy Established!", CONFIG.colors.p1);
        
        moveHunterAI();

        lastTime = time;
        draw();
    }
    requestAnimationFrame(update);
}

function isHit(p) {
    if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) return true;
    return Array.from(walls).some(w => w.startsWith(`${p.x},${p.y}`));
}

function moveHunterAI() {
    // 30% chance to recalculate "Attack" path to Player
    if (Math.random() < 0.3) {
        const diffX = p1.x - p2.x;
        const diffY = p1.y - p2.y;
        let newDx = p2.dx, newDy = p2.dy;

        // Try to move toward player on the larger axis
        if (Math.abs(diffX) > Math.abs(diffY)) {
            newDx = diffX > 0 ? 1 : -1; newDy = 0;
        } else {
            newDy = diffY > 0 ? 1 : -1; newDx = 0;
        }

        // Only turn if it's not a 180-degree suicide turn and path is clear
        if ((newDx !== -p2.dx || newDy !== -p2.dy) && !isHit({x: p2.x + newDx*CONFIG.cellSize, y: p2.y + newDy*CONFIG.cellSize})) {
            p2.dx = newDx; p2.dy = newDy;
        }
    }

    // Emergency Avoidance: If current path is a wall, turn anywhere safe
    if (isHit({x: p2.x + p2.dx*CONFIG.cellSize, y: p2.y + p2.dy*CONFIG.cellSize})) {
        const options = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}].filter(d => !isHit({x: p2.x + d.x*CONFIG.cellSize, y: p2.y + d.y*CONFIG.cellSize}));
        if (options.length > 0) {
            const move = options[Math.floor(Math.random() * options.length)];
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
    if (!gameActive && !gameOver && e.key.includes('Arrow')) { 
        gameActive = true; instrOverlay.style.display = 'none'; update(); 
    }
    if (e.key === 'ArrowUp' && p1.dy === 0) { p1.dx = 0; p1.dy = -1; }
    if (e.key === 'ArrowDown' && p1.dy === 0) { p1.dx = 0; p1.dy = 1; }
    if (e.key === 'ArrowLeft' && p1.dx === 0) { p1.dx = -1; p1.dy = 0; }
    if (e.key === 'ArrowRight' && p1.dx === 0) { p1.dx = 1; p1.dy = 0; }
});

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
