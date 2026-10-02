import type { MembershipEvent } from '~shared/api/generated/schemas/membershipEvent.zod';

const REASONS: Record<string, string> = {
  checkout_started: 'A checkout was started',
  checkout_abandoned: 'The checkout was never paid',
  paid: 'A payment went through',
  payment_failed: 'A payment failed',
  cancel_requested: 'Set to end at the end of the paid period',
  cancel_withdrawn: 'The cancellation was taken back',
  period_synced: 'The paid period was corrected',
  ended: 'The subscription ended',
  grace_ended: 'The payment stayed overdue',
  refunded: 'The payment was refunded',
};

const SOURCES: Record<MembershipEvent['source'], string> = {
  member: 'the member',
  webhook: 'the payment provider',
  reconcile: 'the reconcile job',
  admin: 'an admin',
};

const historyDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

type MembershipHistoryTableProps = {
  events: MembershipEvent[];
};

// Used on the member's own page and on the moderation pages.
export function MembershipHistoryTable({ events }: MembershipHistoryTableProps) {
  return (
    <table className="table" data-test="membership-history">
      <thead>
        <tr>
          <th>When (UTC)</th>
          <th>What happened</th>
          <th>Status</th>
          <th>Reported by</th>
        </tr>
      </thead>
      <tbody>
        {events.map(({ from, to, reason, source, detail, createdAt }) => (
          <tr key={`${createdAt}-${reason}`} data-test="membership-history-row">
            <td>{historyDateFormatter.format(new Date(createdAt))}</td>
            <td>
              {REASONS[reason] ?? reason}
              {detail && (
                <>
                  <br />
                  <small>{detail}</small>
                </>
              )}
            </td>
            <td>{from && from !== to ? `${from} → ${to}` : to}</td>
            <td>{SOURCES[source]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
