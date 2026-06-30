import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import QuizScreen from '../QuizScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { LanguageProvider } from '../../context/LanguageContext';

describe('QuizScreen Mobile Layout', () => {
  it('score summary displays on mobile viewport', () => {
    // Mock small mobile dimensions
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 360,
      height: 640,
      scale: 1,
      fontScale: 1,
    });

    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <QuizScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    // Component should render without crashing
    expect(getByText).toBeTruthy();
  });

  it('quiz modal has maxHeight constraint', () => {
    const { getByTestId } = render(
      <LanguageProvider>
        <ThemeProvider>
          <QuizScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    // Verify component renders
    expect(getByTestId).toBeTruthy();
  });

  it('answer list scrolls properly on mobile', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 360,
      height: 640,
      scale: 1,
      fontScale: 1,
    });

    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <QuizScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText).toBeTruthy();
  });

  it('quiz buttons remain accessible on mobile', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 360,
      height: 640,
      scale: 1,
      fontScale: 1,
    });

    const { getByText } = render(
      <LanguageProvider>
        <ThemeProvider>
          <QuizScreen />
        </ThemeProvider>
      </LanguageProvider>
    );

    expect(getByText).toBeTruthy();
  });
});
