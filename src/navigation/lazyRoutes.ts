import { lazy } from 'react';

/**
 * Lazy-loaded route definitions for optimized initial app load.
 * Each screen component is code-split and loaded on demand.
 */

export const LAZY_ROUTES = {
  HomeScreen: lazy(() => import('../screens/HomeScreen')),
  ExploreScreen: lazy(() => import('../screens/ExploreScreen')),
  QuizScreen: lazy(() => import('../screens/QuizScreen')),
  DiscoverScreen: lazy(() => import('../screens/DiscoverScreen')),
  VinCheckerScreen: lazy(() => import('../screens/VinCheckerScreen')),
  CompareScreen: lazy(() => import('../screens/CompareScreen')),
  FavoritesScreen: lazy(() => import('../screens/FavoritesScreen')),
  NewsScreen: lazy(() => import('../screens/NewsScreen')),
  SettingsScreen: lazy(() => import('../screens/SettingsScreen')),
  WebViewScreen: lazy(() => import('../screens/WebViewScreen')),
} as const;

export type LazyRouteName = keyof typeof LAZY_ROUTES;
