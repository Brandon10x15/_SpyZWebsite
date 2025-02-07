@echo off
echo Setting up SpyZ Feed Website

REM Create necessary directories
mkdir C:\spyzwebsite
mkdir C:\spyzwebsite\public
mkdir C:\spyzwebsite\config

REM Install dependencies
npm install express node-windows

REM Get SSL certificate using Win-Acme
cd C:\wacs
wacs.exe --target manual --host spyzfeed.xyz --installation iis --webroot "C:\spyzwebsite\public" --emailaddress your-email@example.com --accepttos

REM Install Windows Service
node install-service.js

REM Create scheduled task for renewal
SCHTASKS /CREATE /SC MONTHLY /TN "Renew SpyZ SSL" /TR "C:\wacs\wacs.exe --renew --quiet" /ST 00:00

echo Setup complete! Your site should now be accessible at https://spyzfeed.xyz
pause
