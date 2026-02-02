import { defineConfig } from 'vite'

export default defineConfig({
 base: './',   // rutas relativas para deploy
  build: {
    outDir: 'dist'
  }
})
