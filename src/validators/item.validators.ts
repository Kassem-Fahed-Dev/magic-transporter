/**
 * @module validators/item
 * @description Validation rules for Magic Item endpoints (similar to NestJS DTOs).
 */

import { body, param, query, ValidationChain } from "express-validator";

/**
 * DTO: Create Magic Item Request
 * Validates the request body for creating a new Magic Item.
 *
 * @example
 * {
 *   "name": "Enchanted Sword",
 *   "weight": 15
 * }
 */
export const createItemValidators: ValidationChain[] = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("weight")
    .exists()
    .withMessage("Weight is required")
    .isFloat({ min: 0.01 })
    .withMessage("Weight must be a positive number greater than or equal to 0.01")
    .toFloat(),
];

/**
 * DTO: Get Item by ID Request (generic param validator)
 * Validates the item ID parameter for any GET/PUT/DELETE operation.
 */
export const itemIdParamValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid item ID format"),
];

/**
 * DTO: Query Items Request
 * Validates query parameters for filtering and sorting items.
 *
 * @example
 * GET /api/magic-items?available=true&minWeight=10&maxWeight=50&sortBy=weight&limit=20
 */
export const queryItemsValidators: ValidationChain[] = [
  query("available")
    .optional()
    .isBoolean()
    .withMessage("available must be a boolean (true/false)")
    .toBoolean(),

  query("minWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minWeight must be a non-negative number")
    .toFloat(),

  query("maxWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxWeight must be a non-negative number")
    .toFloat(),

  query("name")
    .optional()
    .isString()
    .withMessage("name must be a string")
    .trim(),

  query("sortBy")
    .optional()
    .isIn(["name", "weight", "createdAt"])
    .withMessage("sortBy must be one of: name, weight, createdAt"),

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
