/**
 * Configuration globale de l'application Smart Orchard
 */

export const APP_CONFIG = {
  PAGINATION: {
    ITEMS_PER_PAGE: 7,
  },
  DASHBOARD: {
    REFRESH_INTERVAL: 10000, // 10 secondes
  },
  HISTORY: {
    DEFAULT_PERIOD: 'week',
  },
  AUTH: {
    MIN_PHONE_LENGTH: 8,
  }
};
