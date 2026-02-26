/**
 * @module middleware/error-handler
 * @description Global Express error handling middleware with operational/non-operational error distinction.
 */

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors";
import { ValidationError } from "../errors";

/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and returns a consistent JSON error response.
 *
 * Handles two types of errors:
 * - Operational errors (AppError with isOperational=true): Expected business logic errors, safe to expose
 * - Non-operational errors (unexpected errors): Programming/system errors, log details but return generic message
 *
 * @param {Error} err - The error that was thrown
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused, required by Express signature)
 * @returns {void}
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Ensure response is always JSON
  res.setHeader("Content-Type", "application/json");

  // Check if this is one of our custom AppError instances
  if (err instanceof AppError) {
    // Handle operational errors
    if (err.isOperational) {
      // Safe to expose error message to client
      console.log(`Operational error [${err.statusCode}]:`, err.message);

      // Special handling for ValidationError with errors array
      if (err instanceof ValidationError && err.errors && err.errors.length > 0) {
        // Format validation errors into readable message
        const validationMessages = err.errors.map((e) => e.msg).join("; ");
        res.status(err.statusCode).json({
          success: false,
          message: validationMessages || err.message,
          errors: err.errors,
        });
        return;
      }

      // Standard operational error response
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
      return;
    } else {
      // Non-operational error (programming error or system failure)
      // Log full details for debugging
      console.error("Non-operational error:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      // Return generic message to client (don't expose internal details)
      res.status(err.statusCode).json({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });
      return;
    }
  }

  // Unknown error (not an AppError)
  // Treat as non-operational and log full details
  console.error("Unhandled error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Return generic 500 error
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}
