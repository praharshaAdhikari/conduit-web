import { redirect } from 'react-router';
import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { startMembershipCheckout } from '~shared/api/generated/fetch/membership/membership';
import { StartMembershipCheckoutBody } from '~shared/api/generated/schemas/startMembershipCheckoutBody.zod';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';

export async function membershipCheckoutAction({ request }: ActionFunctionArgs<RouterContextProvider>) {
  const formData = await request.formData();
  const validation = validateSchema(StartMembershipCheckoutBody, { membership: Object.fromEntries(formData) });

  if (!validation.ok) {
    return validation;
  }

  try {
    const response = await startMembershipCheckout(validation.data, { signal: request.signal });
    // The checkout is on the payment provider's site, so this leaves the app.
    return redirect(response.data.checkoutUrl);
  } catch (error) {
    return handleApiError(error);
  }
}

export type MembershipCheckoutActionData = typeof membershipCheckoutAction;
