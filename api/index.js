export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. 处理 OPTIONS 跨域预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(req.url);

  // 2. 访问根路径时返回就绪状态
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'Groq Proxy is running smoothly.' 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // 3. 自动适配请求路径（兼容 /v1/... 与 /openai/v1/...）
  let targetPath = url.pathname;
  if (targetPath.startsWith('/v1/') && !targetPath.startsWith('/openai/v1/')) {
    targetPath = '/openai' + targetPath;
  }

  const targetUrl = new URL(targetPath + url.search, 'https://api.groq.com');

  // 4. 清洗请求头
  const headers = new Headers();
  const allowedHeaders = ['authorization', 'content-type', 'accept'];
  for (const [key, value] of req.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  headers.set('Host', 'api.groq.com');
  headers.set('User-Agent', 'OpenAI/Node-SDK/1.0.0');

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Headers', '*');

    // 5. 流式输出数据校正
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            let chunk = decoder.decode(value, { stream: true });
            chunk = chunk.replace(/"content"\s*:\s*null/g, '"content":""');
            chunk = chunk.replace(/"choices"\s*:\s*\[\s*\]/g, '"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]');
            chunk = chunk.replace(/"choices"\s*:\s*null/g, '"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]');

            await writer.write(encoder.encode(chunk));
          }
        } catch (e) {
          console.error('Stream Error:', e);
        } finally {
          writer.close();
        }
      })();

      return new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
