import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminTipsQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { parseAdminPagination } from '../admin.state';

export async function adminTipsLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const status = searchParams.get('status') || undefined;

  const tipsData = await queryClient
    .fetchQuery(getGetAdminTipsQueryOptions({ ...pagination, status }, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { tipsData, pagination, status };
}

export type AdminTipsLoaderData = Awaited<ReturnType<typeof adminTipsLoader>>;
