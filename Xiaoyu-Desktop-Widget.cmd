@echo off
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0Xiaoyu-Desktop-Widget.ps1"
if errorlevel 1 pause
