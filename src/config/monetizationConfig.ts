export interface MonetizationEnvironment {
  enableAds?: string;
  useTestAds?: string;
  androidBannerAdUnitId?: string;
}

export interface MonetizationConfig {
  readonly adsEnabled: boolean;
  readonly useTestAds: boolean;
  readonly androidBannerAdUnitId: string | null;
}

export const MONETIZATION_DEFAULTS: MonetizationConfig = {
  adsEnabled: false,
  useTestAds: true,
  androidBannerAdUnitId: null,
};

const isEnabled = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true";

export const createMonetizationConfig = (
  environment: MonetizationEnvironment
): MonetizationConfig => {
  const androidBannerAdUnitId = environment.androidBannerAdUnitId?.trim();
  const adsEnabled = isEnabled(environment.enableAds) && !!androidBannerAdUnitId;

  if (!adsEnabled) {
    return MONETIZATION_DEFAULTS;
  }

  return {
    adsEnabled,
    useTestAds: environment.useTestAds?.toLowerCase() !== "false",
    androidBannerAdUnitId,
  };
};

export const monetizationConfig = createMonetizationConfig({
  enableAds: process.env.EXPO_PUBLIC_ENABLE_ADS,
  useTestAds: process.env.EXPO_PUBLIC_USE_TEST_ADS,
  androidBannerAdUnitId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
});
