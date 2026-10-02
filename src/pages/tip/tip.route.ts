import { redirect } from 'react-router';
import type { RouteObject } from 'react-router';
import { requireAuthMiddleware } from '~shared/lib/react-router/requireAuthMiddleware';
import { tipPaths } from './tip.paths';

// The tip form on the article and profile pages posts here.
export const tipCreateRoute = {
  path: tipPaths.createPath,
  loader: async () => redirect('/'),
  lazy: async () => {
    const { tipCreateAction: action } = await import('~pages/tip/actions/tip-create.action');
    return { action };
  },
} satisfies RouteObject;

export const tipsRoute = {
  path: tipPaths.listPath,
  middleware: [requireAuthMiddleware],
  lazy: async () => {
    const [{ TipsPage: Component }, { tipsPageLoader: loader }] = await Promise.all([
      import('~pages/tip/tips.ui'),
      import('~pages/tip/tips.loader'),
    ]);

    return { Component, loader };
  },
} satisfies RouteObject;

// One tip: where a guest enters their code, and where the payment provider sends the tipper back to.
export const tipRoute = {
  path: '/tips/:reference',
  lazy: async () => {
    const [{ TipPage: Component }, { tipPageLoader: loader }] = await Promise.all([
      import('~pages/tip/tip.ui'),
      import('~pages/tip/tip.loader'),
    ]);

    return { Component, loader };
  },
  children: [
    {
      path: tipPaths.verify,
      lazy: async () => {
        const { tipVerifyAction: action } = await import('~pages/tip/actions/tip-verify.action');
        return { action };
      },
    },
    {
      path: tipPaths.resend,
      lazy: async () => {
        const { tipResendAction: action } = await import('~pages/tip/actions/tip-resend.action');
        return { action };
      },
    },
  ],
} satisfies RouteObject;
