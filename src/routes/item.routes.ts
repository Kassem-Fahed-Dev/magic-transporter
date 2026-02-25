/**
 * @module routes/item
 * @description Express routes for Magic Item CRUD operations.
 */

import { Router } from "express";
import { body } from "express-validator";
import { container } from "../config/container";
import { ItemController } from "../controllers/item.controller";
import { validate } from "../middleware/validate";

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
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("weight")
      .isFloat({ min: 0.01 })
      .withMessage("Weight must be a positive number"),
    validate,
  ],
  controller.createItem
);

/**
 * @swagger
 * /api/magic-items:
 *   get:
 *     summary: Get all Magic Items
 *     description: Returns a list of all Magic Items in the system.
 *     tags: [Magic Items]
 *     responses:
 *       200:
 *         description: List of all Magic Items
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", controller.getAllItems);

export default router;
