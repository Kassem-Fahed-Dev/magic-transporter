/**
 * @module services/log
 * @description Business logic layer for Activity Log operations.
 */

import { injectable, inject } from "tsyringe";
import { LogRepository } from "../repositories/log.repository";
import { IActivityLog } from "../models/activity-log.model";

/**
 * Service layer for Activity Log business logic.
 */
@injectable()
export class LogService {
  constructor(
    @inject(LogRepository) private logRepository: LogRepository
  ) {}

  /**
   * Retrieves all activity logs.
   * @returns Array of all logs
   */
  async getAllLogs(): Promise<IActivityLog[]> {
    return this.logRepository.findAll();
  }

  /**
   * Retrieves activity logs for a specific mover.
   * @param moverId - The mover's ID
   * @returns Array of logs for the mover
   */
  async getLogsByMoverId(moverId: string): Promise<IActivityLog[]> {
    return this.logRepository.findByMoverId(moverId);
  }
}
