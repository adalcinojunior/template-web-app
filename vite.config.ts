import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const PORT: number = parseInt(`${env.VITE_PORT ?? '3000'}`, 10)

  return {
    plugins: [react(), svgr()],
    base: '/',
    server: {
      port: PORT,
      open: true
    },
    build: {
      outDir: 'build'
    }
  }
})