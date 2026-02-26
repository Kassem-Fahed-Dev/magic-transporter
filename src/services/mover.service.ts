/**
 * @module services/mover
 * @description Business logic layer for Magic Mover operations and mission lifecycle management.
 */

import { injectable, inject } from "tsyringe";
import { MoverRepository } from "../repositories/mover.repository";
import { ItemRepository } from "../repositories/item.repository";
import { LogRepository } from "../repositories/log.repository";
import { IMagicMover } from "../models/magic-mover.model";
import { QuestState } from "../types/enums";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
} from "../errors";

/**
 * Service layer for Magic Mover business logic.
 */
@injectable()
export class MoverService {
  constructor(
    @inject(MoverRepository) private moverRepository: MoverRepository,
    @inject(ItemRepository) private itemRepository: ItemRepository,
    @inject(LogRepository) private logRepository: LogRepository
  ) {}

  /**
   * Creates a new Magic Mover.
   * @param weightLimit - Maximum weight the mover can carry
   * @returns The created mover
   */
  async createMover(weightLimit: number): Promise<IMagicMover> {
    return this.moverRepository.create(weightLimit);
  }

  /**
   * Retrieves all Magic Movers.
   * @returns Array of all movers
   */
  async getAllMovers(): Promise<IMagicMover[]> {
    return this.moverRepository.findAll();
  }

  /**
   * Loads items onto a Magic Mover. Validates that:
   * - The mover exists
   * - The mover is not on a mission
   * - All items exist and are available (not assigned to another mover)
   * - No duplicate items in the request
   * - Total weight does not exceed the mover's weight limit (atomically)
   * @param moverId - The mover's ID
   * @param itemIds - Array of item IDs to load
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async loadItems(moverId: string, itemIds: string[]): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new NotFoundError("Magic Mover not found");
    }

    if (mover.questState === QuestState.ON_MISSION) {
      throw new BadRequestError("Cannot load items while on a mission");
    }

    // Check for duplicate item IDs in the request
    const uniqueItemIds = [...new Set(itemIds)];
    if (uniqueItemIds.length !== itemIds.length) {
      throw new UnprocessableEntityError("Cannot load duplicate items in the same request");
    }

    // Check if items exist and are available
    const availableItems = await this.itemRepository.findAvailableByIds(itemIds);
    if (availableItems.length !== itemIds.length) {
      const allItems = await this.itemRepository.findByIds(itemIds);
      if (allItems.length !== itemIds.length) {
        throw new NotFoundError("One or more Magic Items not found");
      }
      throw new ConflictError("One or more items are already assigned to another mover");
    }

    const newWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);

    // Atomically assign items to this mover (ensures no other mover can take them)
    const assignedCount = await this.itemRepository.assignToMover(itemIds, moverId);
    if (assignedCount !== itemIds.length) {
      // Rollback: this shouldn't happen due to the availability check, but handle race condition
      await this.itemRepository.unassignItems(itemIds);
      throw new ConflictError("Failed to assign items (they may have been taken by another mover)");
    }

    // Atomically load items with weight validation
    const updatedMover = await this.moverRepository.loadItems(
      moverId,
      itemIds,
      newWeight,
      mover.weightLimit
    );

    if (!updatedMover) {
      // Rollback item assignments if weight limit was exceeded
      await this.itemRepository.unassignItems(itemIds);
      throw new BadRequestError(
        `Total weight (${mover.currentWeight + newWeight}) exceeds weight limit (${mover.weightLimit})`
      );
    }

    await this.logRepository.create(moverId, QuestState.LOADING, itemIds);

    return updatedMover;
  }

  /**
   * Starts a mission for a Magic Mover. Validates that:
   * - The mover exists
   * - The mover is in LOADING state (enforces strict state machine)
   * - The mover has items loaded
   * @param moverId - The mover's ID
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async startMission(moverId: string): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new NotFoundError("Magic Mover not found");
    }

    if (mover.questState === QuestState.ON_MISSION) {
      throw new BadRequestError("Mover is already on a mission");
    }

    // Enforce strict state machine: must be in LOADING state to start mission
    if (mover.questState !== QuestState.LOADING) {
      throw new BadRequestError("Cannot start a mission from resting state. Load items first.");
    }

    if (mover.items.length === 0) {
      throw new BadRequestError("Cannot start a mission without items");
    }

    const updatedMover = await this.moverRepository.startMission(moverId);
    const itemIds = mover.items.map((item) =>
      typeof item === "object" && item._id ? item._id.toString() : item.toString()
    );
    await this.logRepository.create(moverId, QuestState.ON_MISSION, itemIds);

    return updatedMover!;
  }

  /**
   * Ends a mission for a Magic Mover. Validates that:
   * - The mover exists
   * - The mover is currently on a mission
   * - All loaded items still exist
   * Unassigns items so they can be loaded onto other movers.
   * @param moverId - The mover's ID
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async endMission(moverId: string): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new NotFoundError("Magic Mover not found");
    }

    if (mover.questState !== QuestState.ON_MISSION) {
      throw new BadRequestError("Mover is not currently on a mission");
    }

    // Validate that all items still exist
    if (mover.items.length > 0) {
      const itemIds = mover.items.map((item) =>
        typeof item === "object" && item._id ? item._id.toString() : item.toString()
      );
      const items = await this.itemRepository.findByIds(itemIds);
      if (items.length !== itemIds.length) {
        throw new InternalServerError("One or more items no longer exist. Cannot complete mission.");
      }
    }

    // Unassign items from this mover (make them available again)
    await this.itemRepository.unassignFromMover(moverId);

    const updatedMover = await this.moverRepository.endMission(moverId);
    await this.logRepository.create(moverId, QuestState.RESTING);

    return updatedMover!;
  }

  /**
   * Returns movers sorted by missions completed (descending).
   * @returns Sorted array of movers
   */
  async getTopMovers(): Promise<IMagicMover[]> {
    return this.moverRepository.findTopMovers();
  }
}
