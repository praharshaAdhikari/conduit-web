import { useId } from 'react';
import { useFetcher } from 'react-router';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { TipCreateActionData } from './actions/tip-create.action';
import { tipPaths } from './tip.paths';

type TipFormProps = {
  /** Username of the author being tipped. */
  author: string;
  /** Slug of the article the form is shown on, if any. */
  article?: string;
  /** A guest has to give an email address; a logged-in user's own is used. */
  isGuest: boolean;
};

// Shown on the article and profile pages. It opens on request, so it does not crowd the page.
export function TipForm({ author, article, isGuest }: TipFormProps) {
  const tipFetcher = useFetcher<TipCreateActionData>({ key: `tip-create-${author}-${article ?? 'profile'}` });
  const isPending = tipFetcher.state !== 'idle';
  const amountId = useId();

  return (
    <details className="tip-box" data-test="tip-box">
      <summary className="btn btn-sm btn-outline-primary">Tip {author}</summary>

      <tipFetcher.Form method="post" action={tipPaths.createPath} className="card">
        <div className="card-block">
          {tipFetcher.data && !tipFetcher.data.ok && <ErrorMessages errors={tipFetcher.data.errors} />}

          <input type="hidden" name="author" value={author} />
          {article && <input type="hidden" name="article" value={article} />}

          <fieldset disabled={isPending}>
            <fieldset className="form-group">
              <label htmlFor={amountId}>
                Amount in US dollars (1 to 500)
                <input
                  className="form-control"
                  id={amountId}
                  type="number"
                  name="amount"
                  min="1"
                  max="500"
                  step="0.01"
                  defaultValue="5"
                  required
                />
              </label>
            </fieldset>
            <fieldset className="form-group">
              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="Your name (optional)"
                maxLength={64}
              />
            </fieldset>
            <fieldset className="form-group">
              <textarea
                className="form-control"
                name="message"
                rows={2}
                placeholder={`A message for ${author} (optional)`}
                maxLength={280}
              />
            </fieldset>
            {isGuest && (
              <fieldset className="form-group">
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  placeholder="Your email, for the receipt"
                  autoComplete="email"
                  required
                />
              </fieldset>
            )}
            <button className="btn btn-primary" type="submit" disabled={isPending}>
              Continue to payment
            </button>
          </fieldset>
        </div>
      </tipFetcher.Form>
    </details>
  );
}
