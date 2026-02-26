/**
 * @module routes/mover
 * @description Express routes for Magic Mover CRUD and mission lifecycle operations.
 */

import { Router } from "express";
import { container } from "../config/container";
import { MoverController } from "../controllers/mover.controller";
import { validate } from "../middleware/validate";
import {
  createMoverValidators,
  loadItemsValidators,
  startMissionValidators,
  endMissionValidators,
  queryMoversValidators,
  queryTopMoversValidators,
} from "../validators";

const router = Router();
const controller = container.resolve(MoverController);

/**
 * @swagger
 * /api/magic-movers:
 *   post:
 *     summary: Add a new Magic Mover
 *     description: Creates a Magic Mover with a weight limit. The mover starts in "resting" state with zero missions completed.
 *     tags: [Magic Movers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weightLimit]
 *             properties:
 *               weightLimit:
 *                 type: number
 *                 description: Maximum total weight the mover can carry
 *                 minimum: 1
 *                 example: 100
 *     responses:
 *       201:
 *         description: Magic Mover created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MagicMover'
 *       400:
 *         description: Validation error (invalid weight limit)
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
router.post("/", [...createMoverValidators, validate], controller.createMover);

/**
 * @swagger
 * /api/magic-movers:
 *   get:
 *     summary: Get all Magic Movers
 *     description: Returns all Magic Movers with their currently loaded items populated. Supports filtering, sorting, and pagination.
 *     tags: [Magic Movers]
 *     parameters:
 *       - in: query
 *         name: questState
 *         schema:
 *           type: string
 *           enum: [resting, loading, on-mission]
 *         description: Filter by quest state
 *       - in: query
 *         name: minMissions
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum missions completed
 *       - in: query
 *         name: maxMissions
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum missions completed
 *       - in: query
 *         name: minWeightLimit
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum weight limit
 *       - in: query
 *         name: maxWeightLimit
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum weight limit
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [missionsCompleted, weightLimit, currentWeight, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
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
 *         description: List of Magic Movers
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
 *                     $ref: '#/components/schemas/MagicMover'
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
router.get("/", [...queryMoversValidators, validate], controller.getAllMovers);

/**
 * @swagger
 * /api/magic-movers/top-movers:
 *   get:
 *     summary: List movers by most missions completed (descending)
 *     description: Returns Magic Movers sorted by the number of completed missions in descending order. Use this as a leaderboard endpoint.
 *     tags: [Magic Movers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *       - in: query
 *         name: minMissions
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Minimum missions completed filter
 *     responses:
 *       200:
 *         description: Sorted list of Magic Movers (most missions first)
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
 *                     $ref: '#/components/schemas/MagicMover'
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
router.get("/top-movers", [...queryTopMoversValidators, validate], controller.getTopMovers);

/**
 * @swagger
 * /api/magic-movers/{id}/load:
 *   post:
 *     summary: Load items onto a Magic Mover
 *     description: |
 *       Loads one or more Magic Items onto a mover. Transitions state to "loading".
 *       Validates that:
 *       - The mover exists and is not on a mission
 *       - All item IDs reference existing items
 *       - The total weight (existing + new) does not exceed the mover's weight limit
 *
 *       Creates a DB activity log entry for this loading action.
 *     tags: [Magic Movers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic Mover ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemIds]
 *             properties:
 *               itemIds:
 *                 type: array
 *                 description: Array of Magic Item IDs to load
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   description: Magic Item MongoDB ObjectId
 *                 example: ["60d5ec49f1b2c8b1a8e1e1e1"]
 *     responses:
 *       200:
 *         description: Items loaded successfully — mover is now in "loading" state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MagicMover'
 *       400:
 *         description: Validation error, weight limit exceeded, or mover is on a mission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Magic Mover or one or more Magic Items not found
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
router.post("/:id/load", [...loadItemsValidators, validate], controller.loadItems);

/**
 * @swagger
 * /api/magic-movers/{id}/start-mission:
 *   put:
 *     summary: Start a mission for a Magic Mover
 *     description: |
 *       Transitions the mover's state to "on-mission". The mover must have items loaded
 *       (be in "loading" state) and must not already be on a mission.
 *       While on a mission, no additional items can be loaded.
 *
 *       Creates a DB activity log entry for this state transition.
 *     tags: [Magic Movers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic Mover ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Mission started — mover is now "on-mission"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MagicMover'
 *       400:
 *         description: Mover is already on a mission or has no items loaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Magic Mover not found
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
router.put(
  "/:id/start-mission",
  [...startMissionValidators, validate],
  controller.startMission
);

/**
 * @swagger
 * /api/magic-movers/{id}/end-mission:
 *   put:
 *     summary: End a mission for a Magic Mover
 *     description: |
 *       Ends the mover's current mission. Unloads all items, increments the
 *       missionsCompleted counter, and resets state to "resting".
 *       The mover must currently be on a mission.
 *
 *       Creates a DB activity log entry for this state transition.
 *     tags: [Magic Movers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic Mover ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Mission ended — mover is back to "resting" with items unloaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MagicMover'
 *       400:
 *         description: Mover is not currently on a mission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Magic Mover not found
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
router.put(
  "/:id/end-mission",
  [...endMissionValidators, validate],
  controller.endMission
);

export default router;
