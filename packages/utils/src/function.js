/**
 * Function utility helpers for retry, timeout, and async operations
 * @module function
 */

/**
 * Retries an async function with specified interval, max attempts, and max duration
 * Fails silently after exhausting retries
 *
 * @param {Function} asyncFn - Async function to retry
 * @param {number} interval - Interval between retries in milliseconds
 * @param {number} maxTimes - Maximum number of retry attempts
 * @param {number} maxDuration - Maximum duration to keep retrying in milliseconds
 *
 * @example
 * retryOrFailSilently(
 *   () => fetch('/api/data'),
 *   1000,  // retry every 1 second
 *   5,     // max 5 attempts
 *   10000  // stop after 10 seconds
 * );
 */
export const retryOrFailSilently = (asyncFn, interval, maxTimes, maxDuration) => {
  const startTime = Date.now();
  let timesTried = 0;

  const functionToRetry = () => {
    timesTried++;
    asyncFn().catch(() => {
      if (Date.now() - startTime > maxDuration) return;
      if (timesTried > maxTimes - 1) return;

      setTimeout(() => {
        functionToRetry();
      }, interval);
    });
  };

  functionToRetry();
};

/**
 * Detects if a promise doesn't settle within specified timeout
 * Useful for detecting hanging promises or slow operations
 *
 * @param {Promise} promise - Promise to monitor
 * @param {number} timeoutMillis - Timeout in milliseconds
 * @returns {Promise} - Resolves with promise result or rejects with timeout error
 * @throws {Error} - Throws if promise doesn't settle within timeout
 *
 * @example
 * try {
 *   const result = await detectUnsettledPromise(
 *     fetch('/api/slow-endpoint'),
 *     5000
 *   );
 * } catch (error) {
 *   console.error('Promise timed out:', error);
 * }
 */
export const detectUnsettledPromise = async (promise, timeoutMillis) => {
  let isResolved = false;
  let isRejected = false;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (!isResolved && !isRejected) {
        reject(new Error('Promise did not settle within the specified timeout.'));
      }
    }, timeoutMillis);
  });

  return Promise.race([promise, timeoutPromise])
    .then((result) => {
      isResolved = true;
      return result;
    })
    .catch((error) => {
      isRejected = true;
      throw error;
    });
};

/**
 * Debounces a function - delays execution until after wait time has elapsed
 * since the last invocation
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * // Only the last call within 300ms will execute
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this executes after 300ms
 */
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttles a function - ensures it's called at most once per specified time period
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 *
 * @example
 * const throttledScroll = throttle((event) => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * // Function executes at most once every 100ms during scroll
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Creates a function that will only be called once
 * Subsequent calls return the result from the first call
 *
 * @param {Function} func - Function to wrap
 * @returns {Function} - Function that executes only once
 *
 * @example
 * const initialize = once(() => {
 *   console.log('Initializing...');
 *   return { initialized: true };
 * });
 *
 * initialize(); // Logs "Initializing..." and returns { initialized: true }
 * initialize(); // Returns cached { initialized: true }, no log
 */
export const once = (func) => {
  let called = false;
  let result;

  return function executedFunction(...args) {
    if (!called) {
      called = true;
      result = func(...args);
    }
    return result;
  };
};

/**
 * Creates a promise that resolves after specified delay
 * Useful for adding delays in async functions
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} - Promise that resolves after delay
 *
 * @example
 * async function fetchWithDelay() {
 *   await sleep(1000); // Wait 1 second
 *   return fetch('/api/data');
 * }
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Executes an array of functions in sequence, passing the result to the next
 *
 * @param {...Function} funcs - Functions to compose
 * @returns {Function} - Composed function
 *
 * @example
 * const add5 = x => x + 5;
 * const multiply3 = x => x * 3;
 * const composed = pipe(add5, multiply3);
 * console.log(composed(10)); // (10 + 5) * 3 = 45
 */
export const pipe = (...funcs) => {
  return (initialValue) => {
    return funcs.reduce((value, func) => func(value), initialValue);
  };
};

/**
 * Composes functions right-to-left (reverse of pipe)
 *
 * @param {...Function} funcs - Functions to compose
 * @returns {Function} - Composed function
 *
 * @example
 * const add5 = x => x + 5;
 * const multiply3 = x => x * 3;
 * const composed = compose(multiply3, add5);
 * console.log(composed(10)); // (10 + 5) * 3 = 45
 */
export const compose = (...funcs) => {
  return pipe(...funcs.reverse());
};
