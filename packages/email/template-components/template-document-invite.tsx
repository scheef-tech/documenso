import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { OrganisationType, RecipientRole } from '@prisma/client';
import { P, match } from 'ts-pattern';

import { RECIPIENT_ROLES_DESCRIPTION } from '@documenso/lib/constants/recipient-roles';

import { Button, Section, Text } from '../components';
import { TemplateDocumentImage } from './template-document-image';

export interface TemplateDocumentInviteProps {
  inviterName: string;
  inviterEmail: string;
  documentName: string;
  signDocumentLink: string;
  assetBaseUrl: string;
  role: RecipientRole;
  selfSigner: boolean;
  teamName?: string;
  includeSenderDetails?: boolean;
  organisationType?: OrganisationType;
}

export const TemplateDocumentInvite = ({
  inviterName,
  documentName,
  signDocumentLink,
  assetBaseUrl,
  role,
  selfSigner,
  teamName,
  includeSenderDetails,
  organisationType,
}: TemplateDocumentInviteProps) => {
  const { _ } = useLingui();

  const { actionVerb } = RECIPIENT_ROLES_DESCRIPTION[role];

  return (
    <>
      <TemplateDocumentImage className="mt-6" assetBaseUrl={assetBaseUrl} />

      <Section>
        <Text className="text-primary mx-auto mb-0 max-w-[80%] text-center text-lg font-semibold">
          {match({ selfSigner, organisationType, includeSenderDetails, teamName })
            .with({ selfSigner: true }, () => (
              <Trans>
                Please {_(actionVerb).toLowerCase()} your document
                <br />"{documentName}"
              </Trans>
            ))
            .with(
              {
                organisationType: OrganisationType.ORGANISATION,
                includeSenderDetails: true,
                teamName: P.string,
              },
              () => (
                <Trans>
                  {teamName} has sent you a document to {_(actionVerb).toLowerCase()}
                </Trans>
              ),
            )
            .with({ organisationType: OrganisationType.ORGANISATION, teamName: P.string }, () => (
              <Trans>
                {teamName} has sent you a document to {_(actionVerb).toLowerCase()}
              </Trans>
            ))
            .otherwise(() => (
              <Trans>
                {inviterName} has sent you a document to {_(actionVerb).toLowerCase()}
              </Trans>
            ))}
        </Text>

        <Section className="mb-6 mt-8 text-center">
          <Button
            className="bg-documenso-500 text-sbase inline-flex items-center justify-center rounded-lg px-6 py-3 text-center font-medium text-white no-underline"
            href={signDocumentLink}
          >
            {match(role)
              .with(RecipientRole.SIGNER, () => <Trans>Sign here</Trans>)
              .with(RecipientRole.VIEWER, () => <Trans>View Document</Trans>)
              .with(RecipientRole.APPROVER, () => <Trans>View Document to approve</Trans>)
              .with(RecipientRole.CC, () => '')
              .with(RecipientRole.ASSISTANT, () => <Trans>View Document to assist</Trans>)
              .exhaustive()}
          </Button>
        </Section>
      </Section>
    </>
  );
};

export default TemplateDocumentInvite;
