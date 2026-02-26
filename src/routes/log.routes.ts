/**
 * @module routes/log
 * @description Express routes for Activity Log retrieval operations.
 */

import { Router } from "express";
import { param } from "express-validator";
import { container } from "../config/container";
import { LogController } from "../controllers/log.controller";
import { validate } from "../middleware/validate";

const router = Router();
const controller = container.resolve(LogController);

/**
 * @swagger
 * /api/activity-logs:
 *   get:
 *     summary: Get all activity logs
 *     description: Returns all activity logs from all movers, sorted by creation date (newest first).
 *     tags: [Activity Logs]
 *     responses:
 *       200:
 *         description: List of all activity logs
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", controller.getAllLogs);

/**
 * @swagger
 * /api/activity-logs/mover/{moverId}:
 *   get:
 *     summary: Get activity logs for a specific mover
 *     description: Returns all activity logs for a given Magic Mover, sorted by creation date (newest first).
 *     tags: [Activity Logs]
 *     parameters:
 *       - in: path
 *         name: moverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic Mover ID (MongoDB ObjectId)
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
 *         description: Invalid mover ID format
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
  [param("moverId").isMongoId().withMessage("Invalid mover ID"), validate],
  controller.getLogsByMoverId
);

export default router;
