const getColor = (type: string): string => {
  switch (type) {
    case 'success':
      return 'color: #4CAF50; font-weight: bold';
    case 'info':
      return 'color: #2196F3; font-weight: bold';
    case 'warning':
      return 'color: #FFC107; font-weight: bold';
    case 'error':
      return 'color: #F44336; font-weight: bold';
    default:
      return 'color: #666666';
  }
};

export const appConsole = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '%c[LOG] %c%s',
        getColor('info'),
        'color: inherit',
        message,
        data || ''
      );
    }
  },

  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        '%c[INFO] %c%s',
        getColor('info'),
        'color: inherit',
        message,
        data || ''
      );
    }
  },

  success: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '%c[SUCCESS] %c%s',
        getColor('success'),
        'color: inherit',
        message,
        data || ''
      );
    }
  },

  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '%c[WARNING] %c%s',
        getColor('warning'),
        'color: inherit',
        message,
        data || ''
      );
    }
  },

  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '%c[ERROR] %c%s',
        getColor('error'),
        'color: inherit',
        message,
        error || ''
      );
    }
  },

  table: (data: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('%c[TABLE]', getColor('info'));
      console.table(data);
    }
  },

  group: (label: string, fn: () => void) => {
    if (process.env.NODE_ENV !== 'production') {
      console.group(`%c${label}`, getColor('info'));
      fn();
      console.groupEnd();
    }
  }
};
