/**
 * Centralized Freqtrade API authentication configuration.
 *
 * Browser (dev) mode: reads credentials from environment variables (set in .env or system env),
 * falls back to Freqtrade's documented defaults for local development only.
 *
 * Electron mode: dynamically reads the live connection settings (host/port/credentials)
 * from the main process, which derives them from the user's config.json.
 *
 * IMPORTANT: Never commit real credentials to source control.
 */
export interface ApiConnectionConfig {
  apiUrl: string
  wsUrl: string
  host: string
  port: number
  username: string
  password: string
  wsToken: string
}

function getEnv(key: string, fallback: string): string {
  const envKey = `VITE_${key}`
  try {
    const env = (import.meta as unknown as { env: Record<string, string> }).env
    if (env && env[envKey]) return env[envKey]
  } catch { /* not in Vite context */ }
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[envKey]
      if (val) return val
    }
  } catch { /* not in Node context */ }
  return fallback
}

const API_USER = getEnv('FT_API_USER', 'freqtrader')
const API_PASS = getEnv('FT_API_PASS', '')
const API_HOST = getEnv('FT_API_HOST', '127.0.0.1')
const API_PORT = getEnv('FT_API_PORT', '8080')
const WS_TOKEN = getEnv('FT_WS_TOKEN', '')

export const apiAuth: {
  apiBaseUrl: string
  wsUrl: string
  wsToken: string
  basicAuthHeader: string
} = {
  apiBaseUrl: `http://${API_HOST}:${API_PORT}/api/v1`,
  wsUrl: `ws://${API_HOST}:${API_PORT}/api/v1/message/ws`,
  wsToken: WS_TOKEN,
  basicAuthHeader: 'Basic ' + btoa(`${API_USER}:${API_PASS}`),
}

export async function getConnectionConfig(): Promise<ApiConnectionConfig> {
  if (typeof window !== 'undefined' && window.electronAPI?.getApiConfig) {
    return window.electronAPI.getApiConfig()
  }
  return {
    apiUrl: apiAuth.apiBaseUrl,
    wsUrl: apiAuth.wsUrl,
    host: API_HOST,
    port: Number(API_PORT) || 8080,
    username: API_USER,
    password: API_PASS,
    wsToken: WS_TOKEN,
  }
}

export async function getApiBaseUrl(): Promise<string> {
  return (await getConnectionConfig()).apiUrl
}

export async function getWsUrl(): Promise<string> {
  return (await getConnectionConfig()).wsUrl
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cfg = await getConnectionConfig()
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${cfg.username}:${cfg.password}`),
  }
}
