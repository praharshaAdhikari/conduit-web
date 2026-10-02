import * as zod from 'zod/mini';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const MAX_LIMIT = 100;

const OffsetSchema = zod.coerce.number().check(zod.int(), zod.nonnegative(), zod.lte(Number.MAX_SAFE_INTEGER));
const LimitSchema = zod.coerce.number().check(zod.int(), zod.gte(1), zod.lte(MAX_LIMIT));

const PaginationSchema = zod.object({
  limit: zod.catch(LimitSchema, DEFAULT_LIMIT),
  offset: zod.catch(OffsetSchema, DEFAULT_OFFSET),
});

export type AdminPagination = {
  limit: number;
  offset: number;
};

export function parseAdminPagination(searchParams: URLSearchParams): AdminPagination {
  return PaginationSchema.parse({
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  });
}

export type HiddenFilter = 'true' | 'false' | undefined;

export function parseHiddenFilter(searchParams: URLSearchParams): HiddenFilter {
  const hidden = searchParams.get('hidden');
  return hidden === 'true' || hidden === 'false' ? hidden : undefined;
}
