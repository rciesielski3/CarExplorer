import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { createGlobalStyles } from "@/constants/GlobalStyles";

import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../navigation/types";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: {
    name: string;
  };
}

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("WebViewScreen", { url: article.url })}
    >
      <View style={styles.card}>
        {article.urlToImage && (
          <Image source={{ uri: article.urlToImage }} style={styles.image} />
        )}
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.description}>{article.description}</Text>
        {article.url && <Text style={styles.source}>{article.url}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default NewsCard;
