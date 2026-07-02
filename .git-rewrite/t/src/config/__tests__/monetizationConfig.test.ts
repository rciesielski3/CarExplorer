import {
  createMonetizationConfig,
  MONETIZATION_DEFAULTS,
  TEST_ANDROID_APP_ID,
  TEST_ANDROID_BANNER_AD_UNIT_ID,
} from "../monetizationConfig";

describe("monetizationConfig", () => {
  it("keeps ads disabled by default", () => {
    expect(createMonetizationConfig({})).toEqual(MONETIZATION_DEFAULTS);
  });

  it("enables AdMob only when explicitly configured", () => {
    expect(
      createMonetizationConfig({
        enableAds: "TRUE",
        useTestAds: "False",
        androidAppId: "ca-app-pub-test~app",
        androidBannerAdUnitId: "ca-app-pub-test/banner",
      })
    ).toEqual({
      adsEnabled: true,
      useTestAds: false,
      androidAppId: "ca-app-pub-test~app",
      androidBannerAdUnitId: "ca-app-pub-test/banner",
    });
  });

  it("does not enable ads without an Android banner ad unit", () => {
    expect(
      createMonetizationConfig({
        enableAds: "true",
        useTestAds: "false",
      })
    ).toEqual(MONETIZATION_DEFAULTS);
  });

  it("handles false test-ad flags regardless of casing", () => {
    expect(
      createMonetizationConfig({
        enableAds: "true",
        useTestAds: "False",
        androidAppId: "ca-app-pub-test~app",
        androidBannerAdUnitId: "ca-app-pub-test/banner",
      })
    ).toEqual({
      adsEnabled: true,
      useTestAds: false,
      androidAppId: "ca-app-pub-test~app",
      androidBannerAdUnitId: "ca-app-pub-test/banner",
    });
  });

  it("uses Google test IDs when test ads are enabled", () => {
    expect(
      createMonetizationConfig({
        enableAds: "true",
        useTestAds: "true",
      })
    ).toEqual({
      adsEnabled: true,
      useTestAds: true,
      androidAppId: TEST_ANDROID_APP_ID,
      androidBannerAdUnitId: TEST_ANDROID_BANNER_AD_UNIT_ID,
    });
  });
});
