/**
 * @module validators/log
 * @description Validation rules for Activity Log endpoints (similar to NestJS DTOs).
 */

import { param, query, ValidationChain } from "express-validator";

/**
 * DTO: Get Logs by Mover ID Request
 * Validates the mover ID parameter for retrieving activity logs.
 */
export const getLogsByMoverIdValidators: ValidationChain[] = [
  param("moverId")
    .isMongoId()
    .withMessage("Invalid mover ID format"),
];

/**
 * DTO: Get Log by ID Request (generic param validator)
 * Validates the log ID parameter for any GET/PUT/DELETE operation.
 */
export const logIdParamValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid log ID format"),
];

/**
 * DTO: Query Activity Logs Request
 * Validates query parameters for filtering and sorting activity logs.
 *
 * @example
 * GET /api/activity-logs?action=on-mission&startDate=2026-01-01&limit=20
 */
export const queryLogsValidators: ValidationChain[] = [
  query("action")
    .optional()
    .isIn(["resting", "loading", "on-mission"])
    .withMessage("action must be one of: resting, loading, on-mission"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO 8601 date")
    .toDate(),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO 8601 date")
    .toDate(),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be either 'asc' or 'desc'"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be a non-negative integer")
    .toInt(),
];
