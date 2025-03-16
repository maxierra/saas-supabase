@echo off
setlocal enabledelayedexpansion

:: Display current Git status
echo Current Git Status:
git status

:: Prompt for commit message
set /p COMMIT_MSG=Enter your commit message: 

:: Check if commit message is empty
if "!COMMIT_MSG!"=="" (
    echo Commit message cannot be empty
    exit /b 1
)

:: Add all changes
echo.
echo Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo Error: Failed to add changes
    exit /b 1
)

:: Commit with message
echo.
echo Committing changes with message: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo Error: Failed to commit changes
    exit /b 1
)

:: Push changes
echo.
echo Pushing changes to remote repository...
git push
if %errorlevel% neq 0 (
    echo Error: Failed to push changes
    exit /b 1
)

echo.
echo Successfully committed and pushed changes!

pause