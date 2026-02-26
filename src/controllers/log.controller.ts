/**
 * @module controllers/log
 * @description HTTP request handlers for Activity Log endpoints.
 */

import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { LogService } from "../services/log.service";
import { sendSuccess } from "../utils/response";

/**
 * Controller for Activity Log endpoints.
 * Handles HTTP request/response and delegates business logic to {@link LogService}.
 */
@injectable()
export class LogController {
  constructor(@inject(LogService) private logService: LogService) {}

  /**
   * Retrieves all activity logs.
   * Supports filtering, sorting, and pagination via query parameters.
   *
   * @route GET /api/activity-logs
   * @param {Request} req - Express request with optional query parameters
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of logs
   */
  getAllLogs = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      action: req.query.action as any,
      startDate: req.query.startDate as any,
      endDate: req.query.endDate as any,
      sortOrder: req.query.sortOrder as any,
      limit: req.query.limit as any,
      offset: req.query.offset as any,
    };
    const logs = await this.logService.getAllLogs(filters);
    sendSuccess(res, logs);
  };

  /**
   * Retrieves activity logs for a specific mover.
   * Supports filtering, sorting, and pagination via query parameters.
   *
   * @route GET /api/activity-logs/mover/:moverId
   * @param {Request} req - Express request with mover ID in params and optional query parameters
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of logs
   */
  getLogsByMoverId = async (req: Request, res: Response): Promise<void> => {
    const moverId = req.params.moverId as string;
    const filters = {
      action: req.query.action as any,
      startDate: req.query.startDate as any,
      endDate: req.query.endDate as any,
      sortOrder: req.query.sortOrder as any,
      limit: req.query.limit as any,
      offset: req.query.offset as any,
    };
    const logs = await this.logService.getLogsByMoverId(moverId, filters);
    sendSuccess(res, logs);
  };
}
