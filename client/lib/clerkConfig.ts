export const isClerkKeyConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  if (!key) return false;
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  // Exclude placeholder dummy strings
  if (key.includes('b3JnYW5pdmEtZGV2') || key.includes('sample') || key.includes('placeholder')) {
    return false;
  }
  return true;
};
