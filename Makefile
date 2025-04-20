install:
	@echo "Installing Node.js dependencies locally..."
	cd backend && npm install
	cd frontend && npm install

up: install
	@echo "Starting Docker Compose..."
	docker-compose up --build

clean:
	@echo "Stopping Docker Compose..."
	docker-compose down -v

.PHONY: install up clean
