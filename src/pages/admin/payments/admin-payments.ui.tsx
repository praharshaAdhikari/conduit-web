import { Link, useFetcher, useLoaderData } from 'react-router';
import type { AdminPayment } from '~shared/api/generated/schemas/adminPayment.zod';
import type { PaymentStatus } from '~shared/api/generated/schemas/paymentStatus.zod';
import { formatDate } from '~shared/lib/date';
import { formatMoney } from '~shared/lib/money';
import { hasRole } from '~shared/lib/roles';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { PaymentRefundActionData } from '../actions/payment-refund.action';
import { AdminPagination } from '../admin-pagination.ui';
import { adminPaths } from '../admin.paths';
import type { AdminPaymentsLoaderData } from './admin-payments.loader';

const STATUSES: PaymentStatus[] = ['pending', 'succeeded', 'expired', 'refunded'];

export function AdminPaymentsPage() {
  const { paymentsData, pagination, status, userData } = useLoaderData<AdminPaymentsLoaderData>();
  const canRefund = hasRole(userData?.user?.role, 'admin');

  return (
    <>
      <p className="list-filters">
        <Link
          className={status ? 'btn btn-sm btn-outline-secondary' : 'btn btn-sm btn-secondary'}
          to={{ search: '' }}
          aria-current={status ? undefined : 'true'}
        >
          All
        </Link>
        {STATUSES.map((option) => (
          <Link
            key={option}
            className={option === status ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-outline-secondary'}
            to={{ search: `?status=${option}` }}
            aria-current={option === status ? 'true' : undefined}
          >
            {option}
          </Link>
        ))}
      </p>

      <p className="list-count" data-test="admin-payments-count">
        {paymentsData.paymentsCount} {paymentsData.paymentsCount === 1 ? 'payment' : 'payments'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Who</th>
            <th>For</th>
            <th>Amount</th>
            <th>Status</th>
            {canRefund && <th>Refund</th>}
          </tr>
        </thead>
        <tbody>
          {paymentsData.payments.map((payment) => (
            <AdminPaymentRow key={payment.id} payment={payment} canRefund={canRefund} />
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={paymentsData.paymentsCount} />
    </>
  );
}

type AdminPaymentRowProps = {
  payment: AdminPayment;
  canRefund: boolean;
};

function AdminPaymentRow({ payment, canRefund }: AdminPaymentRowProps) {
  const { id, createdAt, username, description, amountCents, currency, status } = payment;
  const refundFetcher = useFetcher<PaymentRefundActionData>({ key: `admin-payment-refund-${id}` });
  const isPending = refundFetcher.state !== 'idle';

  return (
    <tr data-test="admin-payment-row">
      <td>{id}</td>
      <td>{formatDate(createdAt)}</td>
      <td>{username ? <Link to={`/profile/${username}`}>{username}</Link> : 'Guest'}</td>
      <td>{description}</td>
      <td>{formatMoney(amountCents, currency)}</td>
      <td>
        <span className={status === 'refunded' ? 'badge badge-danger' : 'badge'}>{status}</span>
      </td>
      {canRefund && (
        <td>
          {status === 'succeeded' && (
            <refundFetcher.Form method="post" action={adminPaths.getRefundPath(id)}>
              <button className="btn btn-sm btn-outline-danger" type="submit" disabled={isPending}>
                Refund
              </button>
            </refundFetcher.Form>
          )}
          {refundFetcher.data && !refundFetcher.data.ok && <ErrorMessages errors={refundFetcher.data.errors} />}
        </td>
      )}
    </tr>
  );
}
