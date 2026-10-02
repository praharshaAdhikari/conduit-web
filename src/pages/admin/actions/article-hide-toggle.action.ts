import type { ActionFunctionArgs, RouterContextProvider } from 'react-router';
import { hideArticle, unhideArticle } from '~shared/api/generated/fetch/admin/admin';
import { HideArticleBody } from '~shared/api/generated/schemas/hideArticleBody.zod';
import { handleApiError } from '~shared/api/handleApiError';
import { validateSchema } from '~shared/api/validateSchema';

export async function articleHideToggleAction({ request, params }: ActionFunctionArgs<RouterContextProvider>) {
  if (!params?.slug) {
    throw new Response('Article not found', { status: 404 });
  }

  const { slug } = params;
  const formData = await request.formData();
  const { operation, ...fields } = Object.fromEntries(formData);

  try {
    if (operation === 'unhide') {
      await unhideArticle(slug, { signal: request.signal });
      return { ok: true as const };
    }

    if (operation === 'hide') {
      const validation = validateSchema(HideArticleBody, { moderation: fields });

      if (!validation.ok) {
        return validation;
      }

      await hideArticle(slug, validation.data, { signal: request.signal });
      return { ok: true as const };
    }

    return new Response('Invalid operation', { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

export type ArticleHideToggleActionData = typeof articleHideToggleAction;
