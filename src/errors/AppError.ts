/**
 * @module errors/AppError
 * @description Base abstract class for all application errors.
 */

/**
 * Abstract base class for all custom application errors.
 * Provides a foundation for type-safe error handling with HTTP status codes
 * and operational vs non-operational error distinction.
 */
export abstract class AppError extends Error {
  /**
   * HTTP status code associated with this error.
   */
  abstract readonly statusCode: number;

  /**
   * Indicates whether this is an operational error (expected business logic error)
   * or a non-operational error (unexpected programming/system error).
   *
   * Operational errors (true): Safe to expose message to client
   * Non-operational errors (false): Should log details but return generic message to client
   */
  abstract readonly isOperational: boolean;

  /**
   * Optional error code for client-side error handling.
   * Defaults to the class name (e.g., "NotFoundError", "ValidationError").
   */
  public readonly code: string;

  constructor(message: string, code?: string) {
    super(message);

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);

    // Set the name to the class name for better error identification
    this.name = this.constructor.name;

    // Set error code (use provided code or default to class name)
    this.code = code || this.constructor.name;
  }
}
