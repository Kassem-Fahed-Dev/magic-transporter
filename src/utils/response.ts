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
 * @param errors - Optional validation errors array (for ValidationError)
 * @param code - Optional error code for client-side error handling
 *
 * @example
 * sendError(res, "Resource not found", StatusCodes.NOT_FOUND);
 * sendError(res, "Validation failed", StatusCodes.BAD_REQUEST, validationErrors, "VALIDATION_ERROR");
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  errors?: any[],
  code?: string
): void {
  const response: { success: boolean; message: string; code?: string; errors?: any[] } = {
    success: false,
    message,
  };

  if (code) {
    response.code = code;
  }

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}
