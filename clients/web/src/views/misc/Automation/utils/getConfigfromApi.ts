import { createApiClient } from "@requestly/api-client";

export const getConfigfromApi = async (apiKey: string): Promise<any> => {
  try {
    const apiClient = createApiClient("https://api2.requestly.io");
    apiClient.rules.setAuthToken(apiKey);

    const result = await apiClient.rules.getRules();

    if (!result?.success) {
      throw new Error("Failed to fetch rules");
    }

    return result.data;
  } catch (error) {
    throw new Error(`Failed to fetch config: ${error.message}`);
  }
};

export default getConfigfromApi;
