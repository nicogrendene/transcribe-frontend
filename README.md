# transcribe-frontend

Frontend React con shadcn/ui y Tailwind CSS para consumir la API de transcribe-api.

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📦 Tecnologías

- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **Lucide React** para iconos

## ⚙️ Configuración

- **API por defecto**: http://localhost:8000
- **Configuración por URL**: `?api=http://IP:8000`
- **Ruta de videos**: Configurada en `src/App.tsx` (const VIDEO_BASE)

## 🎯 Funcionalidades

- ✅ Búsqueda de transcripciones con IA
- ✅ Reproductor de video integrado
- ✅ Navegación temporal en videos
- ✅ Lista dinámica de videos
- ✅ Diseño responsive
- ✅ Estados de carga y manejo de errores

## 📁 Estructura

```
src/
├── components/ui/     # Componentes de shadcn/ui
├── lib/              # Utilidades
├── types/            # Tipos TypeScript
├── App.tsx           # Componente principal
└── main.tsx          # Punto de entrada
```