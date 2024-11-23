## Requirements

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Docker (optional, for containerized deployment)

## Setup

### Backend (Node.js Server)

1. Navigate to the testing/server directory:
    sh
    cd testing/server
    

2. Install the dependencies:
    sh
    npm install
    

3. Start the server:
    sh
    npm start
    

### Backend (Python Flask Server)

1. Navigate to the pdf-protector directory:
    sh
    cd pdf-protector
    

2. Create a virtual environment and activate it:
    sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    

3. Install the dependencies:
    sh
    pip install -r requirements.txt
    

4. Start the Flask server:
    sh
    python app.py
    

### Frontend (React App)

1. Navigate to the ui-testing/client directory:
    sh
    cd ui-testing/client
    

2. Install the dependencies:
    sh
    npm install
    

3. Start the development server:
    sh
    npm start
    

## Docker Setup

1. Build and run the Docker containers:
    sh
    docker compose up --build
    

## Entry Points

- *Frontend*: ui-testing/client/src/index.js
- *Node.js Server*: testing/server/server.js
- *Python Flask Server*: pdf-protector/app.py

## Usage

- Open the frontend in your browser at http://localhost:3000.
- Use the interface to upload Word or PDF files for conversion or protection.
- The backend servers handle the file processing and return the results.

## License

This project is licensed under the MIT License.
