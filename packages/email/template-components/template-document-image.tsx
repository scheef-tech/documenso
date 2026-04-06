import { Column, Img, Row, Section } from '../components';

export interface TemplateDocumentImageProps {
  assetBaseUrl: string;
  className?: string;
}

export const TemplateDocumentImage = ({ assetBaseUrl, className }: TemplateDocumentImageProps) => {
  const getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Section className={className}>
      <Row className="table-fixed">
        <Column />

        <Column>
          <Img className="h-42 mx-auto" src="https://imagedelivery.net/coO5-ODUTOt3Xy0qRkHGhQ/ta-email-document/public" alt="Team Abfindung" />
        </Column>

        <Column />
      </Row>
    </Section>
  );
};

export default TemplateDocumentImage;
