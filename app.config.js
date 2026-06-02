require("dotenv/config");

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    ENABLE_ADS: process.env.EXPO_PUBLIC_ENABLE_ADS,
    USE_TEST_ADS: process.env.EXPO_PUBLIC_USE_TEST_ADS,
    ADMOB_ANDROID_BANNER_ID: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
    eas: {
      projectId: "6a20e007-464d-4f09-92e6-a7c369ba3bd8",
    },
  },
});
