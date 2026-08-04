export async function onRequest(context) {
  const { request, next, env } = context;

  // First, try to fetch the actual file requested (e.g., image.png, main.js)
  const response = await next();

  // If the file is not found (404), serve index.html instead
  if (response.status === 404) {
    return env.ASSETS.fetch(new URL("/", request.url));
  }

  return response;
}
