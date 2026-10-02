// ==============================================================================
// 1. BOOTSTRAP CLIENT-SIDE FORM VALIDATION
// ==============================================================================
// Why this is written:
// When users submit forms (Signup, Login, New Stay, Edit Stay), this script
// checks if all required fields are filled out. If any field is empty/invalid,
// it stops form submission (preventDefault) and adds the Bootstrap 'was-validated'
// class to display green checks or red warning messages.
(() => {
  'use strict'

  // Find all HTML forms marked with the 'needs-validation' class
  const forms = document.querySelectorAll('.needs-validation')

  // Attach submit listener to each form
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

// ==============================================================================
// 2. FLASH NOTIFICATION POPUP AUTO-DISMISS
// ==============================================================================
// Why this is written:
// When Express sends a success or error flash message (like "Welcome to Wanderlust"
// or "Your post is listed!"), this code smoothly animates it down into view.
// After 3.5 seconds, it automatically animates it back up and removes it from the
// DOM so it doesn't block the screen or require manual dismissal.
document.addEventListener("DOMContentLoaded", () => {
    const flashMessage = document.querySelector(".flash");

    if (flashMessage) {
        // Step 1: Wait 100ms after page render, then slide the alert box down into view
        setTimeout(() => {
            flashMessage.classList.add("show");
        }, 100);

        // Step 2: After 3.5 seconds of display time, slide it back up
        setTimeout(() => {
            flashMessage.classList.remove("show");

            // Step 3: Remove the element from the DOM completely once slide animation finishes
            setTimeout(() => {
                flashMessage.remove();
            }, 500);
        }, 3500);
    }
});

// ==============================================================================
// 3. WANDERLUST NAVBAR CONTROLLER & SEARCH SYNCHRONIZATION
// ==============================================================================

// Helper Function: focusNavbarSearchInput
// Why this is written:
// In the navbar, the search pill has "Anywhere", "Any week", and the input box.
// If the user clicks anywhere on that outer pill, this function focuses the input box
// so they can immediately begin typing.
function focusNavbarSearchInput() {
    const input = document.getElementById('navbarSearchInput');
    if (input) input.focus();
}

// Main Navbar Controller Function
// Why this is written:
// Handles all interactive navbar events: opening/closing dropdowns, the mobile drawer,
// closing on outside click, pressing ESC key, and live search filtering.
function initWanderlustNavbar() {
    // Grab key elements from the navbar HTML
    const userBtn = document.getElementById('userMenuBtn');             // The round user pill button
    const dropdownCard = document.getElementById('userDropdownMenu');     // The dropdown menu card
    const mobileToggleBtn = document.getElementById('mobileMenuToggleBtn'); // Mobile hamburger icon
    const mobileDrawer = document.getElementById('mobileNavDrawer');       // Mobile slide-down drawer
    const mobileIcon = document.getElementById('mobileMenuIcon');           // Mobile icon (hamburger / close X)
    const navSearchInput = document.getElementById('navbarSearchInput');   // Top search input in navbar

    // -------------------------------------------------------------------------
    // A. User Profile Dropdown Toggle
    // Why: Clicking the user pill button toggles the dropdown card open or closed.
    // -------------------------------------------------------------------------
    if (userBtn && dropdownCard) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click from immediately bubbling to document click listener
            const isExpanded = userBtn.getAttribute('aria-expanded') === 'true';
            userBtn.setAttribute('aria-expanded', !isExpanded);
            userBtn.classList.toggle('active', !isExpanded);
            dropdownCard.classList.toggle('show', !isExpanded);
        });
    }

    // -------------------------------------------------------------------------
    // B. Mobile Navigation Drawer Toggle
    // Why: On small phone/tablet screens, tapping the menu button opens or closes
    // the mobile slide-down drawer and flips the icon between hamburger and 'X'.
    // -------------------------------------------------------------------------
    if (mobileToggleBtn && mobileDrawer) {
        mobileToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileDrawer.classList.contains('open');
            if (isOpen) {
                // If open, close it
                mobileDrawer.classList.remove('open');
                mobileToggleBtn.setAttribute('aria-expanded', 'false');
                if (mobileIcon) {
                    mobileIcon.className = 'ri-menu-4-line'; // Back to hamburger icon
                }
            } else {
                // If closed, open it
                mobileDrawer.classList.add('open');
                mobileToggleBtn.setAttribute('aria-expanded', 'true');
                if (mobileIcon) {
                    mobileIcon.className = 'ri-close-line'; // Switch to 'X' close icon
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // C. Click Outside to Close
    // Why: If a user clicks outside the open user menu or outside the mobile drawer,
    // this automatically closes them for a smooth, intuitive user experience.
    // -------------------------------------------------------------------------
    document.addEventListener('click', (e) => {
        // If user menu is open and clicked outside -> close it
        if (userBtn && dropdownCard && !userBtn.contains(e.target) && !dropdownCard.contains(e.target)) {
            userBtn.setAttribute('aria-expanded', 'false');
            userBtn.classList.remove('active');
            dropdownCard.classList.remove('show');
        }
        // If mobile drawer is open and clicked outside -> close it
        if (mobileToggleBtn && mobileDrawer && !mobileToggleBtn.contains(e.target) && !mobileDrawer.contains(e.target)) {
            mobileDrawer.classList.remove('open');
            mobileToggleBtn.setAttribute('aria-expanded', 'false');
            if (mobileIcon) {
                mobileIcon.className = 'ri-menu-4-line';
            }
        }
    });

    // -------------------------------------------------------------------------
    // D. Escape Key to Close (Accessibility)
    // Why: Pressing the physical ESC key on keyboard closes any open dropdowns or drawers.
    // -------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (userBtn && dropdownCard) {
                userBtn.setAttribute('aria-expanded', 'false');
                userBtn.classList.remove('active');
                dropdownCard.classList.remove('show');
            }
            if (mobileDrawer) {
                mobileDrawer.classList.remove('open');
                if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-expanded', 'false');
                if (mobileIcon) mobileIcon.className = 'ri-menu-4-line';
            }
        }
    });

    // -------------------------------------------------------------------------
    // E. Live Search Synchronization
    // Why: When the user is on the /listings explore page, typing any character into
    // the top navbar search input instantly triggers filterMarketplaceListings()
    // so stay cards on the screen filter immediately on each keystroke without reloading!
    // -------------------------------------------------------------------------
    if (navSearchInput) {
        navSearchInput.addEventListener('input', () => {
            const marketplaceInput = document.getElementById('marketplaceSearchInput');
            if (marketplaceInput && typeof filterMarketplaceListings === 'function') {
                // 1. Copy the typed word from navbar into the page's search input
                marketplaceInput.value = navSearchInput.value;
                // 2. Run the instant live filter function to show/hide stay cards
                filterMarketplaceListings();
            }
        });
    }
}

// Safely execute initWanderlustNavbar once the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWanderlustNavbar);
} else {
    initWanderlustNavbar();
}
