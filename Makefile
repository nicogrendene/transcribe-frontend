# Makefile para Transcribe App
# Aplicación de transcripción de videos con búsqueda semántica

.PHONY: run stop

# Variables
BACKEND_DIR = ../transcribe-api
FRONTEND_DIR = .
BACKEND_CMD = go run cmd/api/main.go cmd/api/usecases.go
FRONTEND_CMD = npm run dev
BACKEND_PID_FILE = .backend.pid
FRONTEND_PID_FILE = .frontend.pid

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

run: ## Compilar y ejecutar ambas aplicaciones en background
	@echo "$(GREEN)🚀 Iniciando Transcribe App...$(NC)"
	@echo "$(YELLOW)📦 Instalando dependencias del frontend...$(NC)"
	@npm install --silent
	@echo "$(YELLOW)🔧 Compilando y ejecutando backend...$(NC)"
	@cd $(BACKEND_DIR) && nohup $(BACKEND_CMD) > ../transcribe-frontend/.backend.log 2>&1 & echo $$! > ../transcribe-frontend/$(BACKEND_PID_FILE)
	@echo "$(YELLOW)⚛️  Compilando y ejecutando frontend...$(NC)"
	@nohup $(FRONTEND_CMD) > .frontend.log 2>&1 & echo $$! > $(FRONTEND_PID_FILE)
	@sleep 3
	@echo "$(GREEN)✅ ¡Aplicación iniciada exitosamente!$(NC)"
	@echo "$(YELLOW)🌐 Frontend: http://localhost:5175$(NC)"
	@echo "$(YELLOW)🔗 Backend API: http://localhost:8000$(NC)"
	@echo "$(YELLOW)📊 Para ver logs: tail -f .backend.log .frontend.log$(NC)"
	@echo "$(YELLOW)🛑 Para detener: make stop$(NC)"

stop: ## Detener ambas aplicaciones
	@echo "$(RED)🛑 Deteniendo aplicaciones...$(NC)"
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		PID=$$(cat $(BACKEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			kill $$PID && echo "$(GREEN)✅ Backend detenido$(NC)"; \
		fi; \
		rm -f $(BACKEND_PID_FILE); \
	fi
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		PID=$$(cat $(FRONTEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			kill $$PID && echo "$(GREEN)✅ Frontend detenido$(NC)"; \
		fi; \
		rm -f $(FRONTEND_PID_FILE); \
	fi
	@echo "$(GREEN)✅ Aplicaciones detenidas$(NC)"

# Comando por defecto
.DEFAULT_GOAL := run
