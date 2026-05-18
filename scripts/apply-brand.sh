#!/bin/sh
# Apply a brand profile at build time.
#
# Usage:
#   scripts/apply-brand.sh <slug>
#
# What it does:
#   1. Copies `brands/<slug>.json` to `packages/branding/active.json` — the
#      TypeScript module and the Tailwind CJS shim both read it from there.
#   2. Patches `packages/ui/styles/theme.css` to swap upstream Documenso's
#      static `--primary` HSL values with the brand's `colors.primaryHsl` and
#      `colors.primaryForegroundHsl`.
#
# Idempotent: running twice with the same slug is a no-op (the second pass
# patches an already-patched CSS, which still ends up at the right values).
#
# Defaults: if no slug is given, restores `packages/branding/active.json` to
# upstream Documenso (no theme.css revert — that's destructive, requires a
# clean checkout).
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"

if [ -z "$SLUG" ]; then
  echo "usage: scripts/apply-brand.sh <slug>" >&2
  echo "  available profiles:" >&2
  ls "$REPO_ROOT/brands"/*.json 2>/dev/null | sed 's#.*/##; s/\.json$//' | sed 's/^/    /' >&2
  exit 1
fi

PROFILE="$REPO_ROOT/brands/$SLUG.json"
if [ ! -f "$PROFILE" ]; then
  echo "error: no profile at $PROFILE" >&2
  exit 1
fi

# Step 1 — copy active profile JSON.
cp "$PROFILE" "$REPO_ROOT/packages/branding/active.json"

# Step 2 — patch theme.css. We extract the two HSL values from the profile
# using sed (avoid jq dependency in slim Docker images) and substitute.
THEME_CSS="$REPO_ROOT/packages/ui/styles/theme.css"

extract_json_string() {
  # $1 = key path, e.g. "primaryHsl"
  # Walks the colors block and pulls the first "$1": "value" match.
  sed -n "s/.*\"$1\":[[:space:]]*\"\([^\"]*\)\".*/\1/p" "$PROFILE" | head -n 1
}

PRIMARY_HSL="$(extract_json_string primaryHsl)"
PRIMARY_FG_HSL="$(extract_json_string primaryForegroundHsl)"

if [ -z "$PRIMARY_HSL" ] || [ -z "$PRIMARY_FG_HSL" ]; then
  echo "error: profile missing primaryHsl or primaryForegroundHsl" >&2
  exit 1
fi

# Replace existing brand-anchored CSS variables. We touch `--primary`,
# `--primary-foreground`, and `--ring`. Form-field-card colors are left to the
# theme's own light-tint design — saturated primary is wrong for that surface.
sed -i.bak \
  -e "s/^\([[:space:]]*\)--primary:[[:space:]]*[^;]*;/\1--primary: ${PRIMARY_HSL};/" \
  -e "s/^\([[:space:]]*\)--primary-foreground:[[:space:]]*[^;]*;/\1--primary-foreground: ${PRIMARY_FG_HSL};/" \
  -e "s/^\([[:space:]]*\)--ring:[[:space:]]*[^;]*;/\1--ring: ${PRIMARY_HSL};/" \
  "$THEME_CSS"
rm -f "${THEME_CSS}.bak"

echo "applied brand: $SLUG"
echo "  primaryHsl    = $PRIMARY_HSL"
echo "  primaryFgHsl  = $PRIMARY_FG_HSL"
echo "  active.json   = packages/branding/active.json"
echo "  theme.css     = packages/ui/styles/theme.css (patched)"
