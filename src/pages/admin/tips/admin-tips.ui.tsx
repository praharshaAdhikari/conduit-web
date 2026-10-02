import { Link, useLoaderData } from 'react-router';
import type { TipStatus } from '~shared/api/generated/schemas/tipStatus.zod';
import { formatDate } from '~shared/lib/date';
import { formatMoney } from '~shared/lib/money';
import { AdminPagination } from '../admin-pagination.ui';
import type { AdminTipsLoaderData } from './admin-tips.loader';

const STATUSES: TipStatus[] = ['pending_verification', 'pending_payment', 'paid', 'expired', 'refunded'];

export function AdminTipsPage() {
  const { tipsData, pagination, status } = useLoaderData<AdminTipsLoaderData>();

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

      <p className="list-count" data-test="admin-tips-count">
        {tipsData.tipsCount} {tipsData.tipsCount === 1 ? 'tip' : 'tips'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {tipsData.tips.map((tip) => (
            <tr key={tip.reference} data-test="admin-tip-row">
              <td>{formatDate(tip.createdAt)}</td>
              <td>
                {tip.tipperUsername ? <Link to={`/profile/${tip.tipperUsername}`}>{tip.tipperUsername}</Link> : 'Guest'}
                <br />
                <small>{tip.tipperEmail}</small>
              </td>
              <td>
                <Link to={`/profile/${tip.author}`}>{tip.author}</Link>
              </td>
              <td>{formatMoney(tip.amountCents, tip.currency)}</td>
              <td>
                <span className={tip.status === 'refunded' ? 'badge badge-danger' : 'badge'}>{tip.status}</span>
              </td>
              <td>{tip.message}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={tipsData.tipsCount} />
    </>
  );
}
