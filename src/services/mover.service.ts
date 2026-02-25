import { injectable, inject } from "tsyringe";
import { MoverRepository } from "../repositories/mover.repository";
import { ItemRepository } from "../repositories/item.repository";
import { LogRepository } from "../repositories/log.repository";
import { IMagicMover } from "../models/magic-mover.model";
import { QuestState } from "../types/enums";

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
   * - All items exist
   * - Total weight does not exceed the mover's weight limit
   * @param moverId - The mover's ID
   * @param itemIds - Array of item IDs to load
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async loadItems(moverId: string, itemIds: string[]): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new Error("Magic Mover not found");
    }

    if (mover.questState === QuestState.ON_MISSION) {
      throw new Error("Cannot load items while on a mission");
    }

    const items = await this.itemRepository.findByIds(itemIds);
    if (items.length !== itemIds.length) {
      throw new Error("One or more Magic Items not found");
    }

    const currentWeight = await this.getCurrentWeight(mover);
    const newWeight = items.reduce((sum, item) => sum + item.weight, 0);

    if (currentWeight + newWeight > mover.weightLimit) {
      throw new Error(
        `Total weight (${currentWeight + newWeight}) exceeds weight limit (${mover.weightLimit})`
      );
    }

    const updatedMover = await this.moverRepository.loadItems(moverId, itemIds);
    await this.logRepository.create(moverId, QuestState.LOADING, itemIds);

    return updatedMover!;
  }

  /**
   * Starts a mission for a Magic Mover. Validates that:
   * - The mover exists
   * - The mover is in loading state (has items loaded)
   * @param moverId - The mover's ID
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async startMission(moverId: string): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new Error("Magic Mover not found");
    }

    if (mover.questState === QuestState.ON_MISSION) {
      throw new Error("Mover is already on a mission");
    }

    if (mover.questState === QuestState.RESTING && mover.items.length === 0) {
      throw new Error("Cannot start a mission without loading items first");
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
   * @param moverId - The mover's ID
   * @returns The updated mover
   * @throws Error if validation fails
   */
  async endMission(moverId: string): Promise<IMagicMover> {
    const mover = await this.moverRepository.findById(moverId);
    if (!mover) {
      throw new Error("Magic Mover not found");
    }

    if (mover.questState !== QuestState.ON_MISSION) {
      throw new Error("Mover is not currently on a mission");
    }

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

  /**
   * Calculates the current total weight of items loaded on a mover.
   * @param mover - The mover document (with populated items)
   * @returns The total weight
   */
  private async getCurrentWeight(mover: IMagicMover): Promise<number> {
    if (mover.items.length === 0) return 0;

    const itemIds = mover.items.map((item) => item.toString());
    const items = await this.itemRepository.findByIds(itemIds);
    return items.reduce((sum, item) => sum + item.weight, 0);
  }
}
