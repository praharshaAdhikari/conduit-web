import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminPaymentsQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { userContext } from '~shared/lib/react-router/userContext';
import { parseAdminPagination } from '../admin.state';

export async function adminPaymentsLoader({ request, context }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const status = searchParams.get('status') || undefined;

  const paymentsData = await queryClient
    .fetchQuery(getGetAdminPaymentsQueryOptions({ ...pagination, status }, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { paymentsData, pagination, status, userData: context.get(userContext) };
}

export type AdminPaymentsLoaderData = Awaited<ReturnType<typeof adminPaymentsLoader>>;
