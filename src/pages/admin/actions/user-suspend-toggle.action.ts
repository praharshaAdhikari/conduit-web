import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { suspendUser, unsuspendUser } from '~shared/api/generated/fetch/admin/admin';
import { SuspendUserBody } from '~shared/api/generated/schemas/suspendUserBody.zod';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';

export async function userSuspendToggleAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  if (!params?.username) {
    throw new Response('User not found', { status: 404 });
  }

  const { username } = params;
  const formData = await request.formData();
  const { operation, ...fields } = Object.fromEntries(formData);

  try {
    if (operation === 'unsuspend') {
      await unsuspendUser(username, { signal: request.signal });
      return { ok: true as const };
    }

    if (operation === 'suspend') {
      const validation = validateSchema(SuspendUserBody, { moderation: fields });

      if (!validation.ok) {
        return validation;
      }

      await suspendUser(username, validation.data, { signal: request.signal });
      return { ok: true as const };
    }

    return new Response('Invalid operation', { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

export type UserSuspendToggleActionData = typeof userSuspendToggleAction;
