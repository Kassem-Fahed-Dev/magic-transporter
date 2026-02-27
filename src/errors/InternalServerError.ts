/**
 * @module errors/InternalServerError
 * @description Error thrown for unexpected system failures.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating an unexpected system failure or programming error.
 * This is a NON-OPERATIONAL error - details should be logged but not exposed to client.
 * Results in 500 Internal Server Error HTTP response.
 *
 * @example
 * throw new InternalServerError("One or more items no longer exist. Cannot complete mission.");
 * throw new InternalServerError("Database connection failed");
 */
export class InternalServerError extends AppError {
  readonly statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  readonly isOperational = false;

  constructor(message: string, code?: string) {
    super(message, code);
  }
}
