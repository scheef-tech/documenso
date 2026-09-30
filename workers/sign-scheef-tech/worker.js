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
      .on("head", { element(el) { el.append(UMAMI_TAG, { html: true }); el.append(TITLE_FIX, { html: true }); } })
      .on("title", { text(t) { if (t.text.includes("Team Abfindung")) t.replace(t.text.replace(/Team Abfindung/g, "scheef.tech")); } })
      .on('meta[content*="Team Abfindung"]', { element(el){ var c=el.getAttribute("content"); if(c) el.setAttribute("content", c.replace(/Team Abfindung/g,"scheef.tech")); } })
      .transform(res);
  } catch (e) { return res; }
}
