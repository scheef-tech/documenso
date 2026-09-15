# Brand profiles

Each `*.json` file in this directory is a complete brand profile that drives
every user-facing surface of the Documenso build: UI colors, email templates,
PDF cert identity, HTML metadata, favicons, footers.

## Applying a profile at build time

```bash
scripts/apply-brand.sh <slug>
```

That copies `brands/<slug>.json` to `packages/branding/active.json` (which the
TypeScript module and the Tailwind CJS shim both read) and patches
`packages/ui/styles/theme.css` with the profile's primary HSL.

## Adding a new brand

1. Copy an existing profile: `cp brands/team-abfindung.json brands/<slug>.json`
2. Edit values — see `packages/branding/src/types.ts` for the full schema.
3. (Optional) Drop a wide-format logo + favicon into
   `apps/remix/public/static/` and reference them in `assets.*Url`.
4. Verify: `scripts/apply-brand.sh <slug> && npm run build`
5. Build the Docker image:
   `docker build -f Dockerfile.branded --build-arg BRAND_PROFILE=<slug> .`

## Schema

See `packages/branding/src/types.ts` for the authoritative type. JSON profiles
are validated against it at TypeScript compile time (the profile module imports
the JSON and casts to `Brand`).

## What is NOT a brand-profile concern

- SMTP / SES config (per-environment, not per-brand)
- Database connection strings
- Encryption keys
- Feature flags / billing / signing keys

Those stay in environment variables, separate from brand identity.
