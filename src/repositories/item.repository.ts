/**
 * @module repositories/item
 * @description Data access layer for Magic Item CRUD operations.
 */

import { injectable } from "tsyringe";
import { MagicItem, IMagicItem } from "../models/magic-item.model";

/**
 * Query filters for finding items.
 */
export interface ItemQueryFilters {
  available?: boolean;
  minWeight?: number;
  maxWeight?: number;
  name?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Repository for Magic Item data access operations.
 */
@injectable()
export class ItemRepository {
  /**
   * Creates a new Magic Item.
   * @param name - Item name
   * @param weight - Item weight (magic power required)
   * @returns The created Magic Item document
   */
  async create(name: string, weight: number): Promise<IMagicItem> {
    return MagicItem.create({ name, weight });
  }

  /**
   * Finds a Magic Item by ID.
   * @param id - The item's document ID
   * @returns The item document or null
   */
  async findById(id: string): Promise<IMagicItem | null> {
    return MagicItem.findById(id);
  }

  /**
   * Finds multiple Magic Items by their IDs.
   * @param ids - Array of item document IDs
   * @returns Array of matching item documents
   */
  async findByIds(ids: string[]): Promise<IMagicItem[]> {
    return MagicItem.find({ _id: { $in: ids } });
  }

  /**
   * Finds all Magic Items with optional filtering, sorting, and pagination.
   * @param filters - Query filters
   * @returns Array of item documents
   */
  async findAll(filters: ItemQueryFilters = {}): Promise<IMagicItem[]> {
    const query: any = {};

    // Apply filters
    if (filters.available !== undefined) {
      query.assignedTo = filters.available ? null : { $ne: null };
    }

    if (filters.minWeight !== undefined) {
      query.weight = { ...query.weight, $gte: filters.minWeight };
    }

    if (filters.maxWeight !== undefined) {
      query.weight = { ...query.weight, $lte: filters.maxWeight };
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" }; // Case-insensitive search
    }

    // Build sort object
    const sort: any = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Build query with pagination
    let queryBuilder = MagicItem.find(query).sort(sort);

    if (filters.offset !== undefined) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }

    if (filters.limit !== undefined) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }

    return queryBuilder.select("-assignedTo"); // Exclude assignedTo from results
  }

  /**
   * Finds available (unassigned) Magic Items by their IDs.
   * @param ids - Array of item document IDs
   * @returns Array of available item documents
   */
  async findAvailableByIds(ids: string[]): Promise<IMagicItem[]> {
    return MagicItem.find({ _id: { $in: ids }, assignedTo: null });
  }

  /**
   * Assigns items to a mover atomically.
   * @param ids - Array of item document IDs
   * @param moverId - The mover's document ID
   * @returns Number of items successfully assigned
   */
  async assignToMover(ids: string[], moverId: string): Promise<number> {
    const result = await MagicItem.updateMany(
      { _id: { $in: ids }, assignedTo: null },
      { $set: { assignedTo: moverId } }
    );
    return result.modifiedCount;
  }

  /**
   * Unassigns items from a mover.
   * @param moverId - The mover's document ID
   * @returns Number of items successfully unassigned
   */
  async unassignFromMover(moverId: string): Promise<number> {
    const result = await MagicItem.updateMany(
      { assignedTo: moverId },
      { $set: { assignedTo: null } }
    );
    return result.modifiedCount;
  }

  /**
   * Unassigns specific items (by ID).
   * @param itemIds - Array of item IDs to unassign
   * @returns Number of items successfully unassigned
   */
  async unassignItems(itemIds: string[]): Promise<number> {
    const result = await MagicItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { assignedTo: null } }
    );
    return result.modifiedCount;
  }
}
