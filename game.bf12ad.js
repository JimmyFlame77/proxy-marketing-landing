const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const instrOverlay = document.getElementById('instructions');
const emailForm = document.getElementById('emailForm');

const CONFIG = {
    cellSize: 10,
    speed: 70, 
    colors: { bg: '#050505', p1: '#00f2ff', p2: '#ff003c' }
};

let lastTime = 0, walls = new Set(), gameActive = false, gameOver = false;
let p1 = { x: 0, y: 0, dx: 1, dy: 0, color: CONFIG.colors.p1 };
let p2 = { x: 0, y: 0, dx: -1, dy: 0, color: CONFIG.colors.p2 };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
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
    instrOverlay.innerHTML = window.innerWidth > 768 ? "PRESS ANY ARROW KEY TO START GRID" : "TAP ANY DIRECTION TO START GRID";
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    walls.forEach(wall => {
        const [x, y, color] = wall.split(',');
        ctx.shadowBlur = 5; ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillRect(parseInt(x), parseInt(y), CONFIG.cellSize - 1, CONFIG.cellSize - 1);
    });
    [p1, p2].forEach(p => {
        ctx.shadowBlur = 15; ctx.shadowColor = p.color;
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
        render();
    }
    requestAnimationFrame(update);
}

function isHit(p) {
    if (p.x < 0 || p.x >= canvas.width || p.y < 0 || p.y >= canvas.height) return true;
    return Array.from(walls).some(w => w.startsWith(`${p.x},${p.y}`));
}

function moveHunterAI() {
    if (Math.random() < 0.4) {
        const diffX = p1.x - p2.x;
        const diffY = p1.y - p2.y;
        let nDx = p2.dx, nDy = p2.dy;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            nDx = diffX > 0 ? 1 : -1; nDy = 0;
        } else {
            nDy = diffY > 0 ? 1 : -1; nDx = 0;
        }

        if ((nDx !== -p2.dx || nDy !== -p2.dy) && !isHit({x: p2.x + nDx*CONFIG.cellSize, y: p2.y + nDy*CONFIG.cellSize})) {
            p2.dx = nDx; p2.dy = nDy;
        }
    }
    if (isHit({x: p2.x + p2.dx * CONFIG.cellSize, y: p2.y + p2.dy * CONFIG.cellSize})) {
        const safe = [{dx:0,dy:1}, {dx:0,dy:-1}, {dx:1,dy:0}, {dx:-1,dy:0}]
            .filter(d => (d.dx !== -p2.dx || d.dy !== -p2.dy))
            .filter(d => !isHit({x: p2.x + d.dx * CONFIG.cellSize, y: p2.y + d.dy * CONFIG.cellSize}));
        if (safe.length > 0) {
            const m = safe[Math.floor(Math.random() * safe.length)];
            p2.dx = m.dx; p2.dy = m.dy;
        }
    }
}

function end(msg, color) {
    gameOver = true;
    resultText.innerText = msg;
    resultText.setAttribute('data-text', msg);
    resultText.style.color = color;
    setTimeout(() => modal.style.display = 'block', 500);
}

window.addEventListener('keydown', e => {
    if (!gameActive && !gameOver && e.key.includes('Arrow')) { 
        gameActive = true; instrOverlay.style.display = 'none'; update(0); 
    }
    if (e.key === 'ArrowUp' && p1.dy === 0) { p1.dx = 0; p1.dy = -1; }
    if (e.key === 'ArrowDown' && p1.dy === 0) { p1.dx = 0; p1.dy = 1; }
    if (e.key === 'ArrowLeft' && p1.dx === 0) { p1.dx = -1; p1.dy = 0; }
    if (e.key === 'ArrowRight' && p1.dx === 0) { p1.dx = 1; p1.dy = 0; }
});

const ctrl = (x, y) => { 
    if (!gameActive && !gameOver) { gameActive = true; instrOverlay.style.display = 'none'; update(0); }
    if ((x !== 0 && p1.dx === 0) || (y !== 0 && p1.dy === 0)) { p1.dx = x; p1.dy = y; }
};

document.getElementById('up').onclick = () => ctrl(0, -1);
document.getElementById('down').onclick = () => ctrl(0, 1);
document.getElementById('left').onclick = () => ctrl(-1, 0);
document.getElementById('right').onclick = () => ctrl(1, 0);

emailForm.onsubmit = (e) => {
    e.preventDefault();
    // Hide all input elements
    document.getElementById('firstName').style.display = 'none';
    document.getElementById('lastName').style.display = 'none';
    document.getElementById('emailInput').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('sub-text').style.display = 'none';
    document.getElementById('legalNotice').style.display = 'none';
    // Show confirmation
    document.getElementById('confirmation-msg').style.display = 'block';
};

window.onresize = init;
init();
