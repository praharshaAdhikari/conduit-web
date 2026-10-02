import type { LoaderFunctionArgs, RouterContextProvider } from 'react-router';
import {
  getGetMembershipPaymentsQueryOptions,
  getGetMembershipPlansQueryOptions,
  getGetMembershipQueryOptions,
} from '~shared/api/generated/fetch/membership/membership';
import { queryClient } from '~shared/api/queryClient';

const PAYMENTS_SHOWN = 20;

export async function membershipPageLoader({ request }: LoaderFunctionArgs<RouterContextProvider>) {
  const options = { request: { signal: request.signal } };

  const [plansData, membershipData, paymentsData] = await Promise.all([
    queryClient.fetchQuery(getGetMembershipPlansQueryOptions(options)).then((response) => response.data),
    queryClient.fetchQuery(getGetMembershipQueryOptions(options)).then((response) => response.data),
    queryClient
      .fetchQuery(getGetMembershipPaymentsQueryOptions({ limit: PAYMENTS_SHOWN, offset: 0 }, options))
      .then((response) => response.data),
  ]);

  return { plans: plansData.plans, membership: membershipData.membership, paymentsData };
}

export type MembershipPageLoaderData = Awaited<ReturnType<typeof membershipPageLoader>>;
