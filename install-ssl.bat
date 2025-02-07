@echo off
echo Getting SSL Certificate for spyzfeed.xyz

cd C:\wacs
wacs.exe --target manual --host spyzfeed.xyz --installation iis --webroot "C:\spyzwebsite\public" --emailaddress your-email@example.com --accepttos

echo Certificate installation complete!
pause
