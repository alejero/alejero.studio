// alejero.studio Cloudflare Worker
// Serves alejero.studio and www.alejero.studio from static assets.
// All *.alejero.studio subdomains (invitations product) are handled
// by the separate invitations-alejero-studio Worker.

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
