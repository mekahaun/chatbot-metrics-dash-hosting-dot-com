export const getEnv = () => {
  const envs = {
    kbSyncApiPath: process.env.NEXT_PUBLIC_KB_SYNC_API_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    chatwootUrlWithAccId: process.env.NEXT_PUBLIC_CHATWOOT_URL_WITH_ACC_ID,
  };
  return envs;
};
