# Makefile para Transcribe App
# Aplicación de transcripción de videos con búsqueda semántica

.PHONY: help install start stop restart status clean dev-backend dev-frontend dev-all build preview prod

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

help: ## Mostrar ayuda
	@echo "$(GREEN)Transcribe App - Comandos disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Instalar dependencias del frontend
	@echo "$(GREEN)Instalando dependencias del frontend...$(NC)"
	@npm install

start: ## Iniciar ambas aplicaciones en background
	@echo "$(GREEN)Iniciando Transcribe App...$(NC)"
	@$(MAKE) start-backend
	@$(MAKE) start-frontend
	@echo "$(GREEN)✅ Ambas aplicaciones iniciadas$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5175$(NC)"
	@echo "$(YELLOW)Backend API: http://localhost:8000$(NC)"

start-backend: ## Iniciar solo el backend
	@echo "$(GREEN)Iniciando backend...$(NC)"
	@cd $(BACKEND_DIR) && nohup $(BACKEND_CMD) > ../transcribe-frontend/.backend.log 2>&1 & echo $$! > ../transcribe-frontend/$(BACKEND_PID_FILE)
	@echo "$(GREEN)✅ Backend iniciado (PID: $$(cat $(BACKEND_PID_FILE)))$(NC)"

start-frontend: ## Iniciar solo el frontend
	@echo "$(GREEN)Iniciando frontend...$(NC)"
	@nohup $(FRONTEND_CMD) > .frontend.log 2>&1 & echo $$! > $(FRONTEND_PID_FILE)
	@echo "$(GREEN)✅ Frontend iniciado (PID: $$(cat $(FRONTEND_PID_FILE)))$(NC)"

stop: ## Detener ambas aplicaciones
	@echo "$(RED)Deteniendo aplicaciones...$(NC)"
	@$(MAKE) stop-backend
	@$(MAKE) stop-frontend
	@echo "$(GREEN)✅ Aplicaciones detenidas$(NC)"

stop-backend: ## Detener solo el backend
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		PID=$$(cat $(BACKEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			kill $$PID && echo "$(GREEN)✅ Backend detenido (PID: $$PID)$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  Backend ya estaba detenido$(NC)"; \
		fi; \
		rm -f $(BACKEND_PID_FILE); \
	else \
		echo "$(YELLOW)⚠️  No se encontró archivo PID del backend$(NC)"; \
	fi

stop-frontend: ## Detener solo el frontend
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		PID=$$(cat $(FRONTEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			kill $$PID && echo "$(GREEN)✅ Frontend detenido (PID: $$PID)$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  Frontend ya estaba detenido$(NC)"; \
		fi; \
		rm -f $(FRONTEND_PID_FILE); \
	else \
		echo "$(YELLOW)⚠️  No se encontró archivo PID del frontend$(NC)"; \
	fi

restart: ## Reiniciar ambas aplicaciones
	@echo "$(YELLOW)Reiniciando aplicaciones...$(NC)"
	@$(MAKE) stop
	@sleep 2
	@$(MAKE) start

status: ## Mostrar estado de las aplicaciones
	@echo "$(GREEN)Estado de Transcribe App:$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@if [ -f $(BACKEND_PID_FILE) ]; then \
		PID=$$(cat $(BACKEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "  ✅ Ejecutándose (PID: $$PID)"; \
			echo "  🌐 API: http://localhost:8000"; \
			@curl -s http://localhost:8000/health > /dev/null 2>&1 && echo "  🟢 Health check: OK" || echo "  🔴 Health check: FAILED"; \
		else \
			echo "  ❌ Detenido (archivo PID obsoleto)"; \
		fi; \
	else \
		echo "  ❌ Detenido (sin archivo PID)"; \
	fi
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@if [ -f $(FRONTEND_PID_FILE) ]; then \
		PID=$$(cat $(FRONTEND_PID_FILE)); \
		if ps -p $$PID > /dev/null 2>&1; then \
			echo "  ✅ Ejecutándose (PID: $$PID)"; \
			echo "  🌐 App: http://localhost:5175"; \
		else \
			echo "  ❌ Detenido (archivo PID obsoleto)"; \
		fi; \
	else \
		echo "  ❌ Detenido (sin archivo PID)"; \
	fi

logs: ## Mostrar logs de ambas aplicaciones
	@echo "$(GREEN)Logs del Backend:$(NC)"
	@echo "=================="
	@tail -n 20 .backend.log 2>/dev/null || echo "No hay logs del backend"
	@echo ""
	@echo "$(GREEN)Logs del Frontend:$(NC)"
	@echo "==================="
	@tail -n 20 .frontend.log 2>/dev/null || echo "No hay logs del frontend"

logs-backend: ## Mostrar solo logs del backend
	@echo "$(GREEN)Logs del Backend:$(NC)"
	@tail -f .backend.log 2>/dev/null || echo "No hay logs del backend"

logs-frontend: ## Mostrar solo logs del frontend
	@echo "$(GREEN)Logs del Frontend:$(NC)"
	@tail -f .frontend.log 2>/dev/null || echo "No hay logs del frontend"

clean: ## Limpiar archivos temporales y logs
	@echo "$(YELLOW)Limpiando archivos temporales...$(NC)"
	@rm -f $(BACKEND_PID_FILE) $(FRONTEND_PID_FILE)
	@rm -f .backend.log .frontend.log
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

dev-backend: ## Modo desarrollo: solo backend (foreground)
	@echo "$(GREEN)Modo desarrollo - Backend (foreground)$(NC)"
	@cd $(BACKEND_DIR) && $(BACKEND_CMD)

dev-frontend: ## Modo desarrollo: solo frontend (foreground)
	@echo "$(GREEN)Modo desarrollo - Frontend (foreground)$(NC)"
	@$(FRONTEND_CMD)

dev-all: ## Modo desarrollo: ambas aplicaciones (foreground)
	@echo "$(GREEN)Modo desarrollo - Ambas aplicaciones$(NC)"
	@echo "$(YELLOW)Usa Ctrl+C para detener ambas$(NC)"
	@cd $(BACKEND_DIR) && $(BACKEND_CMD) & \
	cd $(FRONTEND_DIR) && $(FRONTEND_CMD) & \
	wait

build: ## Compilar aplicación para producción
	@echo "$(GREEN)Compilando aplicación para producción...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Build completado en ./dist$(NC)"

preview: ## Previsualizar build de producción localmente
	@echo "$(GREEN)Previsualizando build de producción...$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:4173$(NC)"
	@npm run preview

prod: ## Modo producción: compilar y servir
	@echo "$(GREEN)Modo producción - Compilando y sirviendo$(NC)"
	@$(MAKE) build
	@$(MAKE) preview

# Comando por defecto
.DEFAULT_GOAL := help
