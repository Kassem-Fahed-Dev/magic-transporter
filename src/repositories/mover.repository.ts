/**
 * @module repositories/mover
 * @description Data access layer for Magic Mover CRUD and mission operations.
 */

import { injectable } from "tsyringe";
import { MagicMover, IMagicMover } from "../models/magic-mover.model";
import { QuestState } from "../types/enums";

/**
 * Query filters for finding movers.
 */
export interface MoverQueryFilters {
  questState?: QuestState;
  minMissions?: number;
  maxMissions?: number;
  minWeightLimit?: number;
  maxWeightLimit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Repository for Magic Mover data access operations.
 */
@injectable()
export class MoverRepository {
  /**
   * Creates a new Magic Mover.
   * @param name - Name of the mover
   * @param weightLimit - Maximum weight the mover can carry
   * @returns The created Magic Mover document
   */
  async create(name: string, weightLimit: number): Promise<IMagicMover> {
    return MagicMover.create({ name, weightLimit });
  }

  /**
   * Finds a Magic Mover by ID.
   * @param id - The mover's document ID
   * @returns The mover document or null
   */
  async findById(id: string): Promise<IMagicMover | null> {
    return MagicMover.findById(id).populate("items", "-assignedTo");
  }

  /**
   * Finds all Magic Movers with optional filtering, sorting, and pagination.
   * @param filters - Query filters
   * @returns Array of mover documents
   */
  async findAll(filters: MoverQueryFilters = {}): Promise<IMagicMover[]> {
    const query: any = {};

    // Apply filters
    if (filters.questState) {
      query.questState = filters.questState;
    }

    if (filters.minMissions !== undefined) {
      query.missionsCompleted = { ...query.missionsCompleted, $gte: filters.minMissions };
    }

    if (filters.maxMissions !== undefined) {
      query.missionsCompleted = { ...query.missionsCompleted, $lte: filters.maxMissions };
    }

    if (filters.minWeightLimit !== undefined) {
      query.weightLimit = { ...query.weightLimit, $gte: filters.minWeightLimit };
    }

    if (filters.maxWeightLimit !== undefined) {
      query.weightLimit = { ...query.weightLimit, $lte: filters.maxWeightLimit };
    }

    // Build sort object
    const sort: any = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Build query with pagination
    let queryBuilder = MagicMover.find(query).sort(sort);

    if (filters.offset !== undefined) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }

    if (filters.limit !== undefined) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    return queryBuilder.populate("items", "-assignedTo");
  }

  /**
   * Returns movers sorted by missions completed in descending order.
   * @param limit - Maximum number of results to return
   * @param minMissions - Minimum missions completed filter
   * @returns Sorted array of mover documents
   */
  async findTopMovers(limit?: number, minMissions?: number): Promise<IMagicMover[]> {
    const query: any = {};

    if (minMissions !== undefined) {
      query.missionsCompleted = { $gte: minMissions };
    }

    let queryBuilder = MagicMover.find(query).sort({ missionsCompleted: -1 });

    if (limit !== undefined) {
      queryBuilder = queryBuilder.limit(limit);
    }

    return queryBuilder.populate("items", "-assignedTo");
  }

  /**
   * Adds items to a mover and sets state to loading using atomic operations.
   * Uses $addToSet to prevent duplicate items.
   * @param id - The mover's document ID
   * @param itemIds - Array of item IDs to load
   * @param totalWeight - Total weight to add atomically
   * @param weightLimit - Weight limit to validate atomically
   * @returns The updated mover document or null if weight limit exceeded
   */
  async loadItems(
    id: string,
    itemIds: string[],
    totalWeight: number,
    weightLimit: number
  ): Promise<IMagicMover | null> {
    // Atomic update: only succeeds if current weight + new weight doesn't exceed limit
    return MagicMover.findOneAndUpdate(
      {
        _id: id,
        $expr: { $lte: [{ $add: ["$currentWeight", totalWeight] }, weightLimit] },
      },
      {
        $addToSet: { items: { $each: itemIds } },
        $inc: { currentWeight: totalWeight },
        $set: { questState: QuestState.LOADING },
      },
      { returnDocument: "after" }
    ).populate("items", "-assignedTo");
  }

  /**
   * Sets a mover's state to on-mission.
   * @param id - The mover's document ID
   * @returns The updated mover document
   */
  async startMission(id: string): Promise<IMagicMover | null> {
    return MagicMover.findByIdAndUpdate(
      id,
      { $set: { questState: QuestState.ON_MISSION } },
      { returnDocument: "after" }
    ).populate("items", "-assignedTo");
  }

  /**
   * Ends a mission: clears items, resets weight, increments missionsCompleted, resets state to resting.
   * @param id - The mover's document ID
   * @returns The updated mover document
   */
  async endMission(id: string): Promise<IMagicMover | null> {
    return MagicMover.findByIdAndUpdate(
      id,
      {
        $set: { items: [], questState: QuestState.RESTING, currentWeight: 0 },
        $inc: { missionsCompleted: 1 },
      },
      { returnDocument: "after" }
    );
  }
}
