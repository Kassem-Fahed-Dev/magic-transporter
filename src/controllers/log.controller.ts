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
   *
   * @route GET /api/activity-logs
   * @param {Request} _req - Express request (unused)
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of logs
   */
  getAllLogs = async (_req: Request, res: Response): Promise<void> => {
    const logs = await this.logService.getAllLogs();
    sendSuccess(res, logs);
  };

  /**
   * Retrieves activity logs for a specific mover.
   *
   * @route GET /api/activity-logs/mover/:moverId
   * @param {Request} req - Express request with mover ID in params
   * @param {Response} res - Express response
   * @returns {Promise<void>} 200 with array of logs
   */
  getLogsByMoverId = async (req: Request, res: Response): Promise<void> => {
    const moverId = req.params.moverId as string;
    const logs = await this.logService.getLogsByMoverId(moverId);
    sendSuccess(res, logs);
  };
}
