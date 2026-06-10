.PHONY: install clean 
clean:
	docker compose down -v || true
	docker compose rm -f || true
	docker volume ls -q | xargs -r docker volume rm -f || true
	sudo find ./nginx/logs -mindepth 1 -maxdepth 1 ! -name '.gitkeep' -type f -exec rm -f {} + 2>/dev/null || true

create_htpasswd:
	@echo "Creating htpasswd file..."
	@htpasswd -c -B -b nginx/.htpasswd admin admin123

start:
	@echo "Starting services..."
	@echo "Creating runtime directories with proper permissions..."
	mkdir -p nginx/logs nginx/certs logs output data
	chmod 775 logs output data
	@[ -O nginx/logs ] && chmod 775 nginx/logs || true
	@[ -O nginx/certs ] && chmod 775 nginx/certs || true
	@echo "Checking SSL certificates..."
	@if [ ! -f nginx/certs/localhost.pem ] || [ ! -f nginx/certs/localhost-key.pem ]; then \
		echo "Generating SSL certificates..."; \
		$(MAKE) mkcert; \
	else \
		echo "SSL certificates already exist."; \
	fi
	@echo "Starting services (APP_UID/APP_GID align container user with these dirs)..."
	APP_UID=$$(id -u) APP_GID=$$(id -g) docker compose up -d

mkcert:
	@echo "Removing old SSL certificates..."
	@rm -f nginx/certs/localhost-key.pem nginx/certs/localhost.pem || true
	@echo "Generating new SSL certificates..."
	mkdir -p nginx/certs
	mkcert -install
	mkcert -key-file nginx/certs/localhost-key.pem -cert-file nginx/certs/localhost.pem localhost 127.0.0.1 ::1 nobel.local cbwanpr cbwanpr.local 

stop:
	docker compose down 

update:
	docker compose down
	docker compose pull
	APP_UID=$$(id -u) APP_GID=$$(id -g) docker compose up -d --build
	
restart: 
	docker compose restart

remove:
	docker compose down -v
	docker compose rm -f