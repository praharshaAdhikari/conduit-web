import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminMembershipsQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { parseAdminPagination } from '../admin.state';

export async function adminMembershipsLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const status = searchParams.get('status') || undefined;

  const membershipsData = await queryClient
    .fetchQuery(getGetAdminMembershipsQueryOptions({ ...pagination, status }, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { membershipsData, pagination, status };
}

export type AdminMembershipsLoaderData = Awaited<ReturnType<typeof adminMembershipsLoader>>;
