/**
 * @module errors/UnprocessableEntityError
 * @description Error thrown when request is syntactically valid but semantically incorrect.
 */

import { StatusCodes } from "http-status-codes";
import { AppError } from "./AppError";

/**
 * Error indicating that the request is well-formed but contains semantic errors.
 * Results in 422 Unprocessable Entity HTTP response.
 *
 * @example
 * throw new UnprocessableEntityError("Cannot load duplicate items in the same request");
 */
export class UnprocessableEntityError extends AppError {
  readonly statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
  }
}
