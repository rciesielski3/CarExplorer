import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createGlobalStyles,
  createHomeScreenStyles,
} from "@/constants/GlobalStyles";
import { Colors } from "@/constants/Colors";
import { fetchQuizQuestions } from "../services/quizService";
import { useAppLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import {
  CustomButton,
  ErrorMessage,
  LoadingIndicator,
  ScreenContainer,
} from "../components";
import QuizQuestion from "../components/QuizQuestion";
import { RootStackParamList } from "../navigation/types";

interface Question {
  question: string;
  options: string[];
  answer: string;
  userAnswer?: string;
}

const QuizScreen = () => {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [showScore, setShowScore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);

  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const styles = createGlobalStyles(theme);
  const stylesHome = createHomeScreenStyles(theme);

  const loadQuestions = React.useCallback(async () => {
    setLoading(true);
    setShowScore(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);

    const fetchedQuestions = await fetchQuizQuestions(language);
    setQuestions(fetchedQuestions);
    setLoading(false);
  }, [language]);

  const handleAnswer = (selectedAnswer: string) => {
    if (!questions[currentQuestion]) return;

    if (selectedAnswer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[currentQuestion].userAnswer = selectedAnswer;
      return updatedQuestions;
    });

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  React.useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <ScreenContainer>
      <View style={stylesHome.container}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("back", "Back")}
          style={styles.compareBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={18} color={Colors[theme].text} />
          <Text style={styles.compareBackText}>{t("back", "Back")}</Text>
        </TouchableOpacity>

        {loading ? (
          <LoadingIndicator type="QUIZLOADING" />
        ) : questions.length === 0 ? (
          <ErrorMessage message={t("noQuestions")} />
        ) : showScore ? (
          <View style={[styles.resultContainer, styles.centeredContent, { paddingHorizontal: 16, paddingVertical: 24 }]}>
            <Text style={styles.subtitle}>
              {t("yourScore")}: {score}/{questions.length}
            </Text>
            <View style={quizStyles.scoreActions}>
              <CustomButton title={t("restartQuiz")} onPress={loadQuestions} />
              <CustomButton
                title={t("viewAnswers")}
                onPress={() => setShowModal(true)}
                variant="success"
              />
            </View>
          </View>
        ) : (
          <View style={styles.centeredContent}>
            <QuizQuestion
              question={questions[currentQuestion]?.question || t("loading")}
              options={questions[currentQuestion]?.options || []}
              onAnswer={handleAnswer}
            />
          </View>
        )}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View
            style={[
              styles.modalContainer,
              quizStyles.answersModalOverlay,
              {
                paddingTop: Math.max(insets.top + 24, 44),
                paddingBottom: Math.max(insets.bottom + 24, 44),
              },
            ]}
          >
            <View style={[styles.modalContent, quizStyles.answersModalContent]}>
              <ScrollView
                style={[styles.scrollContainer, quizStyles.answersScroll]}
                contentContainerStyle={[
                  styles.modalScrollContent,
                  quizStyles.answersScrollContent,
                ]}
                showsVerticalScrollIndicator
              >
                <Text style={styles.subtitle}>{t("yourAnswers")}</Text>
                {questions.map((q, index) => (
                  <View key={index} style={styles.answerContainer}>
                    <Text style={styles.questionText}>{q.question}</Text>
                    <Text
                      style={[
                        styles.questionText,
                        q.userAnswer === q.answer
                          ? styles.correctAnswer
                          : styles.wrongAnswer,
                      ]}
                    >
                      {t("yourAnswer")}: {q.userAnswer || t("noAnswer")}
                    </Text>
                    {q.userAnswer !== q.answer && (
                      <Text style={styles.correctAnswer}>
                        {t("correctAnswer")}: {q.answer}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
              <CustomButton
                title={t("close")}
                onPress={() => setShowModal(false)}
                variant="danger"
                style={quizStyles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const quizStyles = StyleSheet.create({
  scoreActions: {
    alignSelf: "stretch",
    gap: 12,
    marginTop: 12,
  },
  answersModalOverlay: {
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  answersModalContent: {
    alignSelf: "center",
    flexShrink: 1,
    maxHeight: "90%",
    width: "100%",
    borderRadius: 12,
    backgroundColor: Colors["light"].card,
  },
  answersScroll: {
    flexShrink: 1,
    maxHeight: "85%",
  },
  answersScrollContent: {
    paddingBottom: 8,
  },
  modalButton: {
    alignSelf: "stretch",
    marginTop: 12,
  },
});

export default QuizScreen;
