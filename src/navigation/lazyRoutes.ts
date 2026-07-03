import { lazy } from 'react';

/**
 * Lazy-loaded route definitions for optimized initial app load.
 * Each screen component is code-split and loaded on demand.
 */

export const LAZY_ROUTES = {
  HomeScreen: lazy(() => import('../screens/HomeScreen')),
  DetailScreen: lazy(() => import('../screens/DetailScreen')),
  FavoritesScreen: lazy(() => import('../screens/FavoritesScreen')),
  SettingsScreen: lazy(() => import('../screens/SettingsScreen')),
  QuizScreen: lazy(() => import('../screens/QuizScreen')),
  SpecificationsScreen: lazy(() => import('../screens/SpecificationsScreen')),
} as const;

export function getLazyComponent(
  componentName: keyof typeof LAZY_ROUTES
): typeof LAZY_ROUTES[keyof typeof LAZY_ROUTES] {
  if (!(componentName in LAZY_ROUTES)) {
    throw new Error(`Invalid lazy route: ${componentName}`);
  }
  return LAZY_ROUTES[componentName];
}

export type LazyRouteName = keyof typeof LAZY_ROUTES;
