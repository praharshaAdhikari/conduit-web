// A guest who has confirmed their email address once is given a guest token by the API. Sending it with the
// next tip skips the emailed code. It is not a login.
const GUEST_TOKEN_STORAGE_KEY = 'conduit-guest-token';
export const GUEST_TOKEN_HEADER = 'X-Guest-Token';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getGuestToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(GUEST_TOKEN_STORAGE_KEY);
}

export function setGuestToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(GUEST_TOKEN_STORAGE_KEY, token);
}
