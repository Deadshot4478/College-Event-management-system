// Function to toggle event form visibility
function toggleForm() {
    document.querySelector(".add-event-form").classList.toggle("hidden");
}

// Close dropdown when clicking outside
window.onclick = function (event) {
    if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.querySelectorAll(".dropdown-content");
        dropdowns.forEach(dropdown => dropdown.classList.remove("show"));
    }
};

// Alert & Background Blur Effect
document.addEventListener("DOMContentLoaded", function () {
    const alertBoxes = document.querySelectorAll(".alert");
    let blurOverlay = document.querySelector(".blur-overlay");

    // If blur-overlay doesn't exist, create and append it
    if (!blurOverlay) {
        blurOverlay = document.createElement("div");
        blurOverlay.classList.add("blur-overlay");
        document.body.appendChild(blurOverlay);
    }

    if (alertBoxes.length > 0) {
        blurOverlay.style.display = "block"; // Show blur

        // Remove alerts after 3 seconds
        setTimeout(() => {
            alertBoxes.forEach(alert => {
                alert.style.animation = "fadeOut 0.5s ease-in-out forwards";
                setTimeout(() => {
                    alert.remove();
                    blurOverlay.style.display = "none"; // Hide blur after fade-out
                }, 500);
            });
        }, 3000);
    }
});

