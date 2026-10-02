import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { resendTipCode } from '~shared/api/generated/fetch/tips/tips';
import { handleApiError } from '~shared/api/handleApiError';

export async function tipResendAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  if (!params?.reference) {
    throw new Response('Tip not found', { status: 404 });
  }

  try {
    await resendTipCode(params.reference, { signal: request.signal });
    return { ok: true as const };
  } catch (error) {
    return handleApiError(error);
  }
}

export type TipResendActionData = typeof tipResendAction;
