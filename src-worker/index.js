/**
 * MiSub - Cloudflare Worker entry point
 *
 * This replaces the Pages Functions entry (`functions/[[path]].js`) for a
 * plain Workers deployment. The routing/business logic in `onRequest` is
 * reused as-is; this file just adapts the Worker `fetch`/`scheduled`
 * contract to the shape that `onRequest(context)` expects, and serves
 * static assets via the Workers Assets binding instead of Pages' automatic
 * asset serving.
 */
import { onRequest } from '../functions/[[path]].js';
import { handleCronTrigger } from '../functions/modules/notifications.js';

export default {
  async fetch(request, env, ctx) {
    // Pages Functions context shape: { request, env, params, next, waitUntil, ... }
    // `next()` in Pages falls through to static-asset serving. On Workers,
    // static assets are served via the `ASSETS` binding, which the existing
    // code already checks for first (see fetchStaticAsset in [[path]].js).
    // We still provide a `next` that mirrors that behavior for any code path
    // that calls it directly, so nothing has to change in [[path]].js.
    const context = {
      request,
      env,
      params: {},
      waitUntil: (p) => ctx.waitUntil(p),
      passThroughOnException: () => ctx.passThroughOnException?.(),
      next: async () => {
        if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
        return new Response('Not Found', { status: 404 });
      },
    };

    return onRequest(context);
  },

  // Native Cron Trigger — replaces the external `/cron?secret=...` workaround
  // that Pages' free tier needed (it has no built-in Cron Triggers). Configure
  // the actual schedule(s) in wrangler.toml under [triggers].
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCronTrigger(env));
  },
};
