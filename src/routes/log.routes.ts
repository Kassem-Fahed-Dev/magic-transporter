/**
 * @module routes/log
 * @description Express routes for Activity Log retrieval operations.
 */

import { Router } from "express";
import { container } from "../config/container";
import { LogController } from "../controllers/log.controller";
import { validate } from "../middleware/validate";
import { getLogsByMoverIdValidators, queryLogsValidators } from "../validators";

const router = Router();
const controller = container.resolve(LogController);

/**
 * @swagger
 * /api/activity-logs:
 *   get:
 *     summary: Get all activity logs
 *     description: Returns all activity logs from all movers. Supports filtering, sorting, and pagination.
 *     tags: [Activity Logs]
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [resting, loading, on-mission]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created after this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created before this date (ISO 8601 format)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order by creation date (default is desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", [...queryLogsValidators, validate], controller.getAllLogs);

/**
 * @swagger
 * /api/activity-logs/mover/{moverId}:
 *   get:
 *     summary: Get activity logs for a specific mover
 *     description: Returns all activity logs for a given Magic Mover. Supports filtering, sorting, and pagination.
 *     tags: [Activity Logs]
 *     parameters:
 *       - in: path
 *         name: moverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic Mover ID (MongoDB ObjectId)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [resting, loading, on-mission]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created after this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created before this date (ISO 8601 format)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order by creation date (default is desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of activity logs for the mover
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Invalid mover ID format or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/mover/:moverId",
  [...getLogsByMoverIdValidators, ...queryLogsValidators, validate],
  controller.getLogsByMoverId
);

export default router;
