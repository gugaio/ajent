export default class Logger {
    constructor(options = {}) {
      this.options = {
        level: options.level || 'info',
        prefix: options.prefix || '',
        enableTimestamp: options.enableTimestamp ?? true,
        enableColors: options.enableColors ?? true,
        customFormat: options.customFormat,
      };
  
      this.levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      };
  
      // ANSI colors for Node.js
      this.colors = {
        error: '\x1b[31m', // red
        warn: '\x1b[33m',  // yellow
        info: '\x1b[36m',  // cyan
        debug: '\x1b[90m', // gray
        reset: '\x1b[0m',
      };
    }
  
    getTimestamp() {
      return new Date().toISOString();
    }
  
    formatMessage(level, message, ...args) {
      const timestamp = this.options.enableTimestamp ? `[${this.getTimestamp()}]` : '';
      const prefix = this.options.prefix ? `[${this.options.prefix}]` : '';
      
      if (this.options.customFormat) {
        return this.options.customFormat(timestamp, prefix, level, message, ...args);
      }
  
      return `${timestamp}${prefix}[${level.toUpperCase()}]: ${message}`;
    }
  
    shouldLog(level) {
      return this.levels[level] <= this.levels[this.options.level];
    }
  
    log(level, message, ...args) {
      if (!this.shouldLog(level)) return;
  
      const formattedMessage = this.formatMessage(level, message, ...args);
  
      // Browser environment
      if (typeof window !== 'undefined') {
        if (level === 'error') {
          console.error(formattedMessage, ...args);
        } else if (level === 'warn') {
          console.warn(formattedMessage, ...args);
        } else if (level === 'debug') {
          console.debug(formattedMessage, ...args);
        } else {
          console.log(formattedMessage, ...args);
        }
        return;
      }
  
      // Node.js environment with colors
      if (this.options.enableColors) {
        const color = this.colors[level] || '';
        console.log(`${color}${formattedMessage}${this.colors.reset}`, ...args);
        return;
      }
  
      // Node.js environment without colors
      console.log(formattedMessage, ...args);
    }
  
    error(message, ...args) {
      this.log('error', message, ...args);
    }
  
    warn(message, ...args) {
      this.log('warn', message, ...args);
    }
  
    info(message, ...args) {
      this.log('info', message, ...args);
    }
  
    debug(message, ...args) {
      this.log('debug', message, ...args);
    }
  }
  