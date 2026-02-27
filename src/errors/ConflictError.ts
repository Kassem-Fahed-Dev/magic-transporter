/**
 * @module errors/ConflictError
 * @description Error thrown for race conditions or resource conflicts.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating a conflict with the current state of a resource.
 * Typically used for race conditions or concurrent modification issues.
 * Results in 409 Conflict HTTP response.
 *
 * @example
 * throw new ConflictError("One or more items are already assigned to another mover");
 * throw new ConflictError("Failed to assign items (they may have been taken by another mover)");
 */
export class ConflictError extends AppError {
  readonly statusCode = StatusCodes.CONFLICT;
  readonly isOperational = true;

  constructor(message: string, code?: string) {
    super(message, code);
  }
}
