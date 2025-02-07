// theme.js
export function initializeTheme() {
    console.log('Initializing theme...');
    
    // Listen for the custom theme toggle event
    document.addEventListener('themeToggle', handleThemeToggle);
    
    // Set initial theme
    const savedTheme = localStorage.getItem("darkTheme");
    if (savedTheme === "true") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        updateThemeButton();
    }
}
function handleThemeToggle() {
    console.log('Theme toggle event received');
    const isDark = document.documentElement.classList.contains("dark");
    
    if (isDark) {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
    } else {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
    }
    
    localStorage.setItem("darkTheme", !isDark);
    updateThemeButton();
}
function updateThemeButton() {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    
    const isDark = document.documentElement.classList.contains("dark");
    button.innerHTML = isDark ? '☀️' : '🌙';
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

function setupThemeToggle(button) {
    // Theme toggle functionality
    button.addEventListener("click", function () {
        document.documentElement.classList.toggle("dark");
        document.body.classList.toggle("dark");
        localStorage.setItem("darkTheme", document.documentElement.classList.contains("dark"));
        updateToggleButton(button);
    });

    // Set initial state
    if (localStorage.getItem("darkTheme") === "true") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
    }
    updateToggleButton(button);
}

function updateToggleButton(button) {
    if (!button) return;
    
    const isDark = document.documentElement.classList.contains("dark");
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    button.innerHTML = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    document.body.classList.toggle("dark");
    saveThemePreference();
    updateToggleButton(document.getElementById("themeToggle"));
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
        // Use saved preference
        if (savedTheme === "dark") {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    }
}

function saveThemePreference() {
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

function watchSystemTheme() {
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (!localStorage.getItem("theme")) {
                    if (e.matches) {
                        enableDarkMode();
                    } else {
                        enableLightMode();
                    }
                }
            });
    }
}

function enableDarkMode() {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
    updateToggleButton(document.getElementById("themeToggle"));
}

function enableLightMode() {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
    updateToggleButton(document.getElementById("themeToggle"));
}

// Theme transition management
function manageTransitions(enable = true) {
    const transitionStyles = document.createElement('style');
    transitionStyles.innerHTML = `
        * {
            transition: ${enable ? 'all 0.3s ease' : 'none'} !important;
        }
    `;
    
    if (!enable) {
        document.head.appendChild(transitionStyles);
        setTimeout(() => transitionStyles.remove(), 100);
    }
}

// Color scheme validation
function isValidColorScheme() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    const requiredVariables = [
        '--primary-color',
        '--primary-dark',
        '--text-color',
        '--bg-color',
        '--container-bg',
        '--border-color'
    ];

    return requiredVariables.every(variable => 
        style.getPropertyValue(variable).trim() !== ''
    );
}

// Theme API for external use
export const themeAPI = {
    toggle: toggleTheme,
    enableDark: enableDarkMode,
    enableLight: enableLightMode,
    getCurrentTheme: () => {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
    },
    setTheme: (theme) => {
        if (theme === "dark") {
            enableDarkMode();
        } else {
            enableLightMode();
        }
    }
};

// Event listeners for theme changes
document.addEventListener('DOMContentLoaded', () => {
    // Prevent flash of wrong theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add("dark");
    }
});

// Handle theme persistence across pages
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was loaded from cache (browser back/forward)
        loadThemePreference();
    }
});

// Error handling
function handleThemeError(error) {
    console.error('Theme error:', error);
    
    // Fallback to light theme
    enableLightMode();
    
    // Show error notification if available
    if (window.showNotification) {
        window.showNotification(
            'Error applying theme. Falling back to light mode.',
            'error'
        );
    }
}

// Theme validation and repair
function validateAndRepairTheme() {
    try {
        if (!isValidColorScheme()) {
            // Reset to default theme variables
            document.documentElement.style.setProperty('--primary-color', '#3498db');
            document.documentElement.style.setProperty('--primary-dark', '#2980b9');
            document.documentElement.style.setProperty('--text-color', '#2c3e50');
            document.documentElement.style.setProperty('--bg-color', '#f5f7fa');
            document.documentElement.style.setProperty('--container-bg', '#ffffff');
            document.documentElement.style.setProperty('--border-color', '#e1e8ed');
            
            console.warn('Theme variables were invalid and have been reset to defaults');
        }
    } catch (error) {
        handleThemeError(error);
    }
}

// Initialize theme system
try {
    validateAndRepairTheme();
    initializeTheme();
} catch (error) {
    handleThemeError(error);
}
