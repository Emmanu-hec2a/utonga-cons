# Utonga Sanctuary - Reset Test Donation Data Script (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\backend"

Write-Host "======================================================" -ForegroundColor Green
Write-Host " Utonga Sanctuary - Reset Test Donation Data" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

python manage.py reset_donations $args
