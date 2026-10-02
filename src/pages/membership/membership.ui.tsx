import { useFetcher, useLoaderData } from 'react-router';
import type { Membership } from '~shared/api/generated/schemas/membership.zod';
import type { Payment } from '~shared/api/generated/schemas/payment.zod';
import type { Plan } from '~shared/api/generated/schemas/plan.zod';
import { formatDate } from '~shared/lib/date';
import { formatMoney } from '~shared/lib/money';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { MembershipCancelToggleActionData } from './actions/membership-cancel-toggle.action';
import type { MembershipCheckoutActionData } from './actions/membership-checkout.action';
import { MembershipHistoryTable } from './membership-history.ui';
import type { MembershipPageLoaderData } from './membership.loader';
import { membershipPaths } from './membership.paths';

export function MembershipPage() {
  const { plans, membership, paymentsData, historyData } = useLoaderData<MembershipPageLoaderData>();

  return (
    <div className="membership-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-8 offset-md-2 col-xs-12">
            <h1>Membership</h1>
            <p>Members can read every members-only article.</p>

            {membership?.hasAccess && <CurrentMembership membership={membership} plans={plans} />}
            {membership && !membership.hasAccess && membership.status === 'past_due' && (
              <p className="notice notice-warning" role="status" data-test="membership-overdue">
                Your payment has been overdue for too long and your access has ended. The membership will be closed
                within a day; after that you can join again.
              </p>
            )}
            {!membership?.hasAccess && membership?.status !== 'past_due' && (
              <JoinMembership membership={membership ?? null} plans={plans} />
            )}

            {paymentsData.payments.length > 0 && <PaymentsTable payments={paymentsData.payments} />}

            {historyData.events.length > 0 && (
              <>
                <h4>What happened to your membership</h4>
                <MembershipHistoryTable events={historyData.events} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function planPrice(plan: Plan) {
  return `${formatMoney(plan.amountCents, plan.currency)} a ${plan.interval}`;
}

type CurrentMembershipProps = {
  membership: Membership;
  plans: Plan[];
};

function CurrentMembership({ membership, plans }: CurrentMembershipProps) {
  const cancelFetcher = useFetcher<MembershipCancelToggleActionData>({ key: 'membership-cancel-toggle' });
  const isPending = cancelFetcher.state !== 'idle';

  const { status, cancelAtPeriodEnd, currentPeriodEnd, graceEndsAt } = membership;
  const plan = plans.find(({ id }) => id === membership.plan);
  const periodEnd = formatDate(currentPeriodEnd ?? undefined);

  return (
    <div className="card" data-test="membership-current">
      <div className="card-block">
        <p className="card-text">
          <strong>You are a member.</strong>{' '}
          <span className="badge" data-test="membership-status">
            {status}
          </span>
        </p>
        {plan && (
          <p className="card-text">
            {plan.name} plan, {planPrice(plan)}.
          </p>
        )}

        {status === 'past_due' && (
          <p className="notice notice-warning" role="status" data-test="membership-past-due">
            Your last payment failed. You keep your access until {formatDate(graceEndsAt ?? undefined)}; after that the
            membership ends.
          </p>
        )}
        {status === 'active' && cancelAtPeriodEnd && (
          <p className="card-text" data-test="membership-ending">
            Your membership ends on {periodEnd}. You keep your access until then.
          </p>
        )}
        {status === 'active' && !cancelAtPeriodEnd && (
          <p className="card-text" data-test="membership-renewing">
            It renews on {periodEnd}.
          </p>
        )}

        {status === 'active' && (
          <cancelFetcher.Form method="post" action={membershipPaths.cancelTogglePath}>
            <input type="hidden" name="operation" value={cancelAtPeriodEnd ? 'resume' : 'cancel'} />
            <button
              className={cancelAtPeriodEnd ? 'btn btn-sm btn-outline-primary' : 'btn btn-sm btn-outline-danger'}
              type="submit"
              disabled={isPending}
            >
              {cancelAtPeriodEnd ? 'Keep my membership' : 'Cancel membership'}
            </button>
          </cancelFetcher.Form>
        )}
        {cancelFetcher.data && !cancelFetcher.data.ok && <ErrorMessages errors={cancelFetcher.data.errors} />}
      </div>
    </div>
  );
}

type JoinMembershipProps = {
  membership: Membership | null;
  plans: Plan[];
};

function JoinMembership({ membership, plans }: JoinMembershipProps) {
  const checkoutFetcher = useFetcher<MembershipCheckoutActionData>({ key: 'membership-checkout' });
  const isPending = checkoutFetcher.state !== 'idle';

  return (
    <>
      {membership?.status === 'pending' && (
        <p className="notice" role="status" data-test="membership-pending">
          You started a checkout and did not finish it. Choose a plan to try again.
        </p>
      )}
      {membership?.endedAt && (membership.status === 'cancelled' || membership.status === 'lapsed') && (
        <p className="notice" role="status" data-test="membership-ended">
          Your membership ended on {formatDate(membership.endedAt)}. Choose a plan to join again.
        </p>
      )}

      {checkoutFetcher.data && !checkoutFetcher.data.ok && <ErrorMessages errors={checkoutFetcher.data.errors} />}

      <div className="row">
        {plans.map((plan) => (
          <div key={plan.id} className="col-md-6 col-xs-12">
            <div className="card" data-test="membership-plan">
              <div className="card-block">
                <p className="card-text">
                  <strong>{plan.name}</strong>
                </p>
                <p className="card-text">{planPrice(plan)}</p>
                <checkoutFetcher.Form method="post" action={membershipPaths.checkoutPath}>
                  <input type="hidden" name="plan" value={plan.id} />
                  <button className="btn btn-primary" type="submit" disabled={isPending}>
                    Join {plan.name.toLowerCase()}
                  </button>
                </checkoutFetcher.Form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

type PaymentsTableProps = {
  payments: Payment[];
};

function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <>
      <h4>Your payments</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>For</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(({ id, createdAt, description, amountCents, currency, status }) => (
            <tr key={id} data-test="membership-payment-row">
              <td>{formatDate(createdAt)}</td>
              <td>{description}</td>
              <td>{formatMoney(amountCents, currency)}</td>
              <td>
                <span className={status === 'refunded' ? 'badge badge-danger' : 'badge'}>{status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
