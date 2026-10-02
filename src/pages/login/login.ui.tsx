import { Form, Link, useActionData, useNavigation, useSearchParams } from 'react-router';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { UserLoginActionData } from './actions/user-login.action';

export function LoginPage() {
  const actionData = useActionData<UserLoginActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const wasSuspended = searchParams.get('reason') === 'suspended';

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>

            {wasSuspended && !actionData && (
              <p className="notice notice-warning" role="alert">
                Your account is suspended, so you have been signed out.
              </p>
            )}

            {actionData && !actionData.ok && <ErrorMessages errors={actionData.errors} />}

            <Form method="POST">
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={isSubmitting}>
                  Sign in
                </button>
              </fieldset>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
