const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const resultText = document.getElementById('result-text');

let width, height, cellSize = 10;
let player, enemy, walls = [], gameOver = false;

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    player = { x: 100, y: height/2, dx: 1, dy: 0, color: '#00f2ff', trail: [] };
    enemy = { x: width - 100, y: height/2, dx: -1, dy: 0, color: '#ff003c', trail: [] };
    walls = [];
    gameOver = false;
    modal.style.display = 'none';
}

function draw() {
    if (gameOver) return;

    // Subtle Grid
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Update Positions
    [player, enemy].forEach(p => {
        p.trail.push({x: p.x, y: p.y});
        walls.push(`${p.x},${p.y}`);
        p.x += p.dx * cellSize;
        p.y += p.dy * cellSize;
    });

    // Collision Logic
    if (checkCollision(player)) endGame("You've Been Proxied!", "#ff003c");
    else if (checkCollision(enemy)) endGame("Proxy Established!", "#00f2ff");
    else if (player.x < 0 || player.x > width || player.y < 0 || player.y > height) endGame("You've Been Proxied!", "#ff003c");

    // Basic AI for Enemy
    if (Math.random() < 0.05) {
        const turn = Math.random() < 0.5 ? {dx: 0, dy: 1} : {dx: 0, dy: -1};
        if (enemy.dx !== 0) { enemy.dx = 0; enemy.dy = turn.dy; }
        else { enemy.dy = 0; enemy.dx = Math.random() < 0.5 ? 1 : -1; }
    }

    // Render Trails
    [player, enemy].forEach(p => {
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.strokeStyle = p.color; ctx.lineWidth = 2;
        ctx.beginPath();
        p.trail.forEach(pos => ctx.lineTo(pos.x, pos.y));
        ctx.stroke();
    });

    requestAnimationFrame(draw);
}

function checkCollision(p) {
    return walls.includes(`${p.x},${p.y}`);
}

function endGame(msg, color) {
    gameOver = true;
    resultText.innerText = msg;
    resultText.style.color = color;
    setTimeout(() => { modal.style.display = 'block'; }, 1000);
}

// Controls
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && player.dy === 0) { player.dx = 0; player.dy = -1; }
    if (e.key === 'ArrowDown' && player.dy === 0) { player.dx = 0; player.dy = 1; }
    if (e.key === 'ArrowLeft' && player.dx === 0) { player.dx = -1; player.dy = 0; }
    if (e.key === 'ArrowRight' && player.dx === 0) { player.dx = 1; player.dy = 0; }
});

// Mobile Buttons
document.getElementById('up').onclick = () => { if (player.dy === 0) { player.dx = 0; player.dy = -1; } };
document.getElementById('down').onclick = () => { if (player.dy === 0) { player.dx = 0; player.dy = 1; } };
document.getElementById('left').onclick = () => { if (player.dx === 0) { player.dx = -1; player.dy = 0; } };
document.getElementById('right').onclick = () => { if (player.dx === 0) { player.dx = 1; player.dy = 0; } };

window.onresize = init;
init();
draw();
