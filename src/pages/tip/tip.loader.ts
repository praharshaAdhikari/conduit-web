import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetTipQueryOptions } from '~shared/api/generated/fetch/tips/tips';
import { queryClient } from '~shared/api/queryClient';

export async function tipPageLoader({ request, params }: LoaderFunctionArgs<RouterContextProvider>) {
  if (!params.reference) {
    throw new Response('Tip not found', { status: 404 });
  }

  const tipData = await queryClient
    .fetchQuery(getGetTipQueryOptions(params.reference, { request: { signal: request.signal } }))
    .then((response) => response.data);

  // The payment provider adds ?left=1 when the tipper cancels the checkout.
  const leftCheckout = new URL(request.url).searchParams.has('left');

  return { tip: tipData.tip, leftCheckout };
}

export type TipPageLoaderData = Awaited<ReturnType<typeof tipPageLoader>>;
