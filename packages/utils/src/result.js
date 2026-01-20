/**
 * Functional error handling with Result pattern
 * Provides Ok/Err types for handling success and error cases without exceptions
 * @module result
 */

/**
 * Abstract Result class representing either success (Ok) or error (Err)
 * @template T - Success type
 * @template E - Error type (extends Error)
 */
export class Result {
  constructor(result) {
    this.result = result;
  }

  /**
   * Checks if the result is Ok (success)
   * @returns {boolean}
   */
  isOk() {
    return this.result.success;
  }

  /**
   * Checks if the result is Err (error)
   * @returns {boolean}
   */
  isError() {
    return !this.result.success;
  }

  /**
   * Maps a Result<T> to Result<U> by applying a function to the Ok value
   * @template U
   * @param {Function} fn - Function to apply to the Ok value
   * @returns {Result}
   */
  map(fn) {
    if (this.isOk()) {
      return new Ok(fn(this.result.result));
    }
    return this;
  }

  /**
   * Maps a Result<T> to U by applying a function or returning a default value
   * @template U
   * @param {*} def - Default value if Err
   * @param {Function} fn - Function to apply to the Ok value
   * @returns {*}
   */
  mapOr(def, fn) {
    if (this.isOk()) {
      return fn(this.result.result);
    }
    return def;
  }

  /**
   * Maps a Result<T> to U by applying a function or executing a fallback function
   * @template U
   * @param {Function} def - Fallback function if Err
   * @param {Function} fn - Function to apply to the Ok value
   * @returns {*}
   */
  mapOrElse(def, fn) {
    if (this.isOk()) {
      return fn(this.result.result);
    }
    return def(this.result.error);
  }

  /**
   * Maps the error value if this is an Err
   * @template F
   * @param {Function} fn - Function to apply to the error
   * @returns {Result}
   */
  mapError(fn) {
    if (!this.result.success) {
      return new Err(fn(this.result.error));
    }
    return this;
  }

  /**
   * Calls the provided function with a reference to the Ok value (for debugging)
   * @param {Function} fn - Function to call with the Ok value
   * @returns {Result} - Returns this for chaining
   */
  inspect(fn) {
    if (this.isOk()) {
      fn(this.result.result);
    }
    return this;
  }

  /**
   * Returns the Ok value, throws if Err
   * @throws {Error}
   * @returns {*}
   */
  unwrap() {
    if (this.result.success) {
      return this.result.result;
    }
    throw this.result.error;
  }

  /**
   * Returns the Ok value, throws with custom message if Err
   * @param {string} message - Custom error message
   * @throws {Error}
   * @returns {*}
   */
  expect(message) {
    if (this.result.success) {
      return this.result.result;
    }
    throw new Error(message);
  }

  /**
   * Returns the Err value, throws with custom message if Ok
   * @param {string} message - Custom error message
   * @throws {Error}
   * @returns {Error}
   */
  expectError(message) {
    if (this.result.success) {
      throw new Error(message);
    }
    return this.result.error;
  }

  /**
   * Returns the Err value, throws if Ok
   * @throws {*}
   * @returns {Error}
   */
  unwrapError() {
    if (this.result.success) {
      throw this.result.result;
    }
    return this.result.error;
  }

  /**
   * Returns res if both this and res are Ok, otherwise returns the Err
   * @template U
   * @param {Result} res - Result to combine with
   * @returns {Result}
   */
  and(res) {
    if (this.isOk() && res.isOk()) {
      return res;
    }
    if (this.isError()) {
      return this;
    }
    return res;
  }

  /**
   * Calls fn with the Ok value if this is Ok, otherwise returns this
   * @template U
   * @param {Function} fn - Function that returns a Result
   * @returns {Result}
   */
  andThen(fn) {
    if (this.isOk()) {
      return fn(this.result.result);
    }
    return this;
  }

  /**
   * Async version of andThen
   * @template U
   * @param {Function} fn - Async function that returns a Promise<Result>
   * @returns {Promise<Result>}
   */
  async andThenAsync(fn) {
    if (this.isOk()) {
      return fn(this.result.result);
    }
    return this;
  }

  /**
   * Returns this if Ok, otherwise returns res
   * @param {Result} res - Alternative result
   * @returns {Result}
   */
  or(res) {
    if (this.isOk()) {
      return this;
    }
    return res;
  }

  /**
   * Calls fn with the error if this is Err, otherwise returns this
   * @template U
   * @param {Function} fn - Function to call with the error
   * @returns {Result}
   */
  orElse(fn) {
    if (!this.result.success) {
      return fn(this.result.error);
    }
    return this;
  }

  /**
   * Returns the Ok value or the default value
   * @param {*} def - Default value
   * @returns {*}
   */
  unwrapOr(def) {
    if (!this.result.success) {
      return def;
    }
    return this.result.result;
  }

  /**
   * Returns the Ok value or the result of calling fn with the error
   * @param {Function} fn - Function to call with the error
   * @returns {*}
   */
  unwrapOrElse(fn) {
    if (this.result.success) {
      return this.result.result;
    }
    return fn(this.result.error);
  }
}

/**
 * Ok variant representing a successful result
 * @template T
 * @extends Result
 */
export class Ok extends Result {
  constructor(value) {
    super({
      success: true,
      result: value,
    });
  }
}

/**
 * Err variant representing an error result
 * @template T
 * @extends Result
 */
export class Err extends Result {
  constructor(error) {
    super({
      success: false,
      error,
    });
  }
}

/**
 * Executes a function and wraps the result in a Result type
 * Handles both synchronous and asynchronous functions
 * @template R
 * @template E
 * @param {Function} fn - Function to execute
 * @returns {Result|Promise<Result>}
 *
 * @example
 * // Synchronous
 * const result = Try(() => JSON.parse('{"valid": true}'));
 * if (result.isOk()) {
 *   console.log(result.unwrap());
 * }
 *
 * @example
 * // Asynchronous
 * const result = await Try(async () => await fetch('/api/data'));
 * result.map(response => response.json());
 */
export function Try(fn) {
  try {
    const possibleResultPromise = fn();
    const isPromiseLike = typeof possibleResultPromise?.then === 'function';

    if (isPromiseLike) {
      return possibleResultPromise
        .then((result) => new Ok(result))
        .catch((e) => {
          const err = e instanceof Error
            ? e
            : new Error(typeof e === 'string' ? e : 'Could not execute given function');
          return new Err(err);
        });
    }

    return new Ok(possibleResultPromise);
  } catch (e) {
    const err = e instanceof Error
      ? e
      : new Error(typeof e === 'string' ? e : 'Could not execute given function');
    return new Err(err);
  }
}
