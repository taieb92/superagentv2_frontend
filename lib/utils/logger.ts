/**
 * Logger utility for consistent logging across the application.
 * Only logs in development mode to avoid performance issues in production.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  /**
   * Logs informational messages (only in development)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Logs informational messages (alias for log, used by new components)
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Logs error messages (always logged, even in production)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /**
   * Logs warning messages (only in development)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Logs debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
