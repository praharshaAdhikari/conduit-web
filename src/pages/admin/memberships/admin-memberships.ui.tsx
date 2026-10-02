import { Link, useFetcher, useLoaderData } from 'react-router';
import type { MembershipStatus } from '~shared/api/generated/schemas/membershipStatus.zod';
import type { ReconcileRun } from '~shared/api/generated/schemas/reconcileRun.zod';
import { formatDate } from '~shared/lib/date';
import { hasRole } from '~shared/lib/roles';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { ReconcileActionData } from '../actions/reconcile.action';
import { AdminPagination } from '../admin-pagination.ui';
import { adminPaths } from '../admin.paths';
import type { AdminMembershipsLoaderData } from './admin-memberships.loader';

const STATUSES: MembershipStatus[] = ['pending', 'active', 'past_due', 'cancelled', 'lapsed'];

export function AdminMembershipsPage() {
  const { membershipsData, runsData, pagination, status, userData } = useLoaderData<AdminMembershipsLoaderData>();

  return (
    <>
      <ReconcilePanel runs={runsData.runs} canRun={hasRole(userData?.user?.role, 'admin')} />

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

      <p className="list-count" data-test="admin-memberships-count">
        {membershipsData.membershipsCount} {membershipsData.membershipsCount === 1 ? 'membership' : 'memberships'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Paid until</th>
            <th>Started</th>
            <th>Ended</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {membershipsData.memberships.map((membership) => (
            <tr key={membership.username} data-test="admin-membership-row">
              <td>
                <Link to={`/profile/${membership.username}`}>{membership.username}</Link>
                <br />
                <small>{membership.email}</small>
              </td>
              <td>{membership.plan}</td>
              <td>
                <span className={membership.hasAccess ? 'badge badge-member' : 'badge'}>{membership.status}</span>
                {membership.cancelAtPeriodEnd && (
                  <>
                    <br />
                    <small>set to end</small>
                  </>
                )}
                {membership.graceEndsAt && (
                  <>
                    <br />
                    <small>
                      {membership.hasAccess ? 'access until' : 'access ended'} {formatDate(membership.graceEndsAt)}
                    </small>
                  </>
                )}
              </td>
              <td>{formatDate(membership.currentPeriodEnd ?? undefined, '')}</td>
              <td>{formatDate(membership.startedAt ?? undefined, '')}</td>
              <td>{formatDate(membership.endedAt ?? undefined, '')}</td>
              <td>
                <Link to={adminPaths.getMembershipHistoryPath(membership.username)}>History</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={membershipsData.membershipsCount} />
    </>
  );
}

const runDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

type ReconcilePanelProps = {
  runs: ReconcileRun[];
  canRun: boolean;
};

// The job that puts right what webhooks missed and what only the passing of time changes.
function ReconcilePanel({ runs, canRun }: ReconcilePanelProps) {
  const reconcileFetcher = useFetcher<ReconcileActionData>({ key: 'admin-reconcile' });
  const isPending = reconcileFetcher.state !== 'idle';
  const result = reconcileFetcher.data;

  return (
    <div className="card" data-test="reconcile-panel">
      <div className="card-block">
        <p className="card-text">
          <strong>Reconcile job.</strong> Compares every running membership with the payment provider, ends overdue ones
          and closes abandoned checkouts. It runs by itself every night.
        </p>

        {canRun && (
          <reconcileFetcher.Form method="post" action={adminPaths.reconcilePath}>
            <button className="btn btn-sm btn-outline-primary" type="submit" disabled={isPending}>
              {isPending ? 'Running…' : 'Run it now'}
            </button>
          </reconcileFetcher.Form>
        )}
        {result && !result.ok && <ErrorMessages errors={result.errors} />}
        {result?.ok && (
          <p className="notice" role="status" data-test="reconcile-result">
            Run {result.run.id} finished: {summarize(result.run)}
          </p>
        )}

        {runs.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Run</th>
                <th>Started (UTC)</th>
                <th>By</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} data-test="reconcile-run-row">
                  <td>{run.id}</td>
                  <td>{runDateFormatter.format(new Date(run.startedAt))}</td>
                  <td>{run.startedBy}</td>
                  <td>
                    {run.finishedAt ? summarize(run) : 'did not finish'}
                    {run.membershipsChanged.map((change) => (
                      <span key={`${change.username}-${change.reason}`}>
                        <br />
                        <small>
                          {change.username}: {change.from} → {change.to} ({change.reason})
                        </small>
                      </span>
                    ))}
                    {run.errors.map((error) => (
                      <span key={error}>
                        <br />
                        <small>{error}</small>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function summarize(run: ReconcileRun) {
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  return [
    `${count(run.membershipsChecked, 'membership', 'memberships')} checked`,
    `${run.membershipsChanged.length} changed`,
    `${count(run.checkoutsExpired, 'checkout', 'checkouts')} closed`,
    `${count(run.tipsExpired, 'tip', 'tips')} expired`,
    count(run.errors.length, 'error', 'errors'),
  ].join(', ');
}
