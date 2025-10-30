# Makefile para Transcribe Frontend
# Aplicación de transcripción de videos con búsqueda semántica

.PHONY: help install dev build preview clean

# Variables
PREVIEW_PORT = 4173

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

help: ## Mostrar ayuda
	@echo "$(GREEN)Transcribe Frontend - Comandos disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Instalar dependencias
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	@npm install
	@echo "$(GREEN)Dependencias instaladas$(NC)"

dev: ## Ejecutar en modo desarrollo
	@npm run dev

build: ## Construir aplicación para producción
	@echo "$(GREEN)Construyendo aplicación...$(NC)"
	@npm run build
	@echo "$(GREEN)Aplicación construida en ./dist$(NC)"

clean: ## Limpiar archivos temporales
	@echo "$(YELLOW)Limpiando archivos temporales...$(NC)"
	@rm -f transcribe-frontend.tar.gz
	@rm -rf dist/
	@find . -name "._*" -delete
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# Comando por defecto
.DEFAULT_GOAL := help