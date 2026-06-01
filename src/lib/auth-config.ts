/**
 * Centralized Freqtrade API authentication configuration.
 *
 * Reads credentials from environment variables (set in .env or system env).
 * Falls back to Freqtrade's documented defaults for local development only.
 *
 * IMPORTANT: Never commit real credentials to source control.
 */
export interface ApiAuthConfig {
  apiBaseUrl: string
  wsUrl: string
  wsToken: string
  basicAuthHeader: string
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

export const apiAuth: ApiAuthConfig = {
  apiBaseUrl: `http://${API_HOST}:${API_PORT}/api/v1`,
  wsUrl: `ws://${API_HOST}:${API_PORT}/api/v1/message/ws`,
  wsToken: WS_TOKEN,
  basicAuthHeader: 'Basic ' + btoa(`${API_USER}:${API_PASS}`),
}