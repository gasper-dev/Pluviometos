import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',         // raíz del proyecto
  base: './',        // importante para despliegues, rutas relativas
  build: {
    outDir: 'dist',  // carpeta de salida del build
    rollupOptions: {
      // normalmente no necesitas external aquí
      // si quieres excluir librerías externas, se hace aquí
      // external: ['vue'] 
    }
  }
})
