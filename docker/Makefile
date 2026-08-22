.PHONY: clean start stop restart logs build remove mkcert

clean:
	@echo "Cleaning up Docker resources..."
	docker compose down -v || true
	docker compose rm -f || true
	sudo find ./nginx/logs -mindepth 1 -maxdepth 1 ! -name '.gitkeep' -type f -exec rm -f {} + 2>/dev/null || true
	rm -f ../public/images/*.png
	echo "[]" > ../detections.json
	@echo "Cleanup complete"

mkcert:
	@echo "Generating SSL certificates..."
	mkdir -p nginx/certs
	openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/localhost-key.pem -out nginx/certs/localhost.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:raccoon"
	@echo "SSL certificates generated successfully"

start:
	@echo "Starting Smart Camera services..."
	@echo "Creating runtime directories..."
	mkdir -p nginx/logs ../public/images
	@echo "Checking SSL certificates..."
	@if [ ! -f nginx/certs/localhost.pem ] || [ ! -f nginx/certs/localhost-key.pem ]; then \
		echo "Generating SSL certificates..."; \
		$(MAKE) mkcert; \
	else \
		echo "SSL certificates already exist."; \
	fi
	@echo "Building and starting containers..."
	docker compose up -d --build
	@echo "Services started!"
	@echo "HTTP (redirects to HTTPS): http://localhost:8081"
	@echo "HTTPS: https://localhost:8443"
	@echo "Backend API: https://localhost:8443/api"
	@echo "Images: https://localhost:8443/images"

stop:
	@echo "Stopping services..."
	docker compose down
	@echo "Services stopped"

restart:
	@echo "Restarting services..."
	docker compose restart
	@echo "Services restarted"

logs:
	docker compose logs -f

build:
	@echo "Building containers..."
	docker compose build --no-cache
	@echo "Build complete"

remove:
	@echo "Removing all containers and volumes..."
	docker compose down -v
	docker compose rm -f
	@echo "Removal complete"