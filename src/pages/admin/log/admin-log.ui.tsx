import { Link, useLoaderData } from 'react-router';
import type { ModerationAction } from '~shared/api/generated/schemas/moderationAction.zod';
import { AdminPagination } from '../admin-pagination.ui';
import type { AdminLogLoaderData } from './admin-log.loader';

const ACTION_LABELS: Record<ModerationAction['action'], string> = {
  suspend: 'Suspended',
  unsuspend: 'Unsuspended',
  hide: 'Hid',
  unhide: 'Showed',
  set_role: 'Changed the role of',
};

const logDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function AdminLogPage() {
  const { actionsData, pagination } = useLoaderData<AdminLogLoaderData>();

  return (
    <>
      <p className="list-count" data-test="admin-log-count">
        {actionsData.actionsCount} {actionsData.actionsCount === 1 ? 'entry' : 'entries'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>When (UTC)</th>
            <th>Who</th>
            <th>What</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {actionsData.actions.map(({ id, action, moderator, targetType, target, note, createdAt }) => (
            <tr key={id} data-test="admin-log-row">
              <td>{logDateFormatter.format(new Date(createdAt))}</td>
              <td>{moderator}</td>
              <td>
                {ACTION_LABELS[action]}{' '}
                <Link to={targetType === 'user' ? `/profile/${target}` : `/article/${target}`}>{target}</Link>
              </td>
              <td>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={actionsData.actionsCount} />
    </>
  );
}
