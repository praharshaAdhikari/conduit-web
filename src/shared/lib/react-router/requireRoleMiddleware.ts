import { redirect } from 'react-router';
import type { MiddlewareFunction } from 'react-router';
import type { Role } from '~shared/api/generated/schemas/role.zod';
import { hasRole } from '~shared/lib/roles';
import { userContext } from './userContext';

export const requireRoleMiddleware =
  (role: Role): MiddlewareFunction =>
  async ({ context }) => {
    const userData = context.get(userContext);
    if (!userData) {
      return redirect('/login');
    }

    if (!hasRole(userData.user.role, role)) {
      throw new Response('Your account is not allowed to see this page.', { status: 403 });
    }
  };
