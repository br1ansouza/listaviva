interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_HEALTH_URL: string;
  RENDER_SERVICE_ID: string;
  RENDER_API_KEY: string;
}

interface RenderDeployEntry {
  deploy: { createdAt: string };
}

type RescueOutcome = 'api_respondendo' | 'deploy_recente' | 'deploy_disparado' | 'falha_render';

const WAKE_PATH = '/wake';
const HEALTH_TIMEOUT = 15_000;
const REDEPLOY_COOLDOWN = 15 * 60_000;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== WAKE_PATH) return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return new Response(null, { status: 405 });

    return Response.json({ status: await rescueApi(env) });
  },
};

async function rescueApi(env: Env): Promise<RescueOutcome> {
  if (await apiAnswers(env)) return 'api_respondendo';
  if (await recentDeployExists(env)) return 'deploy_recente';

  const response = await fetch(renderDeploysUrl(env), {
    method: 'POST',
    headers: renderHeaders(env),
    body: JSON.stringify({ clearCache: 'do_not_clear' }),
  });

  return response.ok ? 'deploy_disparado' : 'falha_render';
}

async function apiAnswers(env: Env): Promise<boolean> {
  try {
    const response = await fetch(env.API_HEALTH_URL, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function recentDeployExists(env: Env): Promise<boolean> {
  const response = await fetch(`${renderDeploysUrl(env)}?limit=1`, {
    headers: renderHeaders(env),
  });
  if (!response.ok) return true;

  const [latest] = (await response.json()) as RenderDeployEntry[];
  if (!latest) return false;

  return Date.now() - Date.parse(latest.deploy.createdAt) < REDEPLOY_COOLDOWN;
}

function renderDeploysUrl(env: Env): string {
  return `https://api.render.com/v1/services/${env.RENDER_SERVICE_ID}/deploys`;
}

function renderHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.RENDER_API_KEY}`,
    'Content-Type': 'application/json',
  };
}
