export const tipPaths = {
  verify: 'verify',
  resend: 'resend',
  listPath: '/tips',
  createPath: '/tips/new',
  getTipPath: (reference: string) => `/tips/${reference}`,
  getVerifyPath: (reference: string) => `/tips/${reference}/verify`,
  getResendPath: (reference: string) => `/tips/${reference}/resend`,
};
