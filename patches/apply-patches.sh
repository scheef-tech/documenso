#!/bin/sh
# Apply Team Abfindung customizations to compiled Documenso build.
# Source-level changes (tailwind config, translations .po) are copied in Dockerfile.
# This script patches the compiled JS files that can't be overridden by file copy.
set -e

BUILD="/app/apps/remix/build/server/hono/packages"

echo "Applying Team Abfindung patches to compiled JS..."

# 1. German translations in compiled .mjs (Sign → signieren, button text)
echo "[1] Patching compiled German translations..."
TRANS="$BUILD/lib/translations/de/web.mjs"
if [ -f "$TRANS" ]; then
  sed -i 's/Lb3SXn\\":\[\\"Sign\\"]/Lb3SXn\\":\[\\"signieren\\"]/g' "$TRANS"
  sed -i 's/\\"View Document to sign\\"/\\"Dokument signieren\\"/g' "$TRANS"
  sed -i 's/\\"View Document to approve\\"/\\"Dokument genehmigen\\"/g' "$TRANS"
  sed -i 's/\\"View Document to assist\\"/\\"Dokument ansehen\\"/g' "$TRANS"
  echo "  OK"
fi

# 2. Accent color in compiled tailwind config + hardcoded email colors
echo "[2] Patching compiled accent color..."
TAILWIND="/app/packages/tailwind-config/index.cjs"
if [ -f "$TAILWIND" ]; then
  sed -i "s/#A2E771/#009a76/g" "$TAILWIND"
  echo "  OK: tailwind config"
fi
# Also fix hardcoded #7AC455 in compiled email templates
for tmpl in "$BUILD"/email/template-components/*.js; do
  if [ -f "$tmpl" ] && grep -q '7AC455' "$tmpl"; then
    sed -i 's/#7AC455/#009a76/g' "$tmpl"
    echo "  OK: $(basename "$tmpl")"
  fi
done

# 3. Button text color (text-black → text-white) in ALL email templates
echo "[3] Patching compiled button text color..."
for tmpl in "$BUILD"/email/template-components/*.js "$BUILD"/email/templates/*.js; do
  if [ -f "$tmpl" ] && grep -q 'text-black no-underline' "$tmpl"; then
    sed -i 's/text-black no-underline/text-white no-underline/g' "$tmpl"
    echo "  OK: $(basename "$tmpl")"
  fi
done

# 4. Remove powered-by footer
echo "[4] Removing compiled powered-by footer..."
FOOTER="$BUILD/email/template-components/template-footer.js"
if [ -f "$FOOTER" ]; then
  sed -i 's/isDocument && !branding.brandingHidePoweredBy &&/false \&\&/g' "$FOOTER"
  echo "  OK"
fi

# 5. BCC on all email handlers
echo "[5] Adding BCC to compiled email handlers..."
for handler in \
  "$BUILD/lib/jobs/definitions/emails/send-signing-email.handler.js" \
  "$BUILD/lib/jobs/definitions/emails/send-recipient-signed-email.handler.js" \
  "$BUILD/lib/server-only/document/send-completed-email.js" \
  "$BUILD/lib/server-only/document/send-pending-email.js"
do
  if [ -f "$handler" ]; then
    sed -i 's/from: senderEmail,/from: senderEmail,\n      bcc: "dev@team-abfindung.de",/g' "$handler"
    echo "  OK: $(basename "$handler")"
  fi
done

# 6. Replace image URLs with Cloudflare CDN URLs
echo "[6] Patching image URLs to Cloudflare CDN..."
DOC_IMG="$BUILD/email/template-components/template-document-image.js"
if [ -f "$DOC_IMG" ]; then
  sed -i "s|getAssetUrl('/static/document.png')|'https://imagedelivery.net/coO5-ODUTOt3Xy0qRkHGhQ/ta-email-document/public'|g" "$DOC_IMG"
  echo "  OK: document image"
fi
for tmpl in "$BUILD"/email/templates/*.js; do
  if [ -f "$tmpl" ]; then
    sed -i "s|src: branding.brandingLogo|src: 'https://imagedelivery.net/coO5-ODUTOt3Xy0qRkHGhQ/ta-email-logo/public'|g" "$tmpl"
  fi
done
echo "  OK: branding logo"

# 7. Fix signing page logo dimensions (wide logo, not square)
echo "[7] Patching signing page logo dimensions..."
SIGNING="$BUILD/../assets/server-build-*.js"
for f in $SIGNING; do
  if [ -f "$f" ] && grep -q 'h-12 w-12' "$f"; then
    sed -i 's/h-12 w-12 md:mb-2/h-8 max-w-[200px] object-contain md:mb-2/g' "$f"
    echo "  OK: $(basename "$f")"
  fi
done

# 8. Force light mode on signing page
echo "[8] Forcing light mode on signing page..."
for f in $SIGNING; do
  if [ -f "$f" ] && grep -q '"min-h-screen"' "$f"; then
    sed -i 's/"min-h-screen"/"dark-mode-disabled min-h-screen"/g' "$f"
    echo "  OK: $(basename "$f")"
  fi
done

echo "Done!"
