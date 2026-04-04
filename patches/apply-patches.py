#!/usr/bin/env python3
"""
Apply Team Abfindung customizations to the Documenso build.

Patches:
1. German translations (Sign → signieren, button text)
2. Brand accent color (#A2E771 → #009a76)
3. White button text (text-black → text-white)
4. Remove "powered by Documenso" from email footer
5. BCC dev@team-abfindung.de on all outgoing emails
"""

import os
import glob

BASE = "/app"
BUILD = f"{BASE}/apps/remix/build/server/hono/packages"


def patch_file(path, replacements):
    """Apply string replacements to a file."""
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        return False
    with open(path, "r") as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(path, "w") as f:
            f.write(content)
        print(f"  OK: {path}")
        return True
    print(f"  NO CHANGE: {path}")
    return False


def patch_translations():
    """Patch German translations in compiled .mjs file."""
    print("\n[1] Patching German translations...")
    path = f"{BUILD}/lib/translations/de/web.mjs"
    patch_file(path, [
        ('Lb3SXn\\":\\"Sign\\"]', 'Lb3SXn\\":\\"signieren\\"]'),
        ('\\"View Document to sign\\"', '\\"Dokument signieren\\"'),
        ('\\"View Document to approve\\"', '\\"Dokument genehmigen\\"'),
        ('\\"View Document to assist\\"', '\\"Dokument ansehen\\"'),
    ])


def patch_accent_color():
    """Change Documenso green to Team Abfindung brand green."""
    print("\n[2] Patching accent color...")
    path = f"{BASE}/packages/tailwind-config/index.cjs"
    patch_file(path, [
        ("#A2E771", "#009a76"),
    ])


def patch_button_text_color():
    """Change button text from black to white for better contrast on dark green."""
    print("\n[3] Patching button text color...")
    path = f"{BUILD}/email/template-components/template-document-invite.js"
    patch_file(path, [
        ("text-black no-underline", "text-white no-underline"),
    ])


def patch_remove_powered_by():
    """Remove 'powered by Documenso' footer from emails."""
    print("\n[4] Removing powered-by footer...")
    path = f"{BUILD}/email/template-components/template-footer.js"
    patch_file(path, [
        ("isDocument && !branding.brandingHidePoweredBy &&", "false &&"),
    ])


def patch_bcc():
    """Add BCC to dev@team-abfindung.de on all email sending."""
    print("\n[5] Adding BCC to email handlers...")
    patterns = [
        f"{BUILD}/lib/jobs/definitions/emails/send-signing-email.handler.js",
        f"{BUILD}/lib/jobs/definitions/emails/send-recipient-signed-email.handler.js",
        f"{BUILD}/lib/server-only/document/send-completed-email.js",
        f"{BUILD}/lib/server-only/document/send-pending-email.js",
    ]
    for path in patterns:
        patch_file(path, [
            ("from: senderEmail,", 'from: senderEmail,\n      bcc: "dev@team-abfindung.de",'),
        ])


if __name__ == "__main__":
    print("Applying Team Abfindung patches to Documenso...")
    patch_translations()
    patch_accent_color()
    patch_button_text_color()
    patch_remove_powered_by()
    patch_bcc()
    print("\nDone!")
