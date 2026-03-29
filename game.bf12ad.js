/**
 * PROXY MARKETING AI // THE GRID ENGINE v1.5
 * Fully Unified: Game Loop + Lead Capture Form
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SYSTEM CONFIGURATION ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const modal = document.getElementById('modal');
    const emailForm = document.getElementById('emailForm');
    const resultText = document.getElementById('result-text');

    // Hide the modal initially so the game can play
    modal.style.display = 'none';

    let gameActive = true;

    // Responsive Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- 2. GRID ENTITIES (The Game Objects) ---
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        size: 30,
        color: '#00f2ff' // P1 Cyan
    };

    const targetNode = {
        x: canvas.width / 2,
        y: 100,
        size: 40,
        color: '#ff003c' // Threat Red
    };

    // Input Tracking (Mouse & Touch)
    let pointerX = player.x;
    let pointerY = player.y;

    canvas.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Stop screen scrolling while playing
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
    }, { passive: false });

    // --- 3. THE PROTOCOL TRIGGER (Win State) ---
    function triggerProxyProtocol(status) {
        if (!gameActive) return; // Prevent multiple triggers
        gameActive = false; 
        
        // Update the header text and show the UI
        resultText.innerText = status;
        modal.style.display = 'flex';
    }

    // --- 4. DATA CAPTURE (The Form Submission) ---
    if (emailForm) {
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

            submitBtn.innerText = "AUTHENTICATING...";
            submitBtn.style.background = "#fff";
            submitBtn.disabled = true;

            setTimeout(() => {
                // Wipe the form UI
                firstName.style.display = 'none';
                lastName.style.display = 'none';
                if(nameContainer) nameContainer.style.display = 'none';
                emailInput.style.display = 'none';
                submitBtn.style.display = 'none';
                subText.style.display = 'none';
                legalNotice.style.display = 'none';

                // Show Success
                confirmationMsg.style.display = 'block';
                
                console.log("LEAD SECURED:", emailInput.value);
            }, 1500);
        };
    }

    // --- 5. THE GAME ENGINE (Render Loop) ---
    function update() {
        if (!gameActive) return;

        // Player smoothly follows pointer
        player.x += (pointerX - player.x) * 0.1;
        player.y += (pointerY - player.y) * 0.1;

        // Collision Detection (Did P1 hit the Target?)
        let dx = player.x - targetNode.x;
        let dy = player.y - targetNode.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (player.size/2 + targetNode.size/2)) {
            triggerProxyProtocol("ACCESS GRANTED");
        }

        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        // Clear the screen with deep matte carbon
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render Target Node
        ctx.fillStyle = targetNode.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = targetNode.color;
        ctx.fillRect(targetNode.x - targetNode.size/2, targetNode.y - targetNode.size/2, targetNode.size, targetNode.size);

        // Render Player
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = player.color;
        ctx.fillRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
        
        ctx.shadowBlur = 0; // Prevent glowing everything
    }

    // Boot the System
    update();
});
