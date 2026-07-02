export interface MonetizationEnvironment {
  enableAds?: string;
  useTestAds?: string;
  androidAppId?: string;
  androidBannerAdUnitId?: string;
}

export interface MonetizationConfig {
  readonly adsEnabled: boolean;
  readonly useTestAds: boolean;
  readonly androidAppId: string | null;
  readonly androidBannerAdUnitId: string | null;
}

export const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
export const TEST_ANDROID_BANNER_AD_UNIT_ID =
  "ca-app-pub-3940256099942544/6300978111";

export const MONETIZATION_DEFAULTS: MonetizationConfig = {
  adsEnabled: false,
  useTestAds: true,
  androidAppId: null,
  androidBannerAdUnitId: null,
};

const isEnabled = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true";

export const createMonetizationConfig = (
  environment: MonetizationEnvironment
): MonetizationConfig => {
  const useTestAds = environment.useTestAds?.toLowerCase() !== "false";
  const androidAppId = useTestAds
    ? TEST_ANDROID_APP_ID
    : environment.androidAppId?.trim();
  const androidBannerAdUnitId = useTestAds
    ? TEST_ANDROID_BANNER_AD_UNIT_ID
    : environment.androidBannerAdUnitId?.trim();
  const adsEnabled =
    isEnabled(environment.enableAds) && !!androidAppId && !!androidBannerAdUnitId;

  if (!adsEnabled) {
    return MONETIZATION_DEFAULTS;
  }

  return {
    adsEnabled,
    useTestAds,
    androidAppId,
    androidBannerAdUnitId,
  };
};

export const monetizationConfig = createMonetizationConfig({
  enableAds: process.env.EXPO_PUBLIC_ENABLE_ADS,
  useTestAds: process.env.EXPO_PUBLIC_USE_TEST_ADS,
  androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
  androidBannerAdUnitId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
});
