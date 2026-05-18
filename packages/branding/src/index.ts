import { PROFILE } from './profile';

export type { Brand, EmailSubjectKey } from './types';
export { PROFILE as BRAND } from './profile';
export { getPrimaryHex, getPrimaryHsl, getPrimaryForegroundHsl, getPrimaryScale } from './palette';

/** Helper for code that wants the brand object via a function call. */
export const getBrand = () => PROFILE;
