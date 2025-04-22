# ML Playground - ML Product Testing Framework

A full-stack application for experimenting with different ML models, featuring a clean Next.js frontend and a flexible backends (NodeJS, Python) with automatic model discovery.

## Project Overview

This project provides a simple environment for interacting with various ML model implementations. It consists of:

- **Frontend**: For easily testing different types of ML models
- **Backend**: For deploying ML models. Currently available in NodeJS and Python but easily extensible for other languages.
- **Logger**: For collecting and storing logs for later analysis.
- **Registry**: For service and model discovery.
- **Proxy**: For single API entrypoint with load balancing.

Key features:
- Easy-to-extend architecture for adding new model implementations
- Automatic model discovery without configuration changes
- Automatic service discover for quick deployment/removal
- Support for multiple languages and easily extendable for new languages
- Dynamically scalable as needed

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Docker for smooth experience
- Python (optional)

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

* To bring the service up in cluster mode with service/model discovery:

   ```bash
   make up_cluster
   make clean_cluster
   ```

## Project Structure

```
ml-playground
├── backend                            # Service for containing deployed models
│   ├── server.js
│   └── src
│       ├── middlewares                
│       │   ├── cors.js
│       │   └── logger.js              # Handles sending logs to logger service
│       ├── models                     # All the deployed models
│       │   ├── baseModel.js           # Abstract model. All the models extend from this
│       │   ├── implementations
│       │   │   ├── advancedModel.js   # Sample simple model in single file
│       │   │   ├── complexModel       # Sample complex model with its own directory
│       │   │   │   ├── index.js
│       │   │   │   └── utils.js
│       │   │   ├── ...
│       │   └── modelManager.js        # Handles model discovery at startup
│       ├── routes
│       │   ├── healthRoutes.js        # Health related endpoints
│       │   └── modelRoutes.js         # Endpoints to access models
│       └── serviceRegistry.js         # Handles registering/unregistering with Registry service in cluster mode
├── backend-py                         # Backend service similar to backend/ but in Python. Structure is the same
│   ├── server.py
│   └── src
│       ├── middlewares
│       │   ├── cors.py
│       │   └── logger.py
│       ├── models
│       │   ├── baseModel.py
│       │   ├── implementations
│       │   │   ├── echoModel.py
│       │   │   └── pySummary.py
│       │   └── modelManager.py
│       ├── routes
│       │   ├── healthRoutes.py
│       │   └── modelRoutes.py
│       └── serviceRegistry.py
├── frontend                           # GUI
│   ├── components                     # All the React components
│   │   ├── ...
│   ├── pages                          # NextJS pages
│   │   └── index.js
│   └── styles                         # All the styles related to components and pages
│       ├── components
│       │   ├── ...
│       └── pages
│           └── ...
├── logger                             # Service for collecting and storing logs
│   ├── server.js
│   └── src
│       ├── db.js                      # In memory database
│       ├── middlewares
│       │   ├── cors.js
│       │   └── requestLogger.js
│       └── routes
│           ├── healthRoutes.js
│           └── logRoutes.js
├── proxy                              # Single entrypoint in the cluster mode
│   ├── server.js
│   └── src
│       ├── loadBalancer.js            # Load balancing across backend services and models
│       ├── routes
│       │   ├── backendRoutes.js       # Handles requests for backends
│       │   ├── healthRoutes.js
│       │   ├── loggerRoutes.js        # Handles requests for logger
│       │   └── registryRoutes.js      # Handles available-model queries
│       ├── serviceCache.js            # Short-term cache for performance and efficiency
│       ├── serviceUtils.js            # Helper for service selection
│       └── upstreamHandler.js         # Handles upstream connections
└── registry                           # Service registry
    ├── server.js
    └── src
        ├── healthChecker.js           # Check health of registered services
        ├── routes
        │   ├── healthRoutes.js
        │   ├── registryRoutes.js
        │   └── servicesRoutes.js
        └── serviceRegistry.js         # Maintain the registrations
```

## Docker Support

All components include Dockerfiles for containerized deployment.
Several docker-compose configurations are also available for different deployments.
You are encouraged to use Makefile as the entrypoint for basic things without using `docker-compose` or `docker` directly.

## Adding New Models

The backend is designed to easily accommodate new model implementations:

1. Create a new file in `backend/src/models/implementations/` (or a folder with an index.js file for more complex models)
2. Extend the BaseModel class and implement the required methods
3. Restart the backend server

The new model will be automatically discovered and made available through the API.

For detailed instructions on creating custom models, see the [Models Documentation](backend/src/models/README.md).
