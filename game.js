const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');
const emailForm = document.getElementById('emailForm');
const confirmationMsg = document.getElementById('confirmation-msg');

let width, height, cellSize = 8; // Smaller cells for more "grid" feel
let player, enemy, walls = [], gameOver = false;
let gameSpeed = 100; // Slower refresh rate (in ms)

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Starting positions aligned to grid
    player = { x: Math.floor(20/cellSize)*cellSize, y: Math.floor((height/2)/cellSize)*cellSize, dx: 1, dy: 0, color: '#00f2ff', trail: [] };
    enemy = { x: Math.floor((width-40)/cellSize)*cellSize, y: Math.floor((height/2)/cellSize)*cellSize, dx: -1, dy: 0, color: '#ff003c', trail: [] };
    
    walls = [];
    gameOver = false;
    modal.style.display = 'none';
}

function draw() {
    if (gameOver) return;

    // Draw Charcoal Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Update Positions
    [player, enemy].forEach(p => {
        p.trail.push({x: p.x, y: p.y});
        walls.push(`${p.x},${p.y}`);
        p.x += p.dx * cellSize;
        p.y += p.dy * cellSize;
    });

    // Collision Detection
    if (checkCollision(player)) endGame("You've Been Proxied!", "#ff003c");
    else if (checkCollision(enemy)) endGame("Proxy Established!", "#00f2ff");
    else if (player.x < 0 || player.x > width || player.y < 0 || player.y > height) endGame("You've Been Proxied!", "#ff003c");

    // Smarter AI (Avoids walls)
    if (Math.random() < 0.1) {
        const turns = [{dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: 1, dy: 0}, {dx: -1, dy: 0}];
        const validTurns = turns.filter(t => !walls.includes(`${enemy.x + t.dx*cellSize},${enemy.y + t.dy*cellSize}`));
        if (validTurns.length > 0) {
            const pick = validTurns[Math.floor(Math.random() * validTurns.length)];
            enemy.dx = pick.dx; enemy.dy = pick.dy;
        }
    }

    // Render Trails
    [player, enemy].forEach(p => {
        ctx.shadowBlur = 15; ctx.shadowColor = p.color;
        ctx.strokeStyle = p.color; ctx.lineWidth = 3;
        ctx.beginPath();
        p.trail.forEach((pos, i) => {
            if (i === 0) ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        });
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    });

    setTimeout(() => {
        requestAnimationFrame(draw);
    }, gameSpeed);
}

function checkCollision(p) {
    return walls.includes(`${p.x},${p.y}`);
}

function endGame(msg, color) {
    gameOver = true;
    resultText.innerText = msg;
    resultText.style.color = color;
    document.getElementById('instructions').style.display = 'none';
    setTimeout(() => { modal.style.display = 'block'; }, 800);
}

// Form Handling
emailForm.onsubmit = (e) => {
    e.preventDefault();
    // Hide form elements
    document.getElementById('emailInput').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('sub-text').style.display = 'none';
    // Show confirmation
    confirmationMsg.style.display = 'block';
};

// Controls
window.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowUp' && player.dy === 0) { player.dx = 0; player.dy = -1; }
    if (e.key === 'ArrowDown' && player.dy === 0) { player.dx = 0; player.dy = 1; }
    if (e.key === 'ArrowLeft' && player.dx === 0) { player.dx = -1; player.dy = 0; }
    if (e.key === 'ArrowRight' && player.dx === 0) { player.dx = 1; player.dy = 0; }
});

// Mobile Controls
const setDir = (x, y) => { if (!gameOver) { player.dx = x; player.dy = y; } };
document.getElementById('up').onclick = () => { if (player.dy === 0) setDir(0, -1); };
document.getElementById('down').onclick = () => { if (player.dy === 0) setDir(0, 1); };
document.getElementById('left').onclick = () => { if (player.dx === 0) setDir(-1, 0); };
document.getElementById('right').onclick = () => { if (player.dx === 0) setDir(1, 0); };

window.onresize = init;
init();
draw();
init();
draw();
