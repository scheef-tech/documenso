#!/bin/sh
# Apply Team Abfindung customizations to Documenso
set -e

BUILD="/app/apps/remix/build/server/hono/packages"

echo "Applying Team Abfindung patches..."

# 1. German translations
echo "[1] Patching German translations..."
TRANS="$BUILD/lib/translations/de/web.mjs"
if [ -f "$TRANS" ]; then
  sed -i 's/Lb3SXn\\":\[\\"Sign\\"]/Lb3SXn\\":\[\\"signieren\\"]/g' "$TRANS"
  sed -i 's/\\"View Document to sign\\"/\\"Dokument signieren\\"/g' "$TRANS"
  sed -i 's/\\"View Document to approve\\"/\\"Dokument genehmigen\\"/g' "$TRANS"
  sed -i 's/\\"View Document to assist\\"/\\"Dokument ansehen\\"/g' "$TRANS"
  echo "  OK"
fi

# 2. Accent color
echo "[2] Patching accent color..."
TAILWIND="/app/packages/tailwind-config/index.cjs"
if [ -f "$TAILWIND" ]; then
  sed -i "s/#A2E771/#009a76/g" "$TAILWIND"
  echo "  OK"
fi

# 3. Button text color
echo "[3] Patching button text color..."
INVITE="$BUILD/email/template-components/template-document-invite.js"
if [ -f "$INVITE" ]; then
  sed -i 's/text-black no-underline/text-white no-underline/g' "$INVITE"
  echo "  OK"
fi

# 4. Remove powered-by footer
echo "[4] Removing powered-by footer..."
FOOTER="$BUILD/email/template-components/template-footer.js"
if [ -f "$FOOTER" ]; then
  sed -i 's/isDocument && !branding.brandingHidePoweredBy &&/false \&\&/g' "$FOOTER"
  echo "  OK"
fi

# 5. BCC on all email handlers
echo "[5] Adding BCC to email handlers..."
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

echo "Done!"
