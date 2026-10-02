import { Link, useLoaderData } from 'react-router';
import type { Tip } from '~shared/api/generated/schemas/tip.zod';
import { formatDate } from '~shared/lib/date';
import { formatMoney } from '~shared/lib/money';
import type { TipsPageLoaderData } from './tips.loader';

export function TipsPage() {
  const { received, sent } = useLoaderData<TipsPageLoaderData>();

  return (
    <div className="tip-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <h1>Tips</h1>

            <h4>Received</h4>
            {received.tips.length === 0 ? (
              <p data-test="tips-received-empty">Nobody has tipped you yet.</p>
            ) : (
              <TipsTable tips={received.tips} direction="received" />
            )}

            <h4>Sent</h4>
            {sent.tips.length === 0 ? (
              <p data-test="tips-sent-empty">You have not tipped anyone yet.</p>
            ) : (
              <TipsTable tips={sent.tips} direction="sent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type TipsTableProps = {
  tips: Tip[];
  direction: 'received' | 'sent';
};

function TipsTable({ tips, direction }: TipsTableProps) {
  return (
    <table className="table" data-test={`tips-${direction}`}>
      <thead>
        <tr>
          <th>Date</th>
          <th>{direction === 'received' ? 'From' : 'To'}</th>
          <th>Article</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {tips.map((tip) => (
          <tr key={tip.reference} data-test="tip-row">
            <td>{formatDate(tip.createdAt)}</td>
            <td>
              {direction === 'received' ? (
                (tip.name ?? 'Anonymous')
              ) : (
                <Link to={`/profile/${tip.author}`}>{tip.author}</Link>
              )}
            </td>
            <td>{tip.article && <Link to={`/article/${tip.article}`}>{tip.article}</Link>}</td>
            <td>{formatMoney(tip.amountCents, tip.currency)}</td>
            <td>
              <span className={tip.status === 'refunded' ? 'badge badge-danger' : 'badge'}>{tip.status}</span>
            </td>
            <td>{tip.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
