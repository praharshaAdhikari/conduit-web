import { redirect } from 'react-router';
import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { verifyTip } from '~shared/api/generated/fetch/tips/tips';
import { VerifyTipBody } from '~shared/api/generated/schemas/verifyTipBody.zod';
import { setGuestToken } from '~shared/api/guest-token';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';

export async function tipVerifyAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  if (!params?.reference) {
    throw new Response('Tip not found', { status: 404 });
  }

  const formData = await request.formData();
  const validation = validateSchema(VerifyTipBody, { verification: Object.fromEntries(formData) });

  if (!validation.ok) {
    return validation;
  }

  try {
    const response = await verifyTip(params.reference, validation.data, { signal: request.signal });
    setGuestToken(response.data.guestToken);
    return redirect(response.data.checkoutUrl);
  } catch (error) {
    return handleApiError(error);
  }
}

export type TipVerifyActionData = typeof tipVerifyAction;
