format:
	npx prettier --write "**/*.{js,ts,jsx,tsx,html,css,json,yaml,yml}"

# TODO: to be tested on linux
# Build Docker image for the backend
build-backend:
	@echo "Building backend Docker image..."
	@node backend/docker-build.js

# Build Docker image for the frontend
build-frontend:
	@echo "Building frontend Docker image..."
	@node frontend/docker-build.js

# Build both backend and frontend Docker images
build-all: build-backend build-frontend

create-minikube:
	minikube start

destroy-minikube:
	minikube delete
