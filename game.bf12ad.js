/**
 * PROXY MARKETING AI // THE GRID ENGINE v1.4.1
 * Core Lead Capture Protocol (Dummy Test Mode)
 */

document.addEventListener("DOMContentLoaded", () => {
    const emailForm = document.getElementById('emailForm');
    
    if (emailForm) {
        emailForm.onsubmit = async (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            const submitBtn = document.getElementById('submitBtn');
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const emailInput = document.getElementById('emailInput');
            const confirmationMsg = document.getElementById('confirmation-msg');
            const nameContainer = document.querySelector('.name-container');
            const subText = document.getElementById('sub-text');
            const legalNotice = document.querySelector('.legal-notice');

            // 1. VISUAL FEEDBACK (Button state change)
            submitBtn.innerText = "AUTHENTICATING...";
            submitBtn.style.background = "#fff";
            submitBtn.disabled = true;

            // 2. SIMULATED API CALL (1.5 second delay)
            setTimeout(() => {
                // Hide all form elements
                firstName.style.display = 'none';
                lastName.style.display = 'none';
                if(nameContainer) nameContainer.style.display = 'none';
                emailInput.style.display = 'none';
                submitBtn.style.display = 'none';
                subText.style.display = 'none';
                legalNotice.style.display = 'none';

                // Reveal the Success Message
                confirmationMsg.style.display = 'block';
                
                // Log to console for your verification
                console.log("GRID DATA CAPTURED:", {
                    name: `${firstName.value} ${lastName.value}`,
                    email: emailInput.value
                });
            }, 1500);
        };
    } else {
        console.error("PROXY ERROR: Could not find the #emailForm element.");
    }
});
