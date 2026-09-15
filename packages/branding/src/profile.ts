import activeJson from '../active.json';
import type { Brand } from './types';

/**
 * Active brand profile.
 *
 * The JSON source-of-truth is `packages/branding/active.json`. It defaults to
 * upstream Documenso values so the fork stays a drop-in replacement. To apply
 * a brand at build time:
 *
 *   scripts/apply-brand.sh <slug>     # cp brands/<slug>.json -> active.json
 *
 * Brand profiles live in `brands/<slug>.json` and are committed to the repo.
 */
export const PROFILE: Brand = activeJson as Brand;
