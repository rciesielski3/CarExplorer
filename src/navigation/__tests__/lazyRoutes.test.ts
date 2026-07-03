import { LAZY_ROUTES, getLazyComponent } from '../lazyRoutes';

describe('Lazy Routes', () => {
  it('defines all expected routes', () => {
    const expectedRoutes = [
      'HomeScreen',
      'DetailScreen',
      'FavoritesScreen',
      'SettingsScreen',
      'QuizScreen',
      'SpecificationsScreen',
    ];

    expectedRoutes.forEach((route) => {
      expect(LAZY_ROUTES).toHaveProperty(route);
    });
  });

  it('returns lazy component for valid route name', () => {
    const component = getLazyComponent('HomeScreen');
    expect(component).toBeDefined();
    expect(component.$$typeof).toBeDefined();
  });

  it('throws error for invalid route name', () => {
    expect(() => {
      getLazyComponent('InvalidScreen' as any);
    }).toThrow();
  });
});
