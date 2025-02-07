const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Define allowed origins
const allowedOrigins = [
    'https://spyzfeed.xyz',
    'http://localhost:10157',
    'http://127.0.0.1:10157',
    'https://www.spyzfeed.xyz',
    undefined,
    'null'
];

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            return callback(null, true);  // Allow all origins temporarily
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Force cache refresh for JavaScript files
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

// Trust Cloudflare's proxy
app.set('trust proxy', true);

// Simplified CSP middleware
app.use((req, res, next) => {
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://discord.com",
        "style-src 'self' 'unsafe-inline'" ,
        "img-src 'self' data: https://cdn.discordapp.com https://assets-global.website-files.com",
        "connect-src 'self' https://discord.com"
    ].join('; ');

    // Security headers
    res.setHeader('Content-Security-Policy', cspDirectives);

    next();
});

// Serve images with no-cache headers
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Serve static files with no-cache headers
app.use(express.static('public', {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Serve config files
app.get('/config/config.json', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'config', 'config.json'));
});

app.get('/config/commands.json', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'config', 'commands.json'));
});

// JavaScript files route with version parameter
app.get('*.js', (req, res, next) => {
    req.url = req.url.split('?')[0];
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);
    res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// 404 handler
app.use((req, res) => {
    const notFoundPath = path.join(__dirname, 'public', '404.html');
    if (fs.existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        res.status(404).send('404 - Page Not Found');
    }
});

// Start server
const PORT = 10157;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
