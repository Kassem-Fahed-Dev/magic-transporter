/**
 * @module middleware/error-handler
 * @description Global Express error handling middleware.
 */

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Global error handling middleware.
 * Catches all unhandled errors thrown in route handlers
 * and returns a consistent JSON error response.
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
  console.error("Unhandled error:", err.message);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
