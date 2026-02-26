/**
 * @module services/item
 * @description Business logic layer for Magic Item operations.
 */

import { injectable, inject } from "tsyringe";
import { ItemRepository } from "../repositories/item.repository";
import { IMagicItem } from "../models/magic-item.model";

/**
 * Service layer for Magic Item business logic.
 */
@injectable()
export class ItemService {
  constructor(
    @inject(ItemRepository) private itemRepository: ItemRepository
  ) {}

  /**
   * Creates a new Magic Item.
   * @param name - Item name
   * @param weight - Item weight
   * @returns The created item
   */
  async createItem(name: string, weight: number): Promise<IMagicItem> {
    return this.itemRepository.create(name, weight);
  }

  /**
   * Retrieves all Magic Items.
   * @returns Array of all items
   */
  async getAllItems(): Promise<IMagicItem[]> {
    return this.itemRepository.findAll();
  }
}
