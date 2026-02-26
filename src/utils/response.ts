/**
 * @module utils/response
 * @description Utility functions for standardized API responses.
 */

import { Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Sends a standardized success response.
 *
 * @param res - Express response object
 * @param data - Data to include in the response
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200 OK)
 *
 * @example
 * sendSuccess(res, mover); // { success: true, data: {...} }
 * sendSuccess(res, movers, "Movers retrieved successfully"); // { success: true, data: [...], message: "..." }
 * sendSuccess(res, mover, undefined, StatusCodes.CREATED); // 201 response
 */
export function sendSuccess(
  res: Response,
  data: any,
  message?: string,
  statusCode: number = StatusCodes.OK
): void {
  const response: { success: boolean; data: any; message?: string } = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
}

/**
 * Sends a standardized error response.
 * Note: This is typically handled by the global error handler middleware,
 * but can be used directly when needed.
 *
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500 Internal Server Error)
 * @param data - Optional additional error data
 *
 * @example
 * sendError(res, "Resource not found", StatusCodes.NOT_FOUND);
 * sendError(res, "Validation failed", StatusCodes.BAD_REQUEST, validationErrors);
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  data?: any
): void {
  const response: { success: boolean; message: string; data?: any } = {
    success: false,
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
}
