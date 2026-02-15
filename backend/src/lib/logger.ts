type LogLevel = "info" | "warn" | "error" | "debug";

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    console.log(formatLog(entry));
  },

  warn(message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    console.warn(formatLog(entry));
  },

  error(message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    console.error(formatLog(entry));
  },

  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      const entry: LogEntry = {
        level: "debug",
        message,
        timestamp: new Date().toISOString(),
        data,
      };
      console.debug(formatLog(entry));
    }
  },

  /**
   * Log an API request (useful for monitoring)
   */
  apiRequest(method: string, path: string, statusCode: number, durationMs: number, userId?: string) {
    this.info("API request", {
      method,
      path,
      statusCode,
      durationMs,
      userId,
    });
  },
};
