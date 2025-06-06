export const getEnv = () => {
  const envs = {
    overviewApiPath: process.env.NEXT_PUBLIC_OVERVIEW_API_PATH,
    aiPerformanceApiPath: process.env.NEXT_PUBLIC_AI_PERFORMANCE_API_PATH,
    conversationFunnelApiPath:
      process.env.NEXT_PUBLIC_CONVERSATION_FUNNEL_API_PATH,
    kbSyncApiPath: process.env.NEXT_PUBLIC_KB_SYNC_API_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    chatwootUrlWithAccId: process.env.NEXT_PUBLIC_CHATWOOT_URL_WITH_ACC_ID,
    activityLogsApiPath: process.env.NEXT_PUBLIC_ACTIVITY_LOGS_API_PATH,
    activityDetailApiPath: process.env.NEXT_PUBLIC_ACTIVITY_DETAIL_API_PATH,
    agentStatusApiPath: process.env.NEXT_PUBLIC_AGENT_STATUS_API_PATH,
    agentControlApiPath: process.env.NEXT_PUBLIC_AGENT_CONTROL_API_PATH,
  };
  return envs;
};
