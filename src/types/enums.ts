/**
 * @module types/enums
 * @description Shared enumerations used across the application.
 */

/**
 * Possible states for a Magic Mover during their quest lifecycle.
 *
 * State transitions:
 * - {@link QuestState.RESTING} → {@link QuestState.LOADING} (when items are loaded)
 * - {@link QuestState.LOADING} → {@link QuestState.LOADING} (when more items are loaded)
 * - {@link QuestState.LOADING} → {@link QuestState.ON_MISSION} (when mission starts)
 * - {@link QuestState.ON_MISSION} → {@link QuestState.RESTING} (when mission ends, items unloaded)
 *
 * @enum {string}
 */
export enum QuestState {
  /** Mover is idle and available to load items. */
  RESTING = "resting",
  /** Mover is being loaded with items; can accept more or start a mission. */
  LOADING = "loading",
  /** Mover is on a delivery mission; cannot accept more items. */
  ON_MISSION = "on-mission",
}
