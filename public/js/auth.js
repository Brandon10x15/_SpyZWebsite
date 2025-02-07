// auth.js
export let config = null;
// auth.js
export async function loadConfig() {
    try {
        console.log('Attempting to load config...');
        const response = await fetch('/config/config.json');
        console.log('Config response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        console.log('Config loaded successfully');
        return config;
    } catch (error) {
        console.error('Failed to load config:', error);
        throw error;
    }
}


export async function initializeAuth() {
    try {
        const config = await loadConfig();
        
        // Determine environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        const redirectUri = isDevelopment 
            ? config.discord.redirectUri.development 
            : config.discord.redirectUri.production;

        const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify`;

        // DOM Elements
        const loginButton = document.getElementById('loginButton');
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const logoutButton = document.getElementById('logoutButton');

        if (!loginButton || !userInfo || !userAvatar || !userName || !logoutButton) {
            throw new Error('Required DOM elements not found');
        }

        // Check if user is logged in
        function checkAuth() {
            const accessToken = localStorage.getItem('discord_access_token');
            if (accessToken) {
                fetchUserInfo(accessToken);
            }
        }

        // Fetch user info from Discord
        async function fetchUserInfo(accessToken) {
            try {
                const response = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const data = await response.json();
                
                if (response.ok) {
                    showUserInfo(data);
                } else {
                    console.error('Failed to fetch user info:', data);
                    logout();
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                logout();
            }
        }

        // Show user info in the navbar
        function showUserInfo(user) {
            loginButton.style.display = 'none';
            userInfo.style.display = 'flex';
            userAvatar.src = user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            userName.textContent = user.username;
            
            // Save theme preference before showing user info
            const isDark = document.documentElement.classList.contains("dark");
            localStorage.setItem("darkTheme", isDark);
        }

        // Handle login
        loginButton.addEventListener('click', () => {
            // Save current theme before redirect
            const isDark = document.documentElement.classList.contains("dark");
            localStorage.setItem("darkTheme", isDark);
            window.location.href = DISCORD_OAUTH_URL;
        });

        // Handle logout
        logoutButton.addEventListener('click', logout);

        function logout() {
            localStorage.removeItem('discord_access_token');
            loginButton.style.display = 'flex';
            userInfo.style.display = 'none';
            // Maintain theme during logout
            const isDark = localStorage.getItem("darkTheme") === "true";
            if (isDark) {
                document.documentElement.classList.add("dark");
                document.body.classList.add("dark");
            }
        }

        // Handle OAuth2 redirect
        function handleOAuth2Redirect() {
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = fragment.get('access_token');
            const error = fragment.get('error');
            
            if (error) {
                console.error('OAuth error:', error);
                return;
            }
            
            if (accessToken) {
                localStorage.setItem('discord_access_token', accessToken);
                // Preserve theme when clearing hash
                const isDark = localStorage.getItem("darkTheme") === "true";
                window.location.hash = '';
                if (isDark) {
                    document.documentElement.classList.add("dark");
                    document.body.classList.add("dark");
                }
                checkAuth();
            }
        }

        // Error handling for missing config
        if (!config.discord?.clientId) {
            throw new Error('Discord client ID not configured');
        }

        // Initialize
        handleOAuth2Redirect();
        checkAuth();

    } catch (error) {
        console.error('Failed to initialize auth:', error);
        const authSection = document.querySelector('.auth-section');
        if (authSection) {
            authSection.innerHTML = `
                <div class="error-message">
                    <p>Failed to initialize authentication. Please try again later.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Helper function to check if running in development
export function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
}

// Function to protect user information
function protectUserInfo(userData) {
    return {
        username: userData.username,
        avatar: userData.avatar,
        id: 'PROTECTED'
    };
}

// Function to handle authentication errors
function handleAuthError(error) {
    console.error('Authentication error:', error);
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.innerHTML = `
            <div class="error-message">
                <p>Authentication failed. Please try again.</p>
                <button onclick="window.location.reload()" class="retry-button">
                    Retry
                </button>
            </div>
        `;
    }
}

// Function to validate auth token
function isValidToken(token) {
    if (!token) return false;
    try {
        const [header, payload, signature] = token.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload.exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
}
