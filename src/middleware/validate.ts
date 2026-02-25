/**
 * @module middleware/validate
 * @description Validation middleware using express-validator.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware that checks for express-validator validation errors.
 * If validation fails, responds with 400 and an array of error details.
 * Otherwise, passes control to the next middleware.
 *
 * @param {Request} req - Express request object containing validation results
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }
  next();
}
