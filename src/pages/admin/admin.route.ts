import { redirect } from 'react-router';
import type { RouteObject } from 'react-router';
import { requireRoleMiddleware } from '~shared/lib/react-router/requireRoleMiddleware';
import { adminPaths } from './admin.paths';

export const adminRoute = {
  path: adminPaths.rootPath,
  middleware: [requireRoleMiddleware('moderator')],
  lazy: async () => {
    const { AdminLayout: Component } = await import('~pages/admin/admin.ui');
    return { Component };
  },
  children: [
    {
      index: true,
      loader: async () => redirect(adminPaths.usersPath),
    },
    {
      path: adminPaths.users,
      lazy: async () => {
        const [{ AdminUsersPage: Component }, { adminUsersLoader: loader }] = await Promise.all([
          import('~pages/admin/users/admin-users.ui'),
          import('~pages/admin/users/admin-users.loader'),
        ]);

        return { Component, loader };
      },
    },
    {
      path: adminPaths.suspendToggle,
      lazy: async () => {
        const { userSuspendToggleAction: action } = await import('~pages/admin/actions/user-suspend-toggle.action');
        return { action };
      },
    },
    {
      path: adminPaths.role,
      middleware: [requireRoleMiddleware('admin')],
      lazy: async () => {
        const { userRoleAction: action } = await import('~pages/admin/actions/user-role.action');
        return { action };
      },
    },
    {
      path: adminPaths.articles,
      lazy: async () => {
        const [{ AdminArticlesPage: Component }, { adminArticlesLoader: loader }] = await Promise.all([
          import('~pages/admin/articles/admin-articles.ui'),
          import('~pages/admin/articles/admin-articles.loader'),
        ]);

        return { Component, loader };
      },
    },
    {
      path: adminPaths.hideToggle,
      lazy: async () => {
        const { articleHideToggleAction: action } = await import('~pages/admin/actions/article-hide-toggle.action');
        return { action };
      },
    },
    {
      path: adminPaths.memberships,
      lazy: async () => {
        const [{ AdminMembershipsPage: Component }, { adminMembershipsLoader: loader }] = await Promise.all([
          import('~pages/admin/memberships/admin-memberships.ui'),
          import('~pages/admin/memberships/admin-memberships.loader'),
        ]);

        return { Component, loader };
      },
    },
    {
      path: adminPaths.payments,
      lazy: async () => {
        const [{ AdminPaymentsPage: Component }, { adminPaymentsLoader: loader }] = await Promise.all([
          import('~pages/admin/payments/admin-payments.ui'),
          import('~pages/admin/payments/admin-payments.loader'),
        ]);

        return { Component, loader };
      },
    },
    {
      path: adminPaths.refund,
      middleware: [requireRoleMiddleware('admin')],
      lazy: async () => {
        const { paymentRefundAction: action } = await import('~pages/admin/actions/payment-refund.action');
        return { action };
      },
    },
    {
      path: adminPaths.log,
      lazy: async () => {
        const [{ AdminLogPage: Component }, { adminLogLoader: loader }] = await Promise.all([
          import('~pages/admin/log/admin-log.ui'),
          import('~pages/admin/log/admin-log.loader'),
        ]);

        return { Component, loader };
      },
    },
  ],
} satisfies RouteObject;
