import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import { getGetMembershipQueryOptions } from '~shared/api/generated/fetch/membership/membership';
import { queryClient } from '~shared/api/queryClient';

export async function membershipSuccessLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const membershipData = await queryClient
    .fetchQuery(getGetMembershipQueryOptions({ request: { signal: request.signal } }))
    .then((response) => response.data);

  return { membership: membershipData.membership };
}

export type MembershipSuccessLoaderData = Awaited<ReturnType<typeof membershipSuccessLoader>>;
