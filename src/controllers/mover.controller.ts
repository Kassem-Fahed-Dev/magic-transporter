/**
 * @module controllers/mover
 * @description HTTP request handlers for Magic Mover endpoints.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { injectable, inject } from "tsyringe";
import { MoverService } from "../services/mover.service";

/**
 * Controller for Magic Mover endpoints.
 * Handles HTTP request/response and delegates business logic to {@link MoverService}.
 */
@injectable()
export class MoverController {
  constructor(@inject(MoverService) private moverService: MoverService) {}

  /**
   * Creates a new Magic Mover.
   *
   * @route POST /api/magic-movers
   * @param {Request} req - Express request with `{ weightLimit }` in body
   * @param {Response} res - Express response
   * @returns {Promise<void>} 201 with the created mover, or 500 on error
   */
  createMover = async (req: Request, res: Response): Promise<void> => {
    try {
      const { weightLimit } = req.body;
      const mover = await this.moverService.createMover(weightLimit);
      res.status(StatusCodes.CREATED).json({ success: true, data: mover });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  };

  /**
   * Retrieves all Magic Movers with their loaded items.
   *
   * @route GET /api/magic-movers
   * @param {Request} _req - Express request (unused)
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of movers, or 500 on error
   */
  getAllMovers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const movers = await this.moverService.getAllMovers();
      res.status(StatusCodes.OK).json({ success: true, data: movers });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  };

  /**
   * Loads items onto a Magic Mover.
   * Validates weight limits and mover state before loading.
   *
   * @route POST /api/magic-movers/:id/load
   * @param {Request} req - Express request with mover ID in params and `{ itemIds }` in body
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400 on validation error, or 404 if not found
   */
  loadItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { itemIds } = req.body;
      const mover = await this.moverService.loadItems(id, itemIds);
      res.status(StatusCodes.OK).json({ success: true, data: mover });
    } catch (error: any) {
      const status =
        error.message.includes("not found")
          ? StatusCodes.NOT_FOUND
          : error.message.includes("Cannot") || error.message.includes("exceeds")
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, message: error.message });
    }
  };

  /**
   * Starts a mission for a Magic Mover.
   * Transitions state to on-mission and prevents further loading.
   *
   * @route PUT /api/magic-movers/:id/start-mission
   * @param {Request} req - Express request with mover ID in params
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400 on invalid state, or 404 if not found
   */
  startMission = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const mover = await this.moverService.startMission(id);
      res.status(StatusCodes.OK).json({ success: true, data: mover });
    } catch (error: any) {
      const status =
        error.message.includes("not found")
          ? StatusCodes.NOT_FOUND
          : error.message.includes("already") || error.message.includes("Cannot")
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, message: error.message });
    }
  };

  /**
   * Ends a mission for a Magic Mover.
   * Unloads all items, increments missions completed, resets to resting state.
   *
   * @route PUT /api/magic-movers/:id/end-mission
   * @param {Request} req - Express request with mover ID in params
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400 if not on mission, or 404 if not found
   */
  endMission = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const mover = await this.moverService.endMission(id);
      res.status(StatusCodes.OK).json({ success: true, data: mover });
    } catch (error: any) {
      const status =
        error.message.includes("not found")
          ? StatusCodes.NOT_FOUND
          : error.message.includes("not currently")
            ? StatusCodes.BAD_REQUEST
            : StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, message: error.message });
    }
  };

  /**
   * Returns all movers sorted by missions completed in descending order.
   *
   * @route GET /api/magic-movers/top-movers
   * @param {Request} _req - Express request (unused)
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with sorted array of movers, or 500 on error
   */
  getTopMovers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const movers = await this.moverService.getTopMovers();
      res.status(StatusCodes.OK).json({ success: true, data: movers });
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  };
}
