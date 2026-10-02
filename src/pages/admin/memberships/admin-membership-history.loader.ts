import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminMembershipHistoryQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { parseAdminPagination } from '../admin.state';

export async function adminMembershipHistoryLoader({ request, params }: LoaderFunctionArgs<RouterContextProvider>) {
  if (!params.username) {
    throw new Response('User not found', { status: 404 });
  }

  const { username } = params;
  const pagination = parseAdminPagination(new URL(request.url).searchParams);

  const historyData = await queryClient
    .fetchQuery(getGetAdminMembershipHistoryQueryOptions(username, pagination, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { username, historyData, pagination };
}

export type AdminMembershipHistoryLoaderData = Awaited<ReturnType<typeof adminMembershipHistoryLoader>>;
