export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // If the request is for a file (has an extension like .js, .css, .png), let it pass through
  if (url.pathname.includes('.')) {
    return next();
  }

  // Otherwise, it's a route (like /staff/login), so serve index.html
  // Cloudflare Pages will automatically find index.html in the assets
  return context.env.ASSETS.fetch(new URL('/', request.url));
}
