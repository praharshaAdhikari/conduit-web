import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { runReconcile } from '~shared/api/generated/fetch/admin/admin';
import { isApiTransportError, handleApiError } from '~shared/api/handleApiError';

export async function reconcileAction({ request }: ActionFunctionArgs<RouterContextProvider>) {
  try {
    const response = await runReconcile({ signal: request.signal });
    return { ok: true as const, run: response.data.run };
  } catch (error) {
    // 409: another run is in progress. The page can say so; it is not a broken page.
    if (isApiTransportError(error) && error.status === 409) {
      return { ok: false as const, errors: error.info?.errors ?? { reconcile: ['is already running'] } };
    }

    return handleApiError(error);
  }
}

export type ReconcileActionData = typeof reconcileAction;
