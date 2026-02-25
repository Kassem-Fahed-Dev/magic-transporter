import { injectable } from "tsyringe";
import { ActivityLog, IActivityLog } from "../models/activity-log.model";
import { QuestState } from "../types/enums";

/**
 * Repository for Activity Log data access operations.
 */
@injectable()
export class LogRepository {
  /**
   * Creates a new activity log entry.
   * @param moverId - The mover's document ID
   * @param action - The quest state action being logged
   * @param items - Array of item IDs involved in the action
   * @returns The created activity log document
   */
  async create(
    moverId: string,
    action: QuestState,
    items: string[] = []
  ): Promise<IActivityLog> {
    return ActivityLog.create({ moverId, action, items });
  }

  /**
   * Finds all activity logs for a given mover.
   * @param moverId - The mover's document ID
   * @returns Array of activity log documents
   */
  async findByMoverId(moverId: string): Promise<IActivityLog[]> {
    return ActivityLog.find({ moverId })
      .sort({ createdAt: -1 })
      .populate("items");
  }
}
