/**
 * @module repositories/log
 * @description Data access layer for Activity Log operations.
 * Tracks all Magic Mover state transitions and mission activities.
 */

import { injectable } from "tsyringe";
import { ActivityLog, IActivityLog } from "../models/activity-log.model";
import { QuestState } from "../types/enums";

/**
 * Query filters for finding activity logs.
 */
export interface LogQueryFilters {
  action?: QuestState;
  startDate?: Date;
  endDate?: Date;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

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
   * Finds all activity logs for a given mover with optional filtering and pagination.
   * @param moverId - The mover's document ID
   * @param filters - Query filters
   * @returns Array of activity log documents
   */
  async findByMoverId(moverId: string, filters: LogQueryFilters = {}): Promise<IActivityLog[]> {
    const query: any = { moverId };

    // Apply filters
    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    // Build query with sorting and pagination
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    let queryBuilder = ActivityLog.find(query).sort({ createdAt: sortOrder });

    if (filters.offset !== undefined) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }

    if (filters.limit !== undefined) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    return queryBuilder.populate("items", "-assignedTo");
  }

  /**
   * Finds all activity logs with optional filtering and pagination.
   * @param filters - Query filters
   * @returns Array of all activity log documents
   */
  async findAll(filters: LogQueryFilters = {}): Promise<IActivityLog[]> {
    const query: any = {};

    // Apply filters
    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    // Build query with sorting and pagination
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    let queryBuilder = ActivityLog.find(query).sort({ createdAt: sortOrder });

    if (filters.offset !== undefined) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }

    if (filters.limit !== undefined) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    return queryBuilder.populate("moverId", "-items").populate("items", "-assignedTo");
  }
}
