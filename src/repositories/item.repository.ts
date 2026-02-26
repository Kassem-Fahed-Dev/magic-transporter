/**
 * @module repositories/item
 * @description Data access layer for Magic Item CRUD operations.
 */

import { injectable } from "tsyringe";
import { MagicItem, IMagicItem } from "../models/magic-item.model";

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
   * Finds all Magic Items.
   * @returns Array of all item documents
   */
  async findAll(): Promise<IMagicItem[]> {
    return MagicItem.find();
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
