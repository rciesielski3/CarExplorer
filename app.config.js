require("dotenv/config");

const TEST_ANDROID_ADMOB_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    CAR_IMAGES_API_KEY: process.env.CAR_IMAGES_API_KEY,
    eas: {
      projectId: "6a20e007-464d-4f09-92e6-a7c369ba3bd8",
    },
  },
  plugins: [
    ...(config.plugins || []),
    [
      "react-native-google-mobile-ads",
      {
        androidAppId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
          TEST_ANDROID_ADMOB_APP_ID,
        iosAppId:
          process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || TEST_IOS_ADMOB_APP_ID,
      },
    ],
  ],
});
