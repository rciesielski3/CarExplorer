import React from "react";
import { Platform, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { monetizationConfig } from "../config/monetizationConfig";
import { useTheme } from "../context/ThemeContext";

const AdBanner = () => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const [adFailed, setAdFailed] = React.useState(false);

  if (
    Platform.OS !== "android" ||
    !monetizationConfig.adsEnabled ||
    !monetizationConfig.androidBannerAdUnitId ||
    adFailed
  ) {
    return null;
  }

  const unitId = monetizationConfig.useTestAds
    ? TestIds.BANNER
    : monetizationConfig.androidBannerAdUnitId;

  return (
    <View style={styles.adBannerContainer}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
};

export default AdBanner;
