import {
  createMonetizationConfig,
  MONETIZATION_DEFAULTS,
} from "../monetizationConfig";

describe("monetizationConfig", () => {
  it("keeps ads disabled by default", () => {
    expect(createMonetizationConfig({})).toEqual(MONETIZATION_DEFAULTS);
  });

  it("enables AdMob only when explicitly configured", () => {
    expect(
      createMonetizationConfig({
        enableAds: "true",
        useTestAds: "true",
        androidBannerAdUnitId: "ca-app-pub-test/banner",
      })
    ).toEqual({
      adsEnabled: true,
      useTestAds: true,
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
});
