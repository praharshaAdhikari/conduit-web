import type { ReactNode } from 'react';
import { Link, useFetcher, useLoaderData } from 'react-router';
import type { Tip } from '~shared/api/generated/schemas/tip.zod';
import { formatMoney } from '~shared/lib/money';
import { useRevalidateUntil } from '~shared/lib/react-router/useRevalidateUntil';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import { Spinner } from '~shared/ui/spinner/spinner.ui';
import type { TipResendActionData } from './actions/tip-resend.action';
import type { TipVerifyActionData } from './actions/tip-verify.action';
import type { TipPageLoaderData } from './tip.loader';
import { tipPaths } from './tip.paths';

export function TipPage() {
  const { tip, leftCheckout } = useLoaderData<TipPageLoaderData>();
  const isWaitingForPayment = tip.status === 'pending_payment' && !leftCheckout;
  const gaveUp = useRevalidateUntil(!isWaitingForPayment);

  return (
    <div className="tip-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <p className="text-xs-center" data-test="tip-summary">
              A tip of {formatMoney(tip.amountCents, tip.currency)} to <BackLink tip={tip} />
            </p>

            {tip.status === 'pending_verification' && <TipCodeForm reference={tip.reference} />}

            {isWaitingForPayment && !gaveUp && (
              <div data-test="tip-confirming">
                <Spinner />
                <p className="text-xs-center" role="status">
                  Confirming your payment…
                </p>
              </div>
            )}
            {isWaitingForPayment && gaveUp && (
              <TipNotice test="tip-unconfirmed" title="We have not heard from the payment provider yet.">
                Your tip is sent as soon as we do. You will get a receipt by email.
              </TipNotice>
            )}
            {tip.status === 'pending_payment' && leftCheckout && (
              <TipNotice test="tip-left" title="You left the checkout.">
                Nothing was charged. You can start again from <BackLink tip={tip} />.
              </TipNotice>
            )}

            {tip.status === 'paid' && (
              <TipNotice test="tip-paid" title="Thank you. Your tip was received.">
                A receipt is on its way to your email.
              </TipNotice>
            )}
            {tip.status === 'expired' && (
              <TipNotice test="tip-expired" title="This tip was not paid.">
                Its checkout is closed. You can start again from <BackLink tip={tip} />.
              </TipNotice>
            )}
            {tip.status === 'refunded' && (
              <TipNotice test="tip-refunded" title="This tip was refunded.">
                The payment has been given back.
              </TipNotice>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type BackLinkProps = {
  tip: Tip;
};

// The page the tip was started from: the article if there was one, otherwise the author's profile.
function BackLink({ tip }: BackLinkProps) {
  return <Link to={tip.article ? `/article/${tip.article}` : `/profile/${tip.author}`}>{tip.author}</Link>;
}

type TipNoticeProps = {
  test: string;
  title: string;
  children: ReactNode;
};

function TipNotice({ test, title, children }: TipNoticeProps) {
  return (
    <div className="card" data-test={test}>
      <div className="card-block">
        <p className="card-text">
          <strong>{title}</strong>
        </p>
        <p className="card-text">{children}</p>
      </div>
    </div>
  );
}

type TipCodeFormProps = {
  reference: string;
};

function TipCodeForm({ reference }: TipCodeFormProps) {
  const verifyFetcher = useFetcher<TipVerifyActionData>({ key: `tip-verify-${reference}` });
  const resendFetcher = useFetcher<TipResendActionData>({ key: `tip-resend-${reference}` });
  const isPending = verifyFetcher.state !== 'idle' || resendFetcher.state !== 'idle';

  return (
    <div className="card" data-test="tip-code">
      <div className="card-block">
        <p className="card-text">
          <strong>Confirm your email address.</strong>
        </p>
        <p className="card-text">We emailed you a 6-digit code. It works for 10 minutes.</p>

        {verifyFetcher.data && !verifyFetcher.data.ok && <ErrorMessages errors={verifyFetcher.data.errors} />}
        {resendFetcher.data && !resendFetcher.data.ok && <ErrorMessages errors={resendFetcher.data.errors} />}
        {resendFetcher.data?.ok && resendFetcher.state === 'idle' && (
          <p className="notice" role="status" data-test="tip-code-resent">
            A new code is on its way. The earlier one no longer works.
          </p>
        )}

        <verifyFetcher.Form method="post" action={tipPaths.getVerifyPath(reference)} className="inline-form">
          <input
            className="form-control"
            type="text"
            name="code"
            placeholder="6-digit code"
            aria-label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            Confirm and pay
          </button>
        </verifyFetcher.Form>

        <resendFetcher.Form method="post" action={tipPaths.getResendPath(reference)}>
          <button className="btn btn-sm btn-outline-secondary" type="submit" disabled={isPending}>
            Send a new code
          </button>
        </resendFetcher.Form>
      </div>
    </div>
  );
}
