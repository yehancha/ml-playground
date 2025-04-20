# NextJS Playground - LLM Chat Application

A full-stack application for experimenting with language models, featuring a clean Next.js frontend and a flexible Node.js backend with automatic model discovery.

## Project Overview

This project provides a simple yet powerful environment for interacting with various language model implementations. It consists of:

- **Frontend**: A responsive Next.js application with a chat interface
- **Backend**: A flexible Express server with pluggable model architecture

Key features:
- Simple UI with real-time chat experience
- Model selection dropdown to switch between different implementations
- Easy-to-extend architecture for adding new model implementations
- Automatic model discovery without configuration changes

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Docker for smooth experience

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:yehancha/llm-playground.git
   cd llm-playground
   ```

2. Set up and run:
   ```bash
   make up
   ```

3. Clean environment:
   ```bash
   make clean
   ```

## Project Structure

```
nextjs-playground/
├── frontend/                # Next.js client application
│   ├── components/          # React components
│   ├── pages/               # Next.js pages
│   ├── styles/              # CSS modules and styles
│   └── package.json         # Frontend dependencies
│
└── backend/                 # Express server application
    ├── src/                 # Source code
    │   ├── config/          # Configuration files
    │   └── models/          # Model system
    │       ├── implementations/  # Model implementations
    │       └── README.md         # Model documentation
    ├── server.js            # Main server entry point
    └── package.json         # Backend dependencies
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `AVAILABLE_MODELS` | Comma-separated list of models to make available | N/A |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | URL where the backend is hosted | N/A |

## Docker Support

Both the frontend and backend include Dockerfiles for containerized deployment.

### Building and Running with Docker

Backend:
```bash
cd backend
docker build -t llm-playground-backend .
docker run -p 3010:3010 llm-playground-backend
```

Frontend:
```bash
cd frontend
docker build -t llm-playground-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3010 llm-playground-frontend
```

## Adding New Models

The backend is designed to easily accommodate new model implementations:

1. Create a new file in `backend/src/models/implementations/` (or a folder with an index.js file for more complex models)
2. Extend the BaseModel class and implement the required methods
3. Restart the backend server

The new model will be automatically discovered and made available through the API.

For detailed instructions on creating custom models, see the [Models Documentation](backend/src/models/README.md).

## API Endpoints

The backend exposes these primary endpoints:

- `GET /api/models`: Returns a list of available model names
- `POST /api/prompt`: Sends a prompt to a specified model and returns the response

## Development

### Frontend Development

The frontend uses Next.js with React and CSS modules. To add new features:

1. Modify or add components in the `frontend/components/` directory
2. Add styles in the `frontend/styles/` directory
3. Use the Next.js pages structure to add new routes

### Backend Development

The backend uses a modular Express.js architecture:

1. The main server logic is in `backend/server.js`
2. Model implementations are in `backend/src/models/implementations/`
3. The model system is documented in `backend/src/models/README.md`

## Documentation

- [Model Architecture](backend/src/models/README.md)

