const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
    name: 'SpyZFeed',
    description: 'SpyZ Feed Web Server',
    script: path.join(__dirname, 'start-prod.js'),
    env: [{
        name: "NODE_ENV",
        value: "production"
    }]
});

svc.on('install', () => {
    svc.start();
    console.log('Service installed successfully');
});

svc.install();
