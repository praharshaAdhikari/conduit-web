import { Link, useLoaderData } from 'react-router';
import { MembershipHistoryTable } from '~pages/membership/membership-history.ui';
import { AdminPagination } from '../admin-pagination.ui';
import { adminPaths } from '../admin.paths';
import type { AdminMembershipHistoryLoaderData } from './admin-membership-history.loader';

export function AdminMembershipHistoryPage() {
  const { username, historyData, pagination } = useLoaderData<AdminMembershipHistoryLoaderData>();

  return (
    <>
      <p className="list-filters">
        <Link className="btn btn-sm btn-outline-secondary" to={adminPaths.membershipsPath}>
          All memberships
        </Link>
      </p>
      <h4>
        Membership history of <Link to={`/profile/${username}`}>{username}</Link>
      </h4>

      {historyData.events.length === 0 ? (
        <p data-test="membership-history-empty">This user has never started a membership.</p>
      ) : (
        <MembershipHistoryTable events={historyData.events} />
      )}

      <AdminPagination pagination={pagination} count={historyData.eventsCount} />
    </>
  );
}
