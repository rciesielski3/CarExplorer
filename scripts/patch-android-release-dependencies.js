const fs = require("fs");
const path = require("path");

const packagePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-google-mobile-ads",
  "package.json"
);
const bundleHermesTaskPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@react-native",
  "gradle-plugin",
  "react-native-gradle-plugin",
  "src",
  "main",
  "kotlin",
  "com",
  "facebook",
  "react",
  "tasks",
  "BundleHermesCTask.kt"
);

const targetVersion = "23.6.0";

if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const androidSdkVersions = packageJson.sdkVersions?.android;

  if (!androidSdkVersions) {
    throw new Error(
      "Could not find sdkVersions.android in react-native-google-mobile-ads package.json."
    );
  }

  if (androidSdkVersions.googleMobileAds === targetVersion) {
    console.log(`Google Mobile Ads SDK already pinned to ${targetVersion}.`);
  } else {
    androidSdkVersions.googleMobileAds = targetVersion;
    fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log(`Pinned Google Mobile Ads SDK to ${targetVersion}.`);
  }
} else {
  console.warn(
    "react-native-google-mobile-ads is not installed yet; skipping SDK patch."
  );
}

if (!fs.existsSync(bundleHermesTaskPath)) {
  console.warn(
    "React Native Gradle bundle task not found; skipping Metro cache patch."
  );
  process.exit(0);
}

const taskSource = fs.readFileSync(bundleHermesTaskPath, "utf8");
let updatedTaskSource = taskSource;
const taskPatches = [
  {
    line: '          add("--reset-cache")\n',
    replacement: "          // Keep Metro cache for reliable local release builds.\n",
    label: "Metro cache reset",
  },
  {
    line: '          add("--verbose")\n',
    replacement: "          // Keep Expo export non-verbose to avoid local Metro stalls.\n",
    label: "Expo export verbose mode",
  },
];

for (const patch of taskPatches) {
  if (updatedTaskSource.includes(patch.line)) {
    updatedTaskSource = updatedTaskSource.replace(patch.line, patch.replacement);
    console.log(`Disabled ${patch.label} in React Native Gradle bundle task.`);
  } else {
    console.log(
      `React Native Gradle bundle task already skips ${patch.label}.`
    );
  }
}

if (updatedTaskSource !== taskSource) {
  fs.writeFileSync(bundleHermesTaskPath, updatedTaskSource);
}
