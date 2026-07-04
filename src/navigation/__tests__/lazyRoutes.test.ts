import { LAZY_ROUTES } from '../lazyRoutes';

describe('Lazy Routes', () => {
  it('defines all expected routes', () => {
    const expectedRoutes = [
      'HomeScreen',
      'ExploreScreen',
      'QuizScreen',
      'DiscoverScreen',
      'VinCheckerScreen',
      'CompareScreen',
      'FavoritesScreen',
      'NewsScreen',
      'SettingsScreen',
      'WebViewScreen',
    ];

    expectedRoutes.forEach((route) => {
      expect(LAZY_ROUTES).toHaveProperty(route);
    });
  });
});
