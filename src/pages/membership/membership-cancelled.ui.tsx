import { Link } from 'react-router';
import { membershipPaths } from './membership.paths';

export function MembershipCancelledPage() {
  return (
    <div className="membership-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <div className="card" data-test="membership-checkout-cancelled">
              <div className="card-block">
                <p className="card-text">
                  <strong>You left the checkout.</strong>
                </p>
                <p className="card-text">
                  Nothing was charged. You can <Link to={membershipPaths.rootPath}>choose a plan</Link> whenever you
                  like.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
