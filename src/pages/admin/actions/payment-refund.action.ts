import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { refundPayment } from '~shared/api/generated/fetch/admin/admin';
import { handleApiError } from '~shared/api/handleApiError';

export async function paymentRefundAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  const id = Number(params?.id);
  if (!Number.isInteger(id)) {
    throw new Response('Payment not found', { status: 404 });
  }

  try {
    await refundPayment(id, { signal: request.signal });
    return { ok: true as const };
  } catch (error) {
    return handleApiError(error);
  }
}

export type PaymentRefundActionData = typeof paymentRefundAction;
