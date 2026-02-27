/**
 * @module errors/BadRequestError
 * @description Error thrown for invalid operations or business rule violations.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating a business rule violation or invalid operation.
 * Results in 400 Bad Request HTTP response.
 *
 * @example
 * throw new BadRequestError("Cannot load items while on a mission");
 * throw new BadRequestError("Total weight exceeds weight limit");
 * throw new BadRequestError("Mover is already on a mission");
 */
export class BadRequestError extends AppError {
  readonly statusCode = StatusCodes.BAD_REQUEST;
  readonly isOperational = true;

  constructor(message: string, code?: string) {
    super(message, code);
  }
}
