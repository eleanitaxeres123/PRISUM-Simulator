NSTALLATION INSTRUCTIONS – PRISUM-Simulator

This document provides the minimal instructions required to install and run the PRISUM-Simulator in a local environment for research and reproducibility purposes. The simulator consists of a Python-based backend and an optional web-based frontend. Only the backend is required to execute simulations.

SYSTEM REQUIREMENTS

Supported operating systems:
- Windows
- macOS

Backend requirements:
- Python 3.12
- pip (Python package manager)
- Git (optional)
- MongoDB Community Server
- mongosh (MongoDB shell)

Frontend requirements (optional):
- Node.js 18 or higher
- npm

BACKEND INSTALLATION

Create and activate a virtual environment.

Windows:
python -m venv venv
venv\Scripts\activate

macOS:
python3 -m venv venv
source venv/bin/activate

Once activated, the terminal prompt should display (venv).

Install Python dependencies using the provided requirements file:
pip install -r requirements.txt

Ensure that MongoDB is installed and running.

Start the MongoDB service:
mongod

In a separate terminal, verify the connection:
mongosh

The simulator requires an active MongoDB instance to store propagation records during execution.

Run the backend from the root directory.

Windows:
py main.py

macOS:
python3 main.py

The backend will start locally and initialize the simulation engine.

FRONTEND INSTALLATION (OPTIONAL)

The frontend provides an interactive interface for configuring experiments and visualizing results. It is optional and not required to run simulations programmatically.

From the frontend project directory, install dependencies:
npm install

Run the development server:
npm run dev

The frontend will start in development mode and can be accessed through a local web browser.

EXECUTION FLOW

1. Start MongoDB
2. Start the backend
3. (Optional) Start the frontend
4. Configure and run simulations

NOTES

This installation guide focuses on reproducibility rather than production deployment. The simulator is intended for academic and research use. Only minimal configuration is required to execute the example scenarios included in the repository.
