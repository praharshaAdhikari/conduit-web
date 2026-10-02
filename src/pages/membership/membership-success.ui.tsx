import { useEffect, useState } from 'react';
import { Link, useLoaderData, useRevalidator } from 'react-router';
import { Spinner } from '~shared/ui/spinner/spinner.ui';
import type { MembershipSuccessLoaderData } from './membership-success.loader';
import { membershipPaths } from './membership.paths';

const POLL_MS = 1500;
const GIVE_UP_MS = 30000;

// The user can arrive back from the payment provider before the provider has told the API about the
// payment, so this page asks again until the membership is active or it has waited long enough.
export function MembershipSuccessPage() {
  const { membership } = useLoaderData<MembershipSuccessLoaderData>();
  const { revalidate } = useRevalidator();
  const [waitedMs, setWaitedMs] = useState(0);

  const isConfirmed = Boolean(membership?.hasAccess);
  const gaveUp = waitedMs >= GIVE_UP_MS;

  useEffect(() => {
    if (isConfirmed || gaveUp) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setWaitedMs((ms) => ms + POLL_MS);
      revalidate();
    }, POLL_MS);

    return () => clearTimeout(timer);
  }, [isConfirmed, gaveUp, waitedMs, revalidate]);

  return (
    <div className="membership-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            {isConfirmed && (
              <div className="card" data-test="membership-confirmed">
                <div className="card-block">
                  <p className="card-text">
                    <strong>Thank you. You are now a member.</strong>
                  </p>
                  <p className="card-text">
                    <Link to="/">Start reading</Link> or <Link to={membershipPaths.rootPath}>see your membership</Link>.
                  </p>
                </div>
              </div>
            )}

            {!isConfirmed && !gaveUp && (
              <div data-test="membership-confirming">
                <Spinner />
                <p className="text-xs-center" role="status">
                  Confirming your payment…
                </p>
              </div>
            )}

            {!isConfirmed && gaveUp && (
              <div className="card" data-test="membership-unconfirmed">
                <div className="card-block">
                  <p className="card-text">
                    <strong>We have not heard from the payment provider yet.</strong>
                  </p>
                  <p className="card-text">
                    Your membership starts as soon as we do. Check{' '}
                    <Link to={membershipPaths.rootPath}>your membership</Link> in a few minutes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
