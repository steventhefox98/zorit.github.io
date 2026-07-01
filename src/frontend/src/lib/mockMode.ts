import env from "../../env.json";

/**
 * Mock-mode detection for the ZoritLegands SPA.
 *
 * When the canister configuration in `env.json` is unavailable (the string
 * "undefined" or any other falsy value), the app cannot reach a real backend.
 * In that case we fall back to the in-memory mock backend
 * (`src/frontend/src/mocks/backend.ts`) so the SPA still renders with sample
 * data and a logged-in admin session — useful for static hosting (Vercel, etc.)
 * outside the Internet Computer sandbox.
 *
 * The real canister code path remains untouched: when `env.json` has real
 * canister values, `isMockMode()` returns false and `useActor(createActor)` is
 * used as before.
 */

type EnvShape = {
  backend_canister_id?: string;
  backend_host?: string;
};

const envConfig = env as EnvShape;

function canisterConfigured(value: string | undefined): boolean {
  if (!value) return false;
  if (value === "undefined") return false;
  return true;
}

/**
 * Stable boolean computed once at module load. True when the canister is
 * unavailable and the mock backend should be used.
 */
export const MOCK_MODE: boolean = !canisterConfigured(
  envConfig.backend_canister_id,
);

export function isMockMode(): boolean {
  return MOCK_MODE;
}

/**
 * Username the mock backend treats as the logged-in admin. The mock's
 * `login()` ignores credentials and always returns `Role.Administrator`, and
 * the sample roster/directory data uses "Steven" as the admin owner, so we
 * mirror that here for a consistent session.
 */
export const MOCK_ADMIN_USERNAME = "Steven";
