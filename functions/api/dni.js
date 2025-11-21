const ALLOWED_METHODS = 'GET, OPTIONS';
const ALLOWED_HEADERS = 'X-API-Token, Authorization, Content-Type';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return json({ error: 'Método no permitido' }, 405);
  }

  const { searchParams } = new URL(request.url);
  const numero = searchParams.get('numero');
  if (!numero) {
    return json({ error: 'Falta el parámetro numero' }, 400);
  }

  const token =
    request.headers.get('X-API-Token') ||
    request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
    env.DECOLECTA_TOKEN;

  if (!token) {
    return json({ error: 'Token no proporcionado' }, 401);
  }

  const upstreamUrl = `https://api.decolecta.com/v1/reniec/dni?numero=${encodeURIComponent(numero)}`;

  try {
    const upstreamResp = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': token,
        Accept: 'application/json'
      }
    });

    const body = await upstreamResp.text();
    const headers = {
      ...corsHeaders(),
      'Content-Type': upstreamResp.headers.get('content-type') || 'application/json'
    };
    return new Response(body, { status: upstreamResp.status, headers });
  } catch (err) {
    return json({ error: 'Error al consultar la API', detail: err.message }, 502);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}
