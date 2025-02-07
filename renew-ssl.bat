@echo off
echo Renewing SSL Certificate

REM Stop the web server
net stop SpyZFeed

REM Renew certificate
cd C:\wacs
wacs.exe --renew --quiet

REM Start the web server
net start SpyZFeed

echo Certificate renewal complete!
pause
