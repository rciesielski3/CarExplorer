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
import { usePremium } from "../context/PremiumContext";

const AdBanner = () => {
  const { theme } = useTheme();
  const { isPremium } = usePremium();
  const styles = createGlobalStyles(theme);
  const [adFailed, setAdFailed] = React.useState(false);

  if (
    isPremium ||
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
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          maxAdContentRating: "G",
        }}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
};

export default AdBanner;
