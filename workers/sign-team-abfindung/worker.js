// PostHog for sign.team-abfindung.de (TA Documenso). Cookieless, no replay, project 'web (all sites)'.
// The tag removes itself and loads PostHog after hydration, so React (18, full-document hydrate) sees an unchanged DOM.
// Signing links carry secret tokens in the path: redact long path segments + query before anything leaves the page.
const POSTHOG_TAG = '<script>(function(){var s=document.currentScript;s&&s.remove();if(location.hostname!=="sign.team-abfindung.de")return;function go(){!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",t.head.appendChild(p);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister identify alias set_config reset opt_in_capturing opt_out_capturing has_opted_out_capturing get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);var R=function(v){return typeof v=="string"?v.split(/[?#]/)[0].replace(/\\/[A-Za-z0-9_-]{16,}/g,"/:token"):v};posthog.init("phc_BVw6ZdkeHo36vnVgbcuQCjzvGz3FHrzLJEgdEGkeGRDF",{api_host:"https://us.i.posthog.com",persistence:"memory",disable_session_recording:true,autocapture:false,capture_pageview:"history_change",capture_pageleave:true,before_send:function(ev){if(ev&&ev.properties){["$current_url","$pathname","$referrer","$prev_pageview_pathname"].forEach(function(k){ev.properties[k]=R(ev.properties[k])})}return ev}})}if(document.readyState==="complete")setTimeout(go,1500);else addEventListener("load",function(){setTimeout(go,1500)})})();<\/script>';
addEventListener("fetch", (event) => { event.respondWith(handle(event.request)); });
async function handle(request) {
  const res = await fetch(request);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return res;
  try {
    return new HTMLRewriter().on("head", { element(el) { el.append(POSTHOG_TAG, { html: true }); } }).transform(res);
  } catch (e) { return res; }
}
