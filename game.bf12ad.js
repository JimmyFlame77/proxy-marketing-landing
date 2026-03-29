/**
 * PROXY MARKETING AI // THE GRID ENGINE v1.4
 * Core Game Logic + Lead Capture Protocol
 */

// --- 1. CONFIGURATION & STATE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');
const emailForm = document.getElementById('emailForm');
const resultText = document.getElementById('result-text');

let gameActive = true;
let score = 0;

// Set Canvas to Full Screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 2. GAME OBJECTS (The "Grid Entities") ---
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    color: '#00f2ff', // P1 Cyan
    speed: 7
};

const particles = [];

// --- 3. THE MODAL TRIGGER (The Handshake) ---
/**
 * Call this when the player wins or loses.
 * @param {string} status - Use "ACCESS_GRANTED" or "MISSION_FAILED"
 */
function triggerProxyProtocol(status) {
    gameActive = false;
    
    // Set the Shader Black header text
    resultText.innerText = status;
    
    // Apply the glitch effect class if you have it in CSS
    resultText.classList.add('glitch');
    resultText.setAttribute('data-text', status);
    
    // Display the modal using Flex for centering
    modal.style.display = 'flex';
}

// --- 4. FORM SUBMISSION LOGIC (The Lead Capture) ---
emailForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const emailInput = document.getElementById('emailInput');
    const confirmationMsg = document.getElementById('confirmation-msg');
    const nameContainer = document.querySelector('.name-container');
    const subText = document.getElementById('sub-text');
    const legalNotice = document.querySelector('.legal-notice');

    // Visual Feedback
    submitBtn.innerText = "AUTHENTICATING...";
    submitBtn.disabled = true;

    // SIMULATED AUTHENTICATION (Replace with Formspree URL later)
    setTimeout(() => {
        // Hide UI Elements
        firstName.style.display = 'none';
        lastName.style.display = 'none';
        if(nameContainer) nameContainer.style.display = 'none';
        emailInput.style.display = 'none';
        submitBtn.style.display = 'none';
        subText.style.display = 'none';
        legalNotice.style.display = 'none';

        // Show "PROXY INITIATED!" in Shader Black
        confirmationMsg.style.display = 'block';
        
        console.log("LEAD CAPTURED:", {
            name: `${firstName.value} ${lastName.value}`,
            email: emailInput.value
        });
    }, 1500);
};

// --- 5. CORE GAME LOOP ---
function update() {
    if (!gameActive) return;

    // Example Game Logic: Move player toward center (Placeholder)
    // You can add your specific movement logic here
    
    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Clear the Grid
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2ff';
    ctx.fillRect(player.x - 20, player.y - 20, player.width, player.height);
    ctx.shadowBlur = 0; // Reset glow for performance
}

// Start the Protocol
update();

/** * TESTING NOTE: 
 * To test the modal right now, you can type 
 * triggerProxyProtocol("ACCESS_GRANTED"); 
 * into your browser console.
 */
