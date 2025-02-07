@echo off
echo Starting SpyZ Feed Server...
cd "C:\Users\Brand\Documents\_SpyZ-Feed\_SpyZWebsite"
cls
echo Server starting at http://localhost:10157
nodemon server.js
pause
