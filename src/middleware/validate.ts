/**
 * @module middleware/validate
 * @description Validation middleware using express-validator.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "../errors";

/**
 * Middleware that checks for express-validator validation errors.
 * If validation fails, throws a ValidationError which will be caught by the global error handler.
 * Otherwise, passes control to the next middleware.
 *
 * @param {Request} req - Express request object containing validation results
 * @param {Response} res - Express response object (unused)
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @throws {ValidationError} When validation fails
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError("Validation failed", errors.array());
  }
  next();
}
