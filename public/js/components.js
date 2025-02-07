let config = null;

// Load config first
export async function loadConfig() {
    try {
        console.log('Attempting to load config...');
        const response = await fetch('/config/config.json');
        console.log('Config response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        config = await response.json();
        console.log('Config loaded successfully');
        return config;
    } catch (error) {
        console.error('Failed to load config:', error);
        throw error;
    }
}

export async function loadComponents() {
    return new Promise(async (resolve) => {
        try {
            // Load config first if not already loaded
            if (!config) {
                config = await loadConfig();
            }
            const navbar = `
    <nav class="nav-bar">
        <div class="nav-container">
            <div class="nav-logo-container">
                <a href="index.html" class="nav-logo">
                    <img src="images/logo.png" alt="SpyZ Feed Logo" class="nav-logo-img">
                </a>
                <span class="nav-title">${config.app.name}</span>
            </div>
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="commands.html" class="nav-link">Commands</a>
                <button 
                    id="themeToggle" 
                    class="theme-toggle-btn" 
                    aria-label="Toggle theme"
                    type="button"
                >🌙</button>
                <div class="auth-section">
                    <button id="loginButton" class="discord-login">
                        <img 
                            src="${window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') 
                                ? '/images/discord-logo-white.png' 
                                : 'https://spyzfeed.xyz/images/discord-logo-white.png'}" 
                            alt="Discord Logo" 
                            class="discord-logo"
                            id="discordLogo"
                        >
                        Login with Discord
                    </button>
                    <div id="userInfo" class="user-info" style="display: none;">
                        <img id="userAvatar" class="user-avatar" src="" alt="User Avatar">
                        <span id="userName" class="user-name"></span>
                        <button id="logoutButton" class="logout-button">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    </nav>
`;



        
            // Create footer
            const footer = `
                <footer>
                    <div class="footer-content">
                        <div class="footer-section">
                            <a href="index.html">Home</a>
                            <a href="commands.html">Commands</a>
                            <a href="${config.footer.social.discord}" target="_blank">Discord</a>
                        </div>
                        <div class="footer-section">
                            <p class="copyright">${config.app.copyright}</p>
                        </div>
                    </div>
                </footer>
            `;

            // Insert components into DOM
            document.body.insertAdjacentHTML('afterbegin', navbar);
            document.body.insertAdjacentHTML('beforeend', footer);

            const discordLogo = document.getElementById('discordLogo');
            if (discordLogo) {
                discordLogo.addEventListener('error', function() {
                    this.src = '/images/discord-logo-white.png';
                });
            }
            // Set active nav link
            setActiveNavLink();

            // Resolve the promise after components are loaded
            resolve();
        } catch (error) {
            console.error('Failed to load components:', error);
            resolve(); // Still resolve to prevent hanging
        }
    });
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Error handling
function handleComponentError(error) {
    console.error('Component error:', error);
    
    // Create minimal error navigation
    const errorNav = `
        <nav class="nav-bar">
            <div class="nav-container">
                <a href="index.html" class="nav-logo">SpyZ Feed</a>
                <div class="nav-links">
                    <a href="index.html" class="nav-link">Home</a>
                    <a href="commands.html" class="nav-link">Commands</a>
                </div>
            </div>
        </nav>
    `;

    const errorMessage = `
        <div class="error-message">
            <p>Failed to load page components. Using minimal navigation.</p>
            <p>Error: ${error.message}</p>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', errorNav);
    document.body.insertAdjacentHTML('afterbegin', errorMessage);
}

// Create loading indicator
export function showLoading(container) {
    const loadingHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    container.innerHTML = loadingHTML;
}

// Create error display
export function showError(container, error) {
    const errorHTML = `
        <div class="error-message">
            <h3>Error Loading Content</h3>
            <p>${error.message}</p>
            <button onclick="window.location.reload()" class="retry-button">
                Retry
            </button>
        </div>
    `;
    container.innerHTML = errorHTML;
}

// Create notification system
export function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
  
    // Create notification container if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
  
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <p>${message}</p>
      <button class="notification-close">&times;</button>
    `;
  
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  
    // Add notification to container
    notificationContainer.appendChild(notification);
  }
  
  
// Create modal dialog
export function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    // Add close functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
    return modal;
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    // Close modal on Escape
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }

    // Navigation shortcuts
    if (e.ctrlKey) {
        switch(e.key) {
            case 'h':
                e.preventDefault();
                window.location.href = 'index.html';
                break;
            case 'c':
                e.preventDefault();
                window.location.href = 'commands.html';
                break;
        }
    }
});

// Export utility functions
export const utils = {
    showLoading,
    showError,
    showNotification,
    createModal
};
