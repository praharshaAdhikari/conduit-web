import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { setUserRole } from '~shared/api/generated/fetch/admin/admin';
import { SetUserRoleBody } from '~shared/api/generated/schemas/setUserRoleBody.zod';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';

export async function userRoleAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  if (!params?.username) {
    throw new Response('User not found', { status: 404 });
  }

  const { username } = params;
  const formData = await request.formData();
  const validation = validateSchema(SetUserRoleBody, { user: Object.fromEntries(formData) });

  if (!validation.ok) {
    return validation;
  }

  try {
    await setUserRole(username, validation.data, { signal: request.signal });
    return { ok: true as const };
  } catch (error) {
    return handleApiError(error);
  }
}

export type UserRoleActionData = typeof userRoleAction;
