/**
 * @module controllers/mover
 * @description HTTP request handlers for Magic Mover endpoints.
 */

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { injectable, inject } from "tsyringe";
import { MoverService } from "../services/mover.service";
import { sendSuccess } from "../utils/response";

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
   * @returns {Promise<void>} 201 with the created mover
   */
  createMover = async (req: Request, res: Response): Promise<void> => {
    const { weightLimit } = req.body;
    const mover = await this.moverService.createMover(weightLimit);
    sendSuccess(res, mover, undefined, StatusCodes.CREATED);
  };

  /**
   * Retrieves all Magic Movers with their loaded items.
   * Supports filtering, sorting, and pagination via query parameters.
   *
   * @route GET /api/magic-movers
   * @param {Request} req - Express request with optional query parameters
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of movers
   */
  getAllMovers = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      questState: req.query.questState as any,
      minMissions: req.query.minMissions as any,
      maxMissions: req.query.maxMissions as any,
      minWeightLimit: req.query.minWeightLimit as any,
      maxWeightLimit: req.query.maxWeightLimit as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      limit: req.query.limit as any,
      offset: req.query.offset as any,
    };
    const movers = await this.moverService.getAllMovers(filters);
    sendSuccess(res, movers);
  };

  /**
   * Loads items onto a Magic Mover.
   * Validates weight limits and mover state before loading.
   *
   * @route POST /api/magic-movers/:id/load
   * @param {Request} req - Express request with mover ID in params and `{ itemIds }` in body
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400/404/409/422 on errors
   */
  loadItems = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { itemIds } = req.body;
    const mover = await this.moverService.loadItems(id, itemIds);
    sendSuccess(res, mover);
  };

  /**
   * Starts a mission for a Magic Mover.
   * Transitions state to on-mission and prevents further loading.
   *
   * @route PUT /api/magic-movers/:id/start-mission
   * @param {Request} req - Express request with mover ID in params
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400/404 on errors
   */
  startMission = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const mover = await this.moverService.startMission(id);
    sendSuccess(res, mover);
  };

  /**
   * Ends a mission for a Magic Mover.
   * Unloads all items, increments missions completed, resets to resting state.
   *
   * @route PUT /api/magic-movers/:id/end-mission
   * @param {Request} req - Express request with mover ID in params
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with updated mover, 400/404/500 on errors
   */
  endMission = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const mover = await this.moverService.endMission(id);
    sendSuccess(res, mover);
  };

  /**
   * Returns all movers sorted by missions completed in descending order.
   *
   * @route GET /api/magic-movers/top-movers
   * @param {Request} req - Express request with optional query parameters (limit, minMissions)
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with sorted array of movers
   */
  getTopMovers = async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit as any;
    const minMissions = req.query.minMissions as any;
    const movers = await this.moverService.getTopMovers(limit, minMissions);
    sendSuccess(res, movers);
  };
}
