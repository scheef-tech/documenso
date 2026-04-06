import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import type { RecipientRole } from '@prisma/client';
import { OrganisationType } from '@prisma/client';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Body, Container, Head, Hr, Html, Img, Preview, Section, Text } from '../components';
import { useBranding } from '../providers/branding';
import type { TemplateDocumentInviteProps } from '../template-components/template-document-invite';
import { TemplateDocumentInvite } from '../template-components/template-document-invite';
import { TemplateFooter } from '../template-components/template-footer';

export type DocumentInviteEmailTemplateProps = Partial<TemplateDocumentInviteProps> & {
  customBody?: string;
  role: RecipientRole;
  selfSigner?: boolean;
  teamName?: string;
  teamEmail?: string;
  includeSenderDetails?: boolean;
  organisationType?: OrganisationType;
};

export const DocumentInviteEmailTemplate = ({
  inviterName = 'Lucas Smith',
  inviterEmail = 'lucas@documenso.com',
  documentName = 'Open Source Pledge.pdf',
  signDocumentLink = 'https://documenso.com',
  assetBaseUrl = 'http://localhost:3002',
  customBody,
  role,
  selfSigner = false,
  teamName = '',
  includeSenderDetails,
  organisationType,
}: DocumentInviteEmailTemplateProps) => {
  const { _ } = useLingui();
  const branding = useBranding();

  const action = _(RECIPIENT_ROLES_DESCRIPTION[role].actionVerb).toLowerCase();

  let previewText = msg`${inviterName} has invited you to ${action} ${documentName}`;

  if (organisationType === OrganisationType.ORGANISATION) {
    previewText = includeSenderDetails
      ? msg`${inviterName} on behalf of "${teamName}" has invited you to ${action} ${documentName}`
      : msg`${teamName} has invited you to ${action} ${documentName}`;
  }

  if (selfSigner) {
    previewText = msg`Please ${action} your document ${documentName}`;
  }

  const getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>{_(previewText)}</Preview>

      <Body className="mx-auto my-auto bg-white font-sans">
        <Section style={{ maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' as const }}>
          <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>
              {branding.brandingEnabled && branding.brandingLogo ? (
                <Img
                  src="https://imagedelivery.net/coO5-ODUTOt3Xy0qRkHGhQ/ta-email-logo/public"
                  alt="Branding Logo"
                  className="mb-4 h-6"
                />
              ) : (
                <Img
                  src="https://imagedelivery.net/coO5-ODUTOt3Xy0qRkHGhQ/ta-email-logo/public"
                  alt="Documenso Logo"
                  className="mb-4 h-6"
                />
              )}

              <TemplateDocumentInvite
                inviterName={inviterName}
                inviterEmail={inviterEmail}
                documentName={documentName}
                signDocumentLink={signDocumentLink}
                assetBaseUrl={assetBaseUrl}
                role={role}
                selfSigner={selfSigner}
                organisationType={organisationType}
                teamName={teamName}
                includeSenderDetails={includeSenderDetails}
              />
            </Section>
          </Container>

          <Container className="mx-auto mt-12 max-w-xl">
            <Section>
              {customBody ? (
                <Text className="mt-2 text-base text-slate-400">
                  <pre
                    className="font-sans text-base text-slate-400"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {customBody}
                  </pre>
                </Text>
              ) : (
                <>
                  <Text className="mt-2 text-sm text-slate-400">
                    <Trans>
                      <strong>Prozessfinanzierungsvertrag</strong> — A litigation funding agreement
                      where a third party covers legal costs in exchange for a share of any
                      proceeds. You bear no financial risk if the case is unsuccessful.
                    </Trans>
                  </Text>
                  <Text className="mt-1 text-sm text-slate-400">
                    <Trans>
                      <strong>Widerrufsbelehrung</strong> — A cancellation notice informing you of
                      your right to withdraw from the contract within 14 days without giving
                      reasons.
                    </Trans>
                  </Text>
                </>
              )}
            </Section>
          </Container>

          <Hr className="mx-auto mt-12 max-w-xl" />

          <Container className="mx-auto max-w-xl">
            <TemplateFooter />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default DocumentInviteEmailTemplate;
