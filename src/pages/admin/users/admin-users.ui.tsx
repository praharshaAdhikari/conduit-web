import { Form, Link, useFetcher, useLoaderData } from 'react-router';
import type { AdminUser } from '~shared/api/generated/schemas/adminUser.zod';
import type { Role } from '~shared/api/generated/schemas/role.zod';
import { hasRole, maySuspend, ROLES } from '~shared/lib/roles';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { UserRoleActionData } from '../actions/user-role.action';
import type { UserSuspendToggleActionData } from '../actions/user-suspend-toggle.action';
import { AdminPagination } from '../admin-pagination.ui';
import { adminPaths } from '../admin.paths';
import type { AdminUsersLoaderData } from './admin-users.loader';

export function AdminUsersPage() {
  const { usersData, pagination, search, userData } = useLoaderData<AdminUsersLoaderData>();
  const viewer = userData?.user;

  return (
    <>
      <Form method="get" className="inline-form">
        <input
          className="form-control"
          type="search"
          name="search"
          placeholder="Part of a username or email"
          defaultValue={search ?? ''}
        />
        <button className="btn btn-outline-secondary" type="submit">
          Search
        </button>
      </Form>

      <p className="list-count" data-test="admin-users-count">
        {usersData.usersCount} {usersData.usersCount === 1 ? 'user' : 'users'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Suspension</th>
          </tr>
        </thead>
        <tbody>
          {usersData.users.map((user) => (
            <AdminUserRow key={user.username} user={user} viewerUsername={viewer?.username} viewerRole={viewer?.role} />
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={usersData.usersCount} />
    </>
  );
}

type AdminUserRowProps = {
  user: AdminUser;
  viewerUsername?: string;
  viewerRole?: Role;
};

function AdminUserRow({ user, viewerUsername, viewerRole }: AdminUserRowProps) {
  const { username, email, role, suspended, suspendedReason } = user;
  const isSelf = username === viewerUsername;

  return (
    <tr data-test="admin-user-row">
      <td>
        <Link to={`/profile/${username}`}>{username}</Link>
      </td>
      <td>{email}</td>
      <td>
        {hasRole(viewerRole, 'admin') && !isSelf && !suspended ? <RoleForm username={username} role={role} /> : role}
      </td>
      <td>
        {suspended ? (
          <>
            <span className="badge badge-danger">Suspended</span>
            <br />
            <small>{suspendedReason}</small>
          </>
        ) : (
          <span className="badge">Active</span>
        )}
      </td>
      <td>{!isSelf && maySuspend(viewerRole, role) && <SuspendForm username={username} suspended={suspended} />}</td>
    </tr>
  );
}

type RoleFormProps = {
  username: string;
  role: Role;
};

function RoleForm({ username, role }: RoleFormProps) {
  const roleFetcher = useFetcher<UserRoleActionData>({ key: `admin-role-${username}` });
  const isPending = roleFetcher.state !== 'idle';

  return (
    <>
      <roleFetcher.Form method="post" action={adminPaths.getRolePath(username)} className="inline-form">
        <select
          key={role}
          className="form-control form-control-sm"
          name="role"
          defaultValue={role}
          aria-label={`Role of ${username}`}
        >
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button className="btn btn-sm btn-outline-secondary" type="submit" disabled={isPending}>
          Set role
        </button>
      </roleFetcher.Form>
      {roleFetcher.data && !roleFetcher.data.ok && <ErrorMessages errors={roleFetcher.data.errors} />}
    </>
  );
}

type SuspendFormProps = {
  username: string;
  suspended: boolean;
};

function SuspendForm({ username, suspended }: SuspendFormProps) {
  const suspendFetcher = useFetcher<UserSuspendToggleActionData>({ key: `admin-suspend-toggle-${username}` });
  const isPending = suspendFetcher.state !== 'idle';

  return (
    <>
      <suspendFetcher.Form
        key={String(suspended)}
        method="post"
        action={adminPaths.getSuspendTogglePath(username)}
        className="inline-form"
      >
        <input type="hidden" name="operation" value={suspended ? 'unsuspend' : 'suspend'} />
        {!suspended && (
          <input
            className="form-control form-control-sm"
            type="text"
            name="reason"
            placeholder="Reason"
            aria-label={`Reason for suspending ${username}`}
            maxLength={255}
            required
          />
        )}
        <button
          className={suspended ? 'btn btn-sm btn-outline-secondary' : 'btn btn-sm btn-outline-danger'}
          type="submit"
          disabled={isPending}
        >
          {suspended ? 'Unsuspend' : 'Suspend'}
        </button>
      </suspendFetcher.Form>
      {suspendFetcher.data && !suspendFetcher.data.ok && <ErrorMessages errors={suspendFetcher.data.errors} />}
    </>
  );
}
