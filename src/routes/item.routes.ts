/**
 * @module routes/item
 * @description Express routes for Magic Item CRUD operations.
 */

import { Router } from "express";
import { container } from "../config/container";
import { ItemController } from "../controllers/item.controller";
import { validate } from "../middleware/validate";
import { createItemValidators, queryItemsValidators } from "../validators";

const router = Router();
const controller = container.resolve(ItemController);

/**
 * @swagger
 * /api/magic-items:
 *   post:
 *     summary: Add a new Magic Item
 *     description: Creates a Magic Item with a name and weight. Weight represents the magic power needed to carry it.
 *     tags: [Magic Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, weight]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Display name of the item
 *                 example: "Enchanted Sword"
 *               weight:
 *                 type: number
 *                 description: Weight (magic power) required to carry
 *                 minimum: 0.01
 *                 example: 15
 *     responses:
 *       201:
 *         description: Magic Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MagicItem'
 *       400:
 *         description: Validation error (missing name or invalid weight)
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
router.post("/", [...createItemValidators, validate], controller.createItem);

/**
 * @swagger
 * /api/magic-items:
 *   get:
 *     summary: Get all Magic Items
 *     description: Returns a list of all Magic Items in the system. Supports filtering, sorting, and pagination.
 *     tags: [Magic Items]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability (true = unassigned, false = assigned to a mover)
 *       - in: query
 *         name: minWeight
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum weight filter
 *       - in: query
 *         name: maxWeight
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum weight filter
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name (case-insensitive partial match)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, weight, createdAt]
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
 *         description: List of Magic Items
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
 *                     $ref: '#/components/schemas/MagicItem'
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
router.get("/", [...queryItemsValidators, validate], controller.getAllItems);

export default router;
