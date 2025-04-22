install:
	@echo "Installing Node.js dependencies locally..."
	cd backend && npm install
	cd frontend && npm install
	cd logger && npm install

up: install
	@echo "Starting Docker Compose..."
	docker-compose up --build

clean:
	@echo "Stopping Docker Compose..."
	docker-compose down -v

install_cluster:
	@echo "Installing Node.js dependencies locally for cluster..."
	cd backend && npm install
	cd frontend && npm install
	cd logger && npm install
	cd registry && npm install
	cd proxy && npm install

up_cluster: install_cluster
	@echo "Starting Docker Compose..."
	docker-compose -f docker-compose-cluster.yaml up --build

clean_cluster:
	@echo "Stopping Docker Compose..."
	docker-compose -f docker-compose-cluster.yaml down -v

up_cluster_w_py: install_cluster
	@echo "Starting Docker Compose..."
	docker-compose -f docker-compose-cluster-w-py.yaml up --build

clean_cluster_w_py:
	@echo "Stopping Docker Compose..."
	docker-compose -f docker-compose-cluster-w-py.yaml down -v

up_backend_py:
	@echo "Starting backend-py..."
	docker-compose -f docker-compose-cluster-w-py.yaml up backend-py --build

.PHONY: install up down clean install_cluster up_cluster up_cluster_w_py
