/**
 * @module controllers/item
 * @description HTTP request handlers for Magic Item endpoints.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { injectable, inject } from "tsyringe";
import { ItemService } from "../services/item.service";
import { sendSuccess } from "../utils/response";

/**
 * Controller for Magic Item endpoints.
 * Handles HTTP request/response and delegates business logic to {@link ItemService}.
 */
@injectable()
export class ItemController {
  constructor(@inject(ItemService) private itemService: ItemService) {}

  /**
   * Creates a new Magic Item.
   *
   * @route POST /api/magic-items
   * @param {Request} req - Express request with `{ name, weight }` in body
   * @param {Response} res - Express response
   * @returns {Promise<void>} 201 with the created item
   */
  createItem = async (req: Request, res: Response): Promise<void> => {
    const { name, weight } = req.body;
    const item = await this.itemService.createItem(name, weight);
    sendSuccess(res, item, undefined, StatusCodes.CREATED);
  };

  /**
   * Retrieves all Magic Items.
   * Supports filtering, sorting, and pagination via query parameters.
   *
   * @route GET /api/magic-items
   * @param {Request} req - Express request with optional query parameters
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of items
   */
  getAllItems = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      available: req.query.available as any,
      minWeight: req.query.minWeight as any,
      maxWeight: req.query.maxWeight as any,
      name: req.query.name as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      limit: req.query.limit as any,
      offset: req.query.offset as any,
    };
    const items = await this.itemService.getAllItems(filters);
    sendSuccess(res, items);
  };
}
