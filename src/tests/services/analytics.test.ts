/**
 * @module AnalyticsService Tests
 * Tests for the AnalyticsService wrapper around Firebase Analytics.
 */
import { vi } from 'vitest';
import { AnalyticsService } from '@/services/analytics.service';

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────

const analyticsMocks = vi.hoisted(() => ({
  logEvent: vi.fn(),
  setUserProperties: vi.fn(),
  getAnalytics: vi.fn(() => ({})),
  getFirebaseAnalytics: vi.fn(() => ({})),
}));

vi.mock('@/lib/firebase', () => ({
  getFirebaseAnalytics: analyticsMocks.getFirebaseAnalytics,
  app: {},
}));

vi.mock('firebase/analytics', () => ({
  logEvent: analyticsMocks.logEvent,
  setUserProperties: analyticsMocks.setUserProperties,
  getAnalytics: analyticsMocks.getAnalytics,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {});
    analyticsMocks.getAnalytics.mockReturnValue({});
    analyticsMocks.getFirebaseAnalytics.mockReturnValue({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no-ops when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    AnalyticsService.trackPageView('/dashboard');
    expect(analyticsMocks.logEvent).not.toHaveBeenCalled();
  });

  it('no-ops when getAnalytics throws error', () => {
    analyticsMocks.getAnalytics.mockImplementationOnce(() => {
      throw new Error('Blocked');
    });
    AnalyticsService.trackPageView('/dashboard');
    expect(analyticsMocks.logEvent).not.toHaveBeenCalled();
  });

  it('tracks page views', () => {
    AnalyticsService.trackPageView('/dashboard', 'Dashboard Title');
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'page_view', {
      page_path: '/dashboard',
      page_title: 'Dashboard Title',
    });
  });

  it('tracks page views fallback page title', () => {
    AnalyticsService.trackPageView('/dashboard');
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'page_view', {
      page_path: '/dashboard',
      page_title: '/dashboard',
    });
  });

  it('tracks login', () => {
    AnalyticsService.trackLogin({ method: 'email' });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'login', {
      method: 'email',
    });
  });

  it('tracks activity logged', () => {
    AnalyticsService.trackCarbonActivity({ category: 'transport', value: 10, unit: 'km', carbonEmit: 2.1 });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'carbon_activity_logged', {
      category: 'transport',
      value: 10,
      unit: 'km',
      carbon_emit_kg: 2.1,
    });
  });

  it('tracks custom event', () => {
    AnalyticsService.trackEvent('custom_event', { prop: 'val' });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'custom_event', {
      prop: 'val',
    });
  });

  it('tracks user property', () => {
    AnalyticsService.trackUserProperty('user_country', 'US');
    expect(analyticsMocks.setUserProperties).toHaveBeenCalledWith(expect.any(Object), {
      user_country: 'US',
    });
  });

  it('tracks goal set', () => {
    AnalyticsService.trackGoalSet({ category: 'transport', targetValue: 50 });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'goal_set', {
      category: 'transport',
      target_value_kg: 50,
    });
  });

  it('tracks AI chat message', () => {
    AnalyticsService.trackAiChat({ messageLength: 100, role: 'user' });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'ai_chat_message', {
      message_length: 100,
      role: 'user',
    });
  });

  it('tracks onboarding steps', () => {
    AnalyticsService.trackOnboardingStep({ step: 1, stepName: 'Welcome', completed: true });
    expect(analyticsMocks.logEvent).toHaveBeenCalledWith(expect.any(Object), 'onboarding_step', {
      step: 1,
      step_name: 'Welcome',
      completed: true,
    });
  });
});
