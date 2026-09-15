# Branding

This fork is set up so a single deployment can be re-branded by swapping a
JSON profile — no source edits, no patches directory, no whack-a-mole hex
literals scattered across templates.

## The shape

```
brands/
├── team-abfindung.json           One profile per deployment.
├── scheef-tech.json
└── README.md

packages/branding/
├── active.json                   Active profile (committed default = TA).
├── src/types.ts                  Brand type definition.
├── src/profile.ts                Reads active.json, exports BRAND.
├── src/palette.ts                Generates 50–950 scale from hex anchor.
├── src/index.ts                  Public exports.
└── index.cjs                     CJS shim so tailwind-config can read it.

scripts/apply-brand.sh            One-shot: cp brands/<slug>.json over
                                   active.json + sed theme.css HSL vars.

Dockerfile.branded                 Build a brand-specific image via
                                   --build-arg BRAND_PROFILE=<slug>.
Dockerfile.ta                      Older path, kept until scheef.tech build
                                   validates Dockerfile.branded.
```

## What a brand profile owns

- Name, legal name, slug (for IDs / cert / footer / metadata).
- Primary color: hex anchor + HSL components + foreground.
- Optional explicit 50–950 palette (otherwise auto-generated).
- Logos, favicon, Open Graph image URLs.
- PKCS#12 cert identity (org name, country, locality, email).
- Email: from-name + from-address, BCC list, footer toggle, subject overrides.
- HTML metadata: title, description, author, robots, locale.
- Support: email + URL shown in templates.

Schema: `packages/branding/src/types.ts`.

## Adding a new brand

```bash
cp brands/team-abfindung.json brands/<slug>.json
$EDITOR brands/<slug>.json
scripts/apply-brand.sh <slug>          # verify locally
npm run build                          # confirm it builds
docker build -f Dockerfile.branded \
  --build-arg BRAND_PROFILE=<slug> \
  --platform=linux/arm64 \
  -t documenso-<slug> .
```

Then point your Coolify / Compose to the new tag, set per-deploy env (DB URL,
SMTP creds, encryption keys), done.

## How it threads through the codebase

| Surface             | Where it reads from                                | How it's wired                                                                                   |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tailwind classes    | `packages/branding/index.cjs` (CJS shim)           | `tailwind-config/index.cjs` builds `brand-*` palette from `BRAND.colors.primaryHex`              |
| App TypeScript      | `import { BRAND } from '@documenso/branding'`      | Components use `BRAND.name`, `BRAND.assets.logoUrl`, etc.                                        |
| CSS variables       | `packages/ui/styles/theme.css`                     | `apply-brand.sh` rewrites `--primary` / `--primary-foreground` / `--ring` HSL values             |
| PDF signing cert    | `CERT_INFO_*` env vars                             | `Dockerfile.branded` extracts cert fields from JSON at image build, sources them at container start |
| Email subjects/BCC  | `BRAND.email.*`                                    | Handlers in `packages/lib/jobs/definitions/emails/` (see "Deferred" below)                       |
| HTML metadata       | `BRAND.metadata.*`                                 | `apps/remix/app/utils/meta.ts` (see "Deferred" below)                                            |

## Deferred to follow-up PRs

This PR is the **foundation**: branding package, Tailwind wiring, apply
script, profiles, leak fixes (`#7AC455` and `#009a76` hex literals →
`text-brand`). What still needs migration to the new system, by category:

- **`apps/remix/app/utils/meta.ts`** — currently hardcoded for Team
  Abfindung. Migrate to `BRAND.metadata`.
- **`apps/remix/app/components/general/background.tsx`** — has two
  hardcoded greens (`#79B9A7`, `#B6D2C4`) in a decorative SVG gradient.
- **Email handlers** in `packages/lib/jobs/definitions/emails/` and
  `packages/lib/server-only/document/send-*.ts` — custom subjects and BCC
  are currently in-code for TA, migrate to `BRAND.email`.
- **Email templates** in `packages/email/templates/` — `alt="Documenso Logo"`,
  footer "Documenso, Inc.", welcome / invite copy that says "...on
  Documenso". These are inside `<Trans>` macros, so a clean refactor needs
  re-extracting Lingui catalogs (`npm run translate:extract`) and updating
  the German `.po` files. Out of scope here to keep this PR reviewable.
- **`apps/remix/app/utils/meta.ts`** title template hardcoded for TA.

The fork stays functional as a TA-branded build through all of the above —
the visible leaks are gone, the architecture is in place, and the
follow-ups can land one at a time without blocking the scheef.tech rollout.

## scheef.tech deployment

After this PR merges, the scheef.tech instance is one workflow file away:

1. Confirm `brands/scheef-tech.json` values (primary color, logo URLs).
2. Upload logo + favicon assets to `cdn.scheef.tech/scheef-tech/`.
3. Add `.github/workflows/build-st.yml` that mirrors `build-ta.yml` but
   builds `Dockerfile.branded` with `BRAND_PROFILE=scheef-tech` and pushes
   to `ghcr.io/scheef-tech/documenso-st`.
4. New Coolify service on platypuss with its own Postgres DB + domain
   `sign.scheef.tech`.

## Why JSON profiles, not env vars

Brand profiles are large structured objects with nested fields, optional
sections, and explicit palette overrides. Flattening to env vars
(`BRAND_NAME`, `BRAND_COLORS_PRIMARYHEX`, `BRAND_ASSETS_LOGO_URL`...) means
~30 env vars per deploy, easy to drift between staging and prod, and no
type checking. JSON files in-repo are version-controlled, diffable, and
type-checked against `Brand` at compile time.
