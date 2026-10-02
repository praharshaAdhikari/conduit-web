import { Link, useLoaderData } from 'react-router';
import type { MembershipStatus } from '~shared/api/generated/schemas/membershipStatus.zod';
import { formatDate } from '~shared/lib/date';
import { AdminPagination } from '../admin-pagination.ui';
import type { AdminMembershipsLoaderData } from './admin-memberships.loader';

const STATUSES: MembershipStatus[] = ['pending', 'active', 'past_due', 'cancelled', 'lapsed'];

export function AdminMembershipsPage() {
  const { membershipsData, pagination, status } = useLoaderData<AdminMembershipsLoaderData>();

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
              </td>
              <td>{formatDate(membership.currentPeriodEnd ?? undefined, '')}</td>
              <td>{formatDate(membership.startedAt ?? undefined, '')}</td>
              <td>{formatDate(membership.endedAt ?? undefined, '')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={membershipsData.membershipsCount} />
    </>
  );
}
