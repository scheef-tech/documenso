import { BRAND } from '@documenso/branding';

import { Img, Text } from '../components';
import { useBranding } from '../providers/branding';

type Props = {
  /** Tailwind className for the rendered image/text. Default = email-friendly. */
  className?: string;
};

/**
 * Brand logo for email headers.
 *
 * Resolution order:
 *   1. Per-organisation override from `useBranding()` (when enabled + URL set)
 *   2. Profile-level logo from `BRAND.assets.logoUrl`
 *   3. Text fallback rendering `BRAND.name` (when neither is available)
 *
 * The text fallback lets a brand profile ship without a logo asset (e.g. a
 * fresh scheef.tech instance) without producing a broken image icon.
 */
export const TemplateBrandLogo = ({ className = 'mb-4 h-6' }: Props) => {
  const branding = useBranding();

  const logoUrl = (branding.brandingEnabled && branding.brandingLogo) || BRAND.assets.logoUrl || '';

  if (logoUrl) {
    return <Img src={logoUrl} alt={`${BRAND.name} Logo`} className={className} />;
  }

  return <Text className={`${className} text-brand font-semibold`}>{BRAND.name}</Text>;
};

export default TemplateBrandLogo;
