@echo off
REM Utonga Sanctuary - Reset Test Donation Data Script
cd /d "%~dp0\backend"
echo ======================================================
echo  Utonga Sanctuary - Reset Test Donation Data
echo ======================================================
python manage.py reset_donations %*
pause
