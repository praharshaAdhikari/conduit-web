import type { Role } from '~shared/api/generated/schemas/role.zod';

// In order of rank: each role can do everything the ones before it can.
export const ROLES: Role[] = ['user', 'moderator', 'admin'];

export function hasRole(role: Role | undefined, required: Role) {
  return role !== undefined && ROLES.indexOf(role) >= ROLES.indexOf(required);
}

// The API's rule: moderators act on ordinary users only, admins on moderators too, nobody on an admin.
export function maySuspend(actor: Role | undefined, target: Role) {
  if (!hasRole(actor, 'moderator') || target === 'admin') {
    return false;
  }

  return target === 'user' || actor === 'admin';
}
