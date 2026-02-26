/**
 * @module repositories/mover
 * @description Data access layer for Magic Mover CRUD and mission operations.
 */

import { injectable } from "tsyringe";
import { MagicMover, IMagicMover } from "../models/magic-mover.model";
import { QuestState } from "../types/enums";

/**
 * Repository for Magic Mover data access operations.
 */
@injectable()
export class MoverRepository {
  /**
   * Creates a new Magic Mover.
   * @param weightLimit - Maximum weight the mover can carry
   * @returns The created Magic Mover document
   */
  async create(weightLimit: number): Promise<IMagicMover> {
    return MagicMover.create({ weightLimit });
  }

  /**
   * Finds a Magic Mover by ID.
   * @param id - The mover's document ID
   * @returns The mover document or null
   */
  async findById(id: string): Promise<IMagicMover | null> {
    return MagicMover.findById(id).populate("items");
  }

  /**
   * Finds all Magic Movers.
   * @returns Array of all mover documents
   */
  async findAll(): Promise<IMagicMover[]> {
    return MagicMover.find().populate("items");
  }

  /**
   * Returns movers sorted by missions completed in descending order.
   * @returns Sorted array of mover documents
   */
  async findTopMovers(): Promise<IMagicMover[]> {
    return MagicMover.find().sort({ missionsCompleted: -1 }).populate("items");
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
    ).populate("items");
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
    ).populate("items");
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
