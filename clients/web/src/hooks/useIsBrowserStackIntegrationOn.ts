import { useFeatureValue } from "@growthbook/growthbook-react";
import { isNodeEnvDev } from "@requestly/utils";

export const useIsBrowserStackIntegrationOn = () => {
  const featureValue = useFeatureValue("browserstack_integration", true);
  const isBrowserStackIntegrationEnabled = isNodeEnvDev() ? false : featureValue;
  // TODO: Add localStorage.get("forceBsIntegration") check when bookmarklet is implemented
  return isBrowserStackIntegrationEnabled;
};
