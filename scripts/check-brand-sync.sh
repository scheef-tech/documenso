#!/bin/sh
# Assert the committed brand config is consistent and its assets actually load.
#
# 1. packages/branding/active.json must be byte-identical to the profile it
#    names (brands/<slug>.json). Drift between the two is what let a 404 logo
#    and a missing emailHeroUrl reach the branch in the first place.
# 2. Every assets.* URL in every profile must return 2xx. A broken URL here is
#    a broken image in real signature-request mail.
#
# ponytail: jq + curl, CI-only. Kept out of the Docker build on purpose so the
# slim image keeps its no-jq guarantee (see scripts/apply-brand.sh).
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ACTIVE="$REPO_ROOT/packages/branding/active.json"
FAIL=0

SLUG="$(jq -r '.slug // empty' "$ACTIVE")"
if [ -z "$SLUG" ]; then
  echo "FAIL: packages/branding/active.json has no .slug" >&2
  exit 1
fi

PROFILE="$REPO_ROOT/brands/$SLUG.json"
if [ ! -f "$PROFILE" ]; then
  echo "FAIL: active.json names slug '$SLUG' but brands/$SLUG.json does not exist" >&2
  exit 1
fi

if diff -u "$PROFILE" "$ACTIVE"; then
  echo "ok: active.json == brands/$SLUG.json"
else
  echo "FAIL: active.json has drifted from brands/$SLUG.json (diff above)." >&2
  echo "      Re-run: scripts/apply-brand.sh $SLUG" >&2
  FAIL=1
fi

for f in "$REPO_ROOT"/brands/*.json; do
  name="$(basename "$f")"
  jq -r '.assets | to_entries[] | "\(.key)\t\(.value)"' "$f" | while IFS="$(printf '\t')" read -r key url; do
    [ -n "$url" ] || continue
    code="$(curl -sSL -o /dev/null -w '%{http_code}' --max-time 20 "$url" || echo 000)"
    case "$code" in
      2*) echo "ok: $name $key -> $code" ;;
      *)  echo "FAIL: $name $key -> HTTP $code  $url" >&2; exit 1 ;;
    esac
  done || FAIL=1
done

[ "$FAIL" = 0 ] || exit 1
echo "brand config OK"
