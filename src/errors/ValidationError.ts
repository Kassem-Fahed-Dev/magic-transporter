/**
 * @module errors/ValidationError
 * @description Error thrown when input validation fails.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating input validation failure.
 * Results in 400 Bad Request HTTP response.
 * Can include detailed validation errors from express-validator.
 *
 * @example
 * throw new ValidationError("Validation failed", validationErrors);
 * throw new ValidationError("Name is required");
 */
export class ValidationError extends AppError {
  readonly statusCode = StatusCodes.BAD_REQUEST;
  readonly isOperational = true;

  /**
   * Optional array of validation error details from express-validator
   */
  public readonly errors?: any[];

  constructor(message: string, errors?: any[]) {
    super(message);
    this.errors = errors;
  }
}
