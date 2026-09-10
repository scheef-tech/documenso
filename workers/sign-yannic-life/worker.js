// Edge branding patch for sign.yannic.life.
//
// The branded Documenso image still carries two TA hardcodes that no brand
// profile can reach: `apps/remix/app/utils/meta.ts` (title + meta tags) and the
// upstream favicons. This worker fixes both at the edge and injects Umami,
// mirroring `umami-inject-sign-scheef` (the same patch for sign.scheef.tech).
//
// ponytail: edge patch, not a rebuild. Delete this worker once meta.ts reads
// from @documenso/branding and the favicons are brand assets.

const UMAMI_SRC = 'https://analytics.scheef.tech/script.js';
const WEBSITE_ID = '0674e420-07c0-4ca2-a861-f3df9b749f32';
const CDN = 'https://cdn.scheef.tech/yannic';

const ICON_MAP = {
  '/favicon.ico': CDN + '/favicon.ico',
  '/favicon-16x16.png': CDN + '/fav-96.png',
  '/favicon-32x32.png': CDN + '/fav-96.png',
  '/favicon-96x96.png': CDN + '/fav-96.png',
  '/apple-touch-icon.png': CDN + '/apple-touch-icon.png',
};

// "Team Abfindung GmbH" first, so the legal-entity string doesn't become
// "Yannic Scheef GmbH".
const rebrand = (s) => s.replace(/Team Abfindung GmbH/g, 'Yannic Scheef').replace(/Team Abfindung/g, 'Yannic Scheef');

// Remix re-sets document.title from the bundled (TA) meta after hydration, so
// the SSR rewrite below is not enough on its own.
const TITLE_FIX =
  '<script>(function(){var f=function(){try{if(document.title&&document.title.indexOf("Team Abfindung")>-1)' +
  'document.title=document.title.replace(/Team Abfindung GmbH/g,"Yannic Scheef").replace(/Team Abfindung/g,"Yannic Scheef")}catch(e){}};' +
  'f();document.addEventListener("DOMContentLoaded",f);' +
  'try{new MutationObserver(f).observe(document.documentElement,{subtree:true,childList:true,characterData:true})}catch(e){}' +
  'setInterval(f,1000)})();<\/script>';

const UMAMI_TAG = '<script defer src="' + UMAMI_SRC + '" data-website-id="' + WEBSITE_ID + '"></scr' + 'ipt>';

export default {
  async fetch(request) {
    const icon = ICON_MAP[new URL(request.url).pathname];
    if (icon) return Response.redirect(icon, 302);

    const res = await fetch(request);
    try {
      if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
      return new HTMLRewriter()
        .on('head', {
          element(el) {
            el.append(UMAMI_TAG, { html: true });
            el.append(TITLE_FIX, { html: true });
          },
        })
        .on('title', {
          text(t) {
            if (t.text.includes('Team Abfindung')) t.replace(rebrand(t.text));
          },
        })
        .on('meta[content*="Team Abfindung"]', {
          element(el) {
            const c = el.getAttribute('content');
            if (c) el.setAttribute('content', rebrand(c));
          },
        })
        .transform(res);
    } catch (e) {
      return res;
    }
  },
};
