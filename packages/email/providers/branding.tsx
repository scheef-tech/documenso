import { createContext, useContext } from 'react';

import { BRAND } from '@documenso/branding';

type BrandingContextValue = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

/**
 * Defaults derived from the active brand profile.
 *
 * Per-organisation branding (set in the Documenso UI) overrides this via the
 * `branding` prop on `BrandingProvider`. When no override is present (system
 * mail like signup/forgot-password), we fall back to these brand-profile
 * values so the email isn't stuck with upstream-Documenso (or a previously-
 * baked-in fork-specific) hardcode.
 */
const defaultBrandingContextValue: BrandingContextValue = {
  brandingEnabled: Boolean(BRAND.assets.logoUrl) || Boolean(BRAND.email.footerAddress),
  brandingUrl: BRAND.email.footerLinkUrl,
  brandingLogo: BRAND.assets.logoUrl || '',
  brandingCompanyDetails: BRAND.email.footerAddress || BRAND.legalName,
  brandingHidePoweredBy: !BRAND.email.showPoweredByFooter,
};

export const BrandingProvider = (props: {
  branding?: BrandingContextValue;
  children: React.ReactNode;
}) => {
  return (
    <BrandingContext.Provider value={props.branding ?? defaultBrandingContextValue}>
      {props.children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);

  if (!ctx) {
    throw new Error('Branding context not found');
  }

  return ctx;
};

export type BrandingSettings = BrandingContextValue;
