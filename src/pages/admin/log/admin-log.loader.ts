import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetModerationActionsQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { parseAdminPagination } from '../admin.state';

export async function adminLogLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);

  const actionsData = await queryClient
    .fetchQuery(getGetModerationActionsQueryOptions(pagination, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { actionsData, pagination };
}

export type AdminLogLoaderData = Awaited<ReturnType<typeof adminLogLoader>>;
