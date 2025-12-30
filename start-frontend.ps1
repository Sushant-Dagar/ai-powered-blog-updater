# Start React Frontend Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  React Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting server at http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path $PSScriptRoot\frontend
npm run dev
