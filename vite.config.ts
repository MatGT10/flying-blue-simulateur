import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Version affichée dans le pied de page : numéro de package.json, identifiant
// du commit (fourni par Vercel au déploiement, sinon lu via git) et date de build.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
function commitCourt(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  if (sha) return sha.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { cwd: dirname(fileURLToPath(import.meta.url)), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'local'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    __BUILD__: JSON.stringify(commitCourt()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
