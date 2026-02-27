/**
 * @module errors/NotFoundError
 * @description Error thrown when a requested resource is not found.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating that a requested resource does not exist.
 * Results in 404 Not Found HTTP response.
 *
 * @example
 * throw new NotFoundError("Magic Mover not found");
 * throw new NotFoundError("One or more Magic Items not found");
 */
export class NotFoundError extends AppError {
  readonly statusCode = StatusCodes.NOT_FOUND;
  readonly isOperational = true;

  constructor(message: string, code?: string) {
    super(message, code);
  }
}
