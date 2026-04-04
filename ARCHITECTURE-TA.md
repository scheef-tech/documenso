# Documenso Fork — Team Abfindung Customizations

## What This Is

A fork of [Documenso](https://github.com/documenso/documenso) (open-source document signing) with Team Abfindung branding and workflow customizations. The `team-abfindung` branch contains all changes.

## How It's Used

Team Abfindung uses this for automated contract signing:
1. Lead enters the GHL pipeline
2. When moved to "Send contract", the team-abfindung-app creates a document from a template via the API
3. Client signs first, then Team Abfindung countersigns (sequential signing)
4. All emails are S/MIME signed via the smime-relay

## Customizations (vs upstream Documenso)

### Branding
- **Accent color**: `#A2E771` (Documenso green) → `#009a76` (Team Abfindung green)
- **Button text**: black → white (for contrast on dark green)
- **Footer**: "powered by Documenso" removed
- **Logo + images**: Served from Cloudflare CDN (`imagedelivery.net`) instead of self-hosted URLs

### Email
- **BCC**: All signing-related emails BCC'd to `dev@team-abfindung.de`
- **S/MIME**: Emails route through smime-relay for S/MIME signing
- **SMTP**: Points to `smime-relay:2525` (internal Docker network), not directly to SES

### Translations
- German: "Sign" → "signieren" (recipient role action verb)
- German: "View Document to sign" → "Dokument signieren" (button text)

### Database Settings (not in code)
- User display name: "Team Abfindung" (not personal name)
- User email: info@team-abfindung.de
- Signup disabled (`NEXT_PUBLIC_DISABLE_SIGNUP=true`)
- Branding logo stored as BYTES_64 JSON in TeamGlobalSettings
- NAME and DATE fields on templates set to `readOnly: true`
- `includeSenderDetails: false` (hides personal email in signing emails)

## File Changes

| File | Change |
|------|--------|
| `packages/tailwind-config/index.cjs` | Accent color |
| `packages/email/template-components/template-document-invite.tsx` | White button text |
| `packages/email/template-components/template-footer.tsx` | Remove powered-by |
| `packages/email/templates/*.tsx` | color-scheme meta (light only) |
| `packages/lib/translations/de/web.po` | German translation fixes |
| `packages/lib/jobs/definitions/emails/send-signing-email.handler.ts` | BCC |
| `packages/lib/jobs/definitions/emails/send-recipient-signed-email.handler.ts` | BCC |
| `packages/lib/server-only/document/send-completed-email.ts` | BCC |
| `packages/lib/server-only/document/send-pending-email.ts` | BCC |

## Compiled JS Patches

Some changes can't be done at the TypeScript source level because the Docker image uses pre-compiled JS. The `patches/apply-patches.sh` script runs at Docker build time to patch the compiled files:

- German translations in compiled `web.mjs`
- Accent color in compiled tailwind config
- Button text color in compiled invite template
- Powered-by removal in compiled footer
- BCC in compiled email handlers
- CDN image URLs replacing dynamic API/static paths

## Build & Deploy

```
Push to team-abfindung branch
    ↓
GitHub Actions: .github/workflows/build-ta.yml
    ↓
Builds Dockerfile.ta (extends official image with patches)
    ↓
Pushes to ghcr.io/scheef-tech/documenso-ta:latest (linux/arm64)
    ↓
Restarts Coolify service (jpr8zbzp28w192sqbn926kbr)
```

The `Dockerfile.ta` extends `documenso/documenso:v1.12.10`, copies the modified tailwind config and translations, then runs the patch script for compiled JS changes.

## Infrastructure

- **URL**: https://sign.team-abfindung.de (also sign.scheef.tech)
- **Server**: platypuss (128.140.81.61, ARM/CAX41)
- **Coolify**: Service `jpr8zbzp28w192sqbn926kbr` with bundled PostgreSQL
- **Template**: ID 3 (Prozessfinanzierungsvertrag & Widerrufsbelehrung)
- **API token**: Stored in team-abfindung-app's Cloudflare Worker secrets

## Upstream Sync

To pull upstream Documenso updates:
```bash
git remote add upstream https://github.com/documenso/documenso.git
git fetch upstream
git checkout team-abfindung
git merge upstream/v1.x.x  # merge the new version tag
# Resolve conflicts in patched files
# Update Dockerfile.ta base image version
git push
```
