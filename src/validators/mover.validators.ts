/**
 * @module validators/mover
 * @description Validation rules for Magic Mover endpoints (similar to NestJS DTOs).
 */

import { body, param, query, ValidationChain } from "express-validator";

/**
 * DTO: Create Magic Mover Request
 * Validates the request body for creating a new Magic Mover.
 *
 * @example
 * {
 *   "name": "John the Brave",
 *   "weightLimit": 100
 * }
 */
export const createMoverValidators: ValidationChain[] = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("weightLimit")
    .exists()
    .withMessage("Weight limit is required")
    .isFloat({ min: 1 })
    .withMessage("Weight limit must be a number greater than or equal to 1")
    .toFloat(),
];

/**
 * DTO: Load Items Request
 * Validates the request for loading items onto a Magic Mover.
 *
 * @example
 * {
 *   "itemIds": ["60d5ec49f1b2c8b1a8e1e1e1", "60d5ec49f1b2c8b1a8e1e1e2"]
 * }
 */
export const loadItemsValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid mover ID format"),

  body("itemIds")
    .exists()
    .withMessage("Item IDs are required")
    .isArray({ min: 1 })
    .withMessage("itemIds must be a non-empty array"),

  body("itemIds.*")
    .isMongoId()
    .withMessage("Each item ID must be a valid MongoDB ObjectId"),
];

/**
 * DTO: Start Mission Request
 * Validates the mover ID parameter for starting a mission.
 */
export const startMissionValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid mover ID format"),
];

/**
 * DTO: End Mission Request
 * Validates the mover ID parameter for ending a mission.
 */
export const endMissionValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid mover ID format"),
];

/**
 * DTO: Get Mover by ID Request (generic param validator)
 * Validates the mover ID parameter for any GET/PUT/DELETE operation.
 */
export const moverIdParamValidators: ValidationChain[] = [
  param("id")
    .isMongoId()
    .withMessage("Invalid mover ID format"),
];

/**
 * DTO: Query Movers Request
 * Validates query parameters for filtering and sorting movers.
 *
 * @example
 * GET /api/magic-movers?questState=resting&minMissions=5&sortBy=missionsCompleted&sortOrder=desc&limit=10
 */
export const queryMoversValidators: ValidationChain[] = [
  query("questState")
    .optional()
    .isIn(["resting", "loading", "on-mission"])
    .withMessage("Quest state must be one of: resting, loading, on-mission"),

  query("minMissions")
    .optional()
    .isInt({ min: 0 })
    .withMessage("minMissions must be a non-negative integer")
    .toInt(),

  query("maxMissions")
    .optional()
    .isInt({ min: 0 })
    .withMessage("maxMissions must be a non-negative integer")
    .toInt(),

  query("minWeightLimit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minWeightLimit must be a non-negative number")
    .toFloat(),

  query("maxWeightLimit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxWeightLimit must be a non-negative number")
    .toFloat(),

  query("sortBy")
    .optional()
    .isIn(["missionsCompleted", "weightLimit", "currentWeight", "createdAt"])
    .withMessage("sortBy must be one of: missionsCompleted, weightLimit, currentWeight, createdAt"),

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

/**
 * DTO: Query Top Movers Request
 * Validates query parameters for the top movers endpoint.
 */
export const queryTopMoversValidators: ValidationChain[] = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),

  query("minMissions")
    .optional()
    .isInt({ min: 1 })
    .withMessage("minMissions must be a positive integer")
    .toInt(),
];
