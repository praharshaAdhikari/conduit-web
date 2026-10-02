import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { cancelMembership, resumeMembership } from '~shared/api/generated/fetch/membership/membership';
import { handleApiError } from '~shared/api/handleApiError';

export async function membershipCancelToggleAction({ request }: ActionFunctionArgs<RouterContextProvider>) {
  const formData = await request.formData();
  const operation = formData.get('operation');

  try {
    if (operation === 'cancel') {
      await cancelMembership({ signal: request.signal });
      return { ok: true as const };
    }

    if (operation === 'resume') {
      await resumeMembership({ signal: request.signal });
      return { ok: true as const };
    }

    return new Response('Invalid operation', { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

export type MembershipCancelToggleActionData = typeof membershipCancelToggleAction;
