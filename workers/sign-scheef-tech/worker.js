const UMAMI_SRC = "https://analytics.scheef.tech/script.js";
const WEBSITE_ID = "7d9fc686-6a30-474d-bf2f-7791448e44c2";
const CDN = "https://cdn.scheef.tech/scheef-tech";
const ICON_MAP = {
  "/favicon.ico": CDN + "/favicon.ico",
  "/favicon-32x32.png": CDN + "/favicon-96x96.png",
  "/favicon-16x16.png": CDN + "/favicon-96x96.png",
  "/favicon-96x96.png": CDN + "/favicon-96x96.png",
  "/apple-touch-icon.png": CDN + "/apple-touch-icon.png"
};
const TITLE_FIX = '<script>(function(){var R=function(t){return t.replace(/Team Abfindung/g,"scheef.tech")};var f=function(){try{if(document.title&&document.title.indexOf("Team Abfindung")>-1)document.title=R(document.title)}catch(e){}};f();document.addEventListener("DOMContentLoaded",f);try{new MutationObserver(f).observe(document.documentElement,{subtree:true,childList:true,characterData:true})}catch(e){}setInterval(f,1000)})();<\/script>';
// PostHog: cookieless (no consent banner on this site, same posture as Umami). Hostname-gated.
const POSTHOG_TAG = '<script>(function(){var h=location.hostname;if(h!=="sign.scheef.tech"&&h!=="www.sign.scheef.tech")return;!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister identify alias set_config reset opt_in_capturing opt_out_capturing has_opted_out_capturing get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init("phc_BVw6ZdkeHo36vnVgbcuQCjzvGz3FHrzLJEgdEGkeGRDF",{api_host:"https://us.i.posthog.com",persistence:"memory",disable_session_recording:true,autocapture:true,capture_pageview:"history_change",capture_pageleave:true,before_send:function(ev){var R=function(v){return typeof v=="string"?v.split(/[?#]/)[0].replace(/\\/[A-Za-z0-9_-]{16,}/g,"/:token"):v};if(ev&&ev.properties){["$current_url","$pathname","$referrer","$prev_pageview_pathname"].forEach(function(k){ev.properties[k]=R(ev.properties[k])})}return ev}})})();<\/script>';
const UMAMI_TAG = '<script defer src="' + UMAMI_SRC + '" data-website-id="' + WEBSITE_ID + '"></scr'+'ipt>';
addEventListener("fetch", (event) => { event.respondWith(handle(event.request)); });
async function handle(request) {
  const url = new URL(request.url);
  const icon = ICON_MAP[url.pathname];
  if (icon) return Response.redirect(icon, 302);
  const res = await fetch(request);
  try {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return res;
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(UMAMI_TAG, { html: true }); el.append(TITLE_FIX, { html: true }); el.append(POSTHOG_TAG, { html: true }); } })
      .on("title", { text(t) { if (t.text.includes("Team Abfindung")) t.replace(t.text.replace(/Team Abfindung/g, "scheef.tech")); } })
      .on('meta[content*="Team Abfindung"]', { element(el){ var c=el.getAttribute("content"); if(c) el.setAttribute("content", c.replace(/Team Abfindung/g,"scheef.tech")); } })
      .transform(res);
  } catch (e) { return res; }
}
