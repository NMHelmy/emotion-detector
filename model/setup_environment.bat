@echo off
echo Setting up Python environment for Emotion Recognition project...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo Found Python, proceeding with setup...

REM Create virtual environment
set ENV_NAME=emotion_recognition_env
echo Creating virtual environment: %ENV_NAME%

if exist %ENV_NAME% (
    echo Virtual environment already exists. Removing old environment...
    rmdir /s /q %ENV_NAME%
)

python -m venv %ENV_NAME%

REM Activate virtual environment
echo Activating virtual environment...
call %ENV_NAME%\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install packages from requirements.txt
echo Installing required packages...
pip install -r requirements.txt

REM install ipykernel
echo Installing ipykernel...
python -m pip install ipykernel
REM Install kernel for Jupyter
echo Installing Jupyter kernel for this environment...
python -m ipykernel install --user --name=%ENV_NAME% --display-name="Python (Emotion Recognition)"

echo.
echo Environment setup complete!
echo Virtual environment name: %ENV_NAME%
echo To activate the environment manually, run: %ENV_NAME%\Scripts\activate.bat
echo To deactivate, run: deactivate
echo.
echo In VS Code, select the kernel 'Python (Emotion Recognition)' for your notebooks.
echo.
echo Setup completed successfully! You can now use the notebook with all dependencies installed.
pause
