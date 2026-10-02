import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminUsersQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { userContext } from '~shared/lib/react-router/userContext';
import { parseAdminPagination } from '../admin.state';

export async function adminUsersLoader({ request, context }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const search = searchParams.get('search')?.trim() || undefined;

  const usersData = await queryClient
    .fetchQuery(getGetAdminUsersQueryOptions({ ...pagination, search }, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { usersData, pagination, search, userData: context.get(userContext) };
}

export type AdminUsersLoaderData = Awaited<ReturnType<typeof adminUsersLoader>>;
