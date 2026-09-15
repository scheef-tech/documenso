import { BRAND } from '@documenso/branding';

import { Column, Img, Row, Section } from '../components';

export interface TemplateDocumentImageProps {
  assetBaseUrl: string;
  className?: string;
}

/**
 * Decorative banner illustration above the document body. Skipped entirely
 * when the active brand profile doesn't supply an `emailHeroUrl` — instead of
 * a broken-image icon we just don't render the section.
 */
export const TemplateDocumentImage = ({ className }: TemplateDocumentImageProps) => {
  const heroUrl = BRAND.assets.emailHeroUrl || '';

  if (!heroUrl) {
    return null;
  }

  return (
    <Section className={className}>
      <Row className="table-fixed">
        <Column />

        <Column>
          <Img className="h-42 mx-auto" src={heroUrl} alt={`${BRAND.name} Document`} />
        </Column>

        <Column />
      </Row>
    </Section>
  );
};

export default TemplateDocumentImage;
