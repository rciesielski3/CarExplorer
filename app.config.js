require("dotenv/config");

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    eas: {
      projectId: "6a20e007-464d-4f09-92e6-a7c369ba3bd8",
    },
  },
});
