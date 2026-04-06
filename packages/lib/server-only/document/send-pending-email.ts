export interface SendPendingEmailOptions {
  documentId: number;
  recipientId: number;
}

// Disabled — don't send "waiting for others" emails
// eslint-disable-next-line @typescript-eslint/require-await
export const sendPendingEmail = async (_options: SendPendingEmailOptions) => {
  return;
};
