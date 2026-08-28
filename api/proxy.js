export const config = {
  runtime: 'edge', // 使用 Edge 运行环境，速度极快
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const url = new URL(req.url);
  // 目标转发给 Groq
  const targetUrl = new URL(url.pathname.replace(/^\/openai/, '') + url.search, 'https://api.groq.com/openai');

  const headers = new Headers();
  const allowedHeaders = ['authorization', 'content-type', 'accept'];
  for (const [key, value] of req.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  headers.set('User-Agent', 'OpenAI/Node-SDK/1.0.0');

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}