/**
 * Logging Middleware — Lightweight structured logger for the campus notification system.
 * Provides log levels, timestamps, and context tagging without external dependencies.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function formatTimestamp() {
  return new Date().toISOString();
}

function createLogger(context = "App", minLevel = "debug") {
  const minPriority = LOG_LEVELS[minLevel] ?? 0;

  function log(level, message, data = {}) {
    if ((LOG_LEVELS[level] ?? 0) < minPriority) return;

    const entry = {
      timestamp: formatTimestamp(),
      level: level.toUpperCase(),
      context,
      message,
      ...data,
    };

    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.context}]`;

    switch (level) {
      case "error":
        console.error(`${prefix} ${message}`, Object.keys(data).length ? data : "");
        break;
      case "warn":
        console.warn(`${prefix} ${message}`, Object.keys(data).length ? data : "");
        break;
      case "debug":
        console.debug(`${prefix} ${message}`, Object.keys(data).length ? data : "");
        break;
      default:
        console.info(`${prefix} ${message}`, Object.keys(data).length ? data : "");
    }

    return entry;
  }

  return {
    debug: (msg, data) => log("debug", msg, data),
    info: (msg, data) => log("info", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
    child: (childContext) => createLogger(`${context}:${childContext}`, minLevel),
  };
}

export { createLogger, LOG_LEVELS };
export default createLogger;
