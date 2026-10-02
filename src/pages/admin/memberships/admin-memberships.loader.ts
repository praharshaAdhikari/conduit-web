import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import {
  getGetAdminMembershipsQueryOptions,
  getGetReconcileRunsQueryOptions,
} from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { userContext } from '~shared/lib/react-router/userContext';
import { parseAdminPagination } from '../admin.state';

const RUNS_SHOWN = 5;

export async function adminMembershipsLoader({ request, context }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const status = searchParams.get('status') || undefined;
  const options = { request: { signal: request.signal } };

  const [membershipsData, runsData] = await Promise.all([
    queryClient
      .fetchQuery(getGetAdminMembershipsQueryOptions({ ...pagination, status }, options))
      .then((response) => response.data),
    queryClient
      .fetchQuery(getGetReconcileRunsQueryOptions({ limit: RUNS_SHOWN, offset: 0 }, options))
      .then((response) => response.data),
  ]);

  return { membershipsData, runsData, pagination, status, userData: context.get(userContext) };
}

export type AdminMembershipsLoaderData = Awaited<ReturnType<typeof adminMembershipsLoader>>;
