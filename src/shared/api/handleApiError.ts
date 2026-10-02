import type { ActionResult } from '~shared/api/action-result';
import type { ApiTransportError } from '~shared/api/auth-fetch';
import { clearToken } from '~shared/api/auth-storage';
import { getGetCurrentUserQueryKey } from '~shared/api/generated/fetch/user-and-authentication/user-and-authentication';
import type { GenericErrorModel } from '~shared/api/generated/schemas/genericErrorModel.zod';
import { queryClient } from '~shared/api/queryClient';

export function isApiTransportError(error: unknown): error is ApiTransportError<GenericErrorModel> {
  return error instanceof Error && 'status' in error && 'info' in error;
}

export function handleApiError<TSuccess extends object = Record<string, never>>(
  error: unknown,
): ActionResult<TSuccess> | never {
  if (isApiTransportError(error)) {
    const { status } = error;

    if (status === 401) {
      clearToken();
      queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
      throw new Response('Your token is invalid or expired. Please log in again.', { status });
    }

    // 429 and 503 come from the emailed codes: too many were sent, or the email could not be sent.
    if (status === 422 || status === 403 || status === 429 || status === 503) {
      return {
        ok: false,
        errors: error.info?.errors ?? { body: ['Something went wrong.'] },
      };
    }

    throw new Response(null, { status: status ?? 500 });
  }

  throw error;
}
