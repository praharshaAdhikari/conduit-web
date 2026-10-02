import { redirect } from 'react-router';
import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { createTip } from '~shared/api/generated/fetch/tips/tips';
import { CreateTipBody } from '~shared/api/generated/schemas/createTipBody.zod';
import { getGuestToken, GUEST_TOKEN_HEADER } from '~shared/api/guest-token';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';
import { tipPaths } from '../tip.paths';

const text = (value: FormDataEntryValue | undefined) => (typeof value === 'string' && value !== '' ? value : undefined);

export async function tipCreateAction({ request }: ActionFunctionArgs<RouterContextProvider>) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData);

  const validation = validateSchema(CreateTipBody, {
    tip: {
      author: fields.author,
      article: text(fields.article),
      // The form asks for dollars; the API takes whole cents.
      amountCents: Math.round(Number(fields.amount) * 100),
      name: text(fields.name),
      message: text(fields.message),
      email: text(fields.email),
    },
  });

  if (!validation.ok) {
    return validation;
  }

  try {
    const guestToken = getGuestToken();
    const response = await createTip(validation.data, {
      signal: request.signal,
      headers: guestToken ? { [GUEST_TOKEN_HEADER]: guestToken } : undefined,
    });
    const { tip, checkoutUrl } = response.data;

    // Straight to the payment provider, or to the tip's page to enter the emailed code first.
    return redirect(checkoutUrl ?? tipPaths.getTipPath(tip.reference));
  } catch (error) {
    return handleApiError(error);
  }
}

export type TipCreateActionData = typeof tipCreateAction;
