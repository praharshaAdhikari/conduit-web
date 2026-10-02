import type { RouteObject } from 'react-router';
import { requireAuthMiddleware } from '~shared/lib/react-router/requireAuthMiddleware';
import { membershipPaths } from './membership.paths';

export const membershipRoute = {
  path: membershipPaths.rootPath,
  middleware: [requireAuthMiddleware],
  lazy: async () => {
    const [{ MembershipPage: Component }, { membershipPageLoader: loader }] = await Promise.all([
      import('~pages/membership/membership.ui'),
      import('~pages/membership/membership.loader'),
    ]);

    return { Component, loader };
  },
  children: [
    {
      path: membershipPaths.checkout,
      lazy: async () => {
        const { membershipCheckoutAction: action } = await import(
          '~pages/membership/actions/membership-checkout.action'
        );
        return { action };
      },
    },
    {
      path: membershipPaths.cancelToggle,
      lazy: async () => {
        const { membershipCancelToggleAction: action } = await import(
          '~pages/membership/actions/membership-cancel-toggle.action'
        );
        return { action };
      },
    },
  ],
} satisfies RouteObject;

// Where the payment provider sends the user back to.
export const membershipSuccessRoute = {
  path: membershipPaths.successPath,
  middleware: [requireAuthMiddleware],
  lazy: async () => {
    const [{ MembershipSuccessPage: Component }, { membershipSuccessLoader: loader }] = await Promise.all([
      import('~pages/membership/membership-success.ui'),
      import('~pages/membership/membership-success.loader'),
    ]);

    return { Component, loader };
  },
} satisfies RouteObject;

export const membershipCancelledRoute = {
  path: membershipPaths.cancelledPath,
  lazy: async () => {
    const { MembershipCancelledPage: Component } = await import('~pages/membership/membership-cancelled.ui');
    return { Component };
  },
} satisfies RouteObject;
