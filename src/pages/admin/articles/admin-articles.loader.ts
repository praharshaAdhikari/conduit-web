import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetAdminArticlesQueryOptions } from '~shared/api/generated/fetch/admin/admin';
import { queryClient } from '~shared/api/queryClient';
import { parseAdminPagination, parseHiddenFilter } from '../admin.state';

export async function adminArticlesLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const { searchParams } = new URL(request.url);
  const pagination = parseAdminPagination(searchParams);
  const hidden = parseHiddenFilter(searchParams);

  const articlesData = await queryClient
    .fetchQuery(getGetAdminArticlesQueryOptions({ ...pagination, hidden }, { request: { signal: request.signal } }))
    .then((response) => response.data);

  return { articlesData, pagination, hidden };
}

export type AdminArticlesLoaderData = Awaited<ReturnType<typeof adminArticlesLoader>>;
