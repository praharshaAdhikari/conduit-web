import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetUserTipsQueryOptions } from '~shared/api/generated/fetch/tips/tips';
import { queryClient } from '~shared/api/queryClient';

const TIPS_SHOWN = 50;

export async function tipsPageLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const options = { request: { signal: request.signal } };
  const list = (direction: 'received' | 'sent') =>
    queryClient
      .fetchQuery(getGetUserTipsQueryOptions({ direction, limit: TIPS_SHOWN, offset: 0 }, options))
      .then((response) => response.data);

  const [received, sent] = await Promise.all([list('received'), list('sent')]);
  return { received, sent };
}

export type TipsPageLoaderData = Awaited<ReturnType<typeof tipsPageLoader>>;
