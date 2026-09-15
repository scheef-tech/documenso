/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * CommonJS shim so `packages/tailwind-config/index.cjs` (CJS, runs at Tailwind
 * build time, no TS toolchain) can read the active brand profile.
 *
 * Both this shim and the TS module read from the same JSON file — there's no
 * duplication, just two ways to ingest it.
 */
const activeBrand = require('./active.json');

module.exports = {
  BRAND: activeBrand,
};
