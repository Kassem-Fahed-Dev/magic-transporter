/**
 * @module controllers/item
 * @description HTTP request handlers for Magic Item endpoints.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { injectable, inject } from "tsyringe";
import { ItemService } from "../services/item.service";

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
   * @returns {Promise<void>} 201 with the created item, or 500 on error
   */
  createItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, weight } = req.body;
      const item = await this.itemService.createItem(name, weight);
      res.status(StatusCodes.CREATED).json({ success: true, data: item });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  };

  /**
   * Retrieves all Magic Items.
   *
   * @route GET /api/magic-items
   * @param {Request} _req - Express request (unused)
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of items, or 500 on error
   */
  getAllItems = async (_req: Request, res: Response): Promise<void> => {
    try {
      const items = await this.itemService.getAllItems();
      res.status(StatusCodes.OK).json({ success: true, data: items });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  };
}
