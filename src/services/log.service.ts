/**
 * @module services/log
 * @description Business logic layer for Activity Log operations.
 */

import { injectable, inject } from "tsyringe";
import { LogRepository, LogQueryFilters } from "../repositories/log.repository";
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
   * Retrieves all activity logs with optional filtering and pagination.
   * @param filters - Query filters
   * @returns Array of logs
   */
  async getAllLogs(filters: LogQueryFilters = {}): Promise<IActivityLog[]> {
    return this.logRepository.findAll(filters);
  }

  /**
   * Retrieves activity logs for a specific mover with optional filtering and pagination.
   * @param moverId - The mover's ID
   * @param filters - Query filters
   * @returns Array of logs for the mover
   */
  async getLogsByMoverId(moverId: string, filters: LogQueryFilters = {}): Promise<IActivityLog[]> {
    return this.logRepository.findByMoverId(moverId, filters);
  }
}
