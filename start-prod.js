const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = require('./server.js');

const sslOptions = {
    key: fs.readFileSync('/path/to/your/private.key'),
    cert: fs.readFileSync('/path/to/your/certificate.crt')
};

// HTTP server (redirects to HTTPS)
http.createServer((req, res) => {
    res.writeHead(301, { 
        Location: `https://${req.headers.host}${req.url}` 
    });
    res.end();
}).listen(80);

// HTTPS server
https.createServer(sslOptions, app)
    .listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
