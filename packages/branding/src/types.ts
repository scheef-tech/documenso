/**
 * Brand configuration consumed by every user-facing surface (UI, emails, PDFs,
 * cert identity, metadata). One profile per deployment.
 *
 * Profiles live in `brands/<slug>.ts` and overwrite this package's `profile.ts`
 * at build time via `scripts/apply-brand.sh`.
 */
export type Brand = {
  name: string;
  legalName: string;
  slug: string;

  colors: {
    primaryHex: string;
    /** HSL components for CSS variables: "166 100% 30.2%" (no `hsl()` wrapper). */
    primaryHsl: string;
    /** Foreground that pairs with primary (button text). */
    primaryForegroundHsl: string;
    /** Optional explicit 50–950 scale. Auto-generated if omitted. */
    primaryScale?: Record<string, string>;
  };

  assets: {
    /** Square logo, used in UI and email headers. */
    logoUrl: string;
    /** Wide-format logo, used in signing-page header. Falls back to logoUrl. */
    logoWideUrl?: string;
    faviconUrl: string;
    /** Open Graph image. */
    ogImageUrl?: string;
  };

  cert: {
    countryName: string;
    stateOrProvidence: string;
    localityName: string;
    organizationName: string;
    organizationalUnit: string;
    email: string;
  };

  email: {
    fromName: string;
    fromAddress: string;
    bcc?: string[];
    showPoweredByFooter: boolean;
    footerLinkUrl: string;
    /** Per-event subject overrides; null/undefined keeps upstream Documenso default. */
    subjects?: Partial<Record<EmailSubjectKey, string>>;
  };

  metadata: {
    title: string;
    titleTemplate: string;
    description: string;
    author: string;
    robots: string;
    locale: string;
  };

  support?: {
    email?: string;
    url?: string;
  };
};

export type EmailSubjectKey =
  | 'document-invite'
  | 'document-completed'
  | 'document-recipient-signed'
  | 'document-self-signed'
  | 'document-rejected'
  | 'document-cancel';
