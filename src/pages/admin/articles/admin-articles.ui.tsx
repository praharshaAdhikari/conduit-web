import { Link, useFetcher, useLoaderData } from 'react-router';
import type { AdminArticle } from '~shared/api/generated/schemas/adminArticle.zod';
import { formatDate } from '~shared/lib/date';
import { ErrorMessages } from '~shared/ui/error-messages/error-messages.ui';
import type { ArticleHideToggleActionData } from '../actions/article-hide-toggle.action';
import { AdminPagination } from '../admin-pagination.ui';
import { adminPaths } from '../admin.paths';
import type { HiddenFilter } from '../admin.state';
import type { AdminArticlesLoaderData } from './admin-articles.loader';

const FILTERS: { label: string; hidden: HiddenFilter }[] = [
  { label: 'All', hidden: undefined },
  { label: 'Hidden', hidden: 'true' },
  { label: 'Visible', hidden: 'false' },
];

export function AdminArticlesPage() {
  const { articlesData, pagination, hidden } = useLoaderData<AdminArticlesLoaderData>();

  return (
    <>
      <p className="list-filters">
        {FILTERS.map((filter) => (
          <Link
            key={filter.label}
            className={filter.hidden === hidden ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-outline-secondary'}
            to={{ search: filter.hidden ? `?hidden=${filter.hidden}` : '' }}
            aria-current={filter.hidden === hidden ? 'true' : undefined}
          >
            {filter.label}
          </Link>
        ))}
      </p>

      <p className="list-count" data-test="admin-articles-count">
        {articlesData.articlesCount} {articlesData.articlesCount === 1 ? 'article' : 'articles'}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Created</th>
            <th>Status</th>
            <th>Visibility</th>
          </tr>
        </thead>
        <tbody>
          {articlesData.articles.map((article) => (
            <AdminArticleRow key={article.slug} article={article} />
          ))}
        </tbody>
      </table>

      <AdminPagination pagination={pagination} count={articlesData.articlesCount} />
    </>
  );
}

type AdminArticleRowProps = {
  article: AdminArticle;
};

function AdminArticleRow({ article }: AdminArticleRowProps) {
  const { slug, title, author, createdAt, hidden, hiddenBy, hiddenReason } = article;

  return (
    <tr data-test="admin-article-row">
      <td>
        <Link to={`/article/${slug}`}>{title}</Link>
      </td>
      <td>
        <Link to={`/profile/${author}`}>{author}</Link>
      </td>
      <td>{formatDate(createdAt)}</td>
      <td>
        {hidden ? (
          <>
            <span className="badge badge-danger">Hidden</span>
            <br />
            <small>
              {hiddenReason}
              {hiddenBy ? ` (by ${hiddenBy})` : ''}
            </small>
          </>
        ) : (
          <span className="badge">Visible</span>
        )}
      </td>
      <td>
        <HideForm slug={slug} hidden={hidden} />
      </td>
    </tr>
  );
}

type HideFormProps = {
  slug: string;
  hidden: boolean;
};

function HideForm({ slug, hidden }: HideFormProps) {
  const hideFetcher = useFetcher<ArticleHideToggleActionData>({ key: `admin-hide-toggle-${slug}` });
  const isPending = hideFetcher.state !== 'idle';

  return (
    <>
      <hideFetcher.Form
        key={String(hidden)}
        method="post"
        action={adminPaths.getHideTogglePath(slug)}
        className="inline-form"
      >
        <input type="hidden" name="operation" value={hidden ? 'unhide' : 'hide'} />
        {!hidden && (
          <input
            className="form-control form-control-sm"
            type="text"
            name="reason"
            placeholder="Reason"
            aria-label={`Reason for hiding ${slug}`}
            maxLength={255}
            required
          />
        )}
        <button
          className={hidden ? 'btn btn-sm btn-outline-secondary' : 'btn btn-sm btn-outline-danger'}
          type="submit"
          disabled={isPending}
        >
          {hidden ? 'Show' : 'Hide'}
        </button>
      </hideFetcher.Form>
      {hideFetcher.data && !hideFetcher.data.ok && <ErrorMessages errors={hideFetcher.data.errors} />}
    </>
  );
}
