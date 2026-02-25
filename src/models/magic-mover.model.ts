/**
 * @module models/magic-mover
 * @description Mongoose model for Magic Movers who carry items on missions.
 */

import mongoose, { Schema, Document, Types } from "mongoose";
import { QuestState } from "../types/enums";

/**
 * Represents a Magic Mover who carries items on missions.
 *
 * @interface IMagicMover
 * @extends {Document}
 * @property {number} weightLimit - The maximum total weight the mover can carry
 * @property {QuestState} questState - Current lifecycle state (resting, loading, on-mission)
 * @property {Types.ObjectId[]} items - References to currently loaded Magic Items
 * @property {number} missionsCompleted - Running count of successfully completed missions
 */
export interface IMagicMover extends Document {
  weightLimit: number;
  questState: QuestState;
  items: Types.ObjectId[];
  missionsCompleted: number;
}

/** Mongoose schema definition for Magic Mover. */
const MagicMoverSchema = new Schema<IMagicMover>(
  {
    weightLimit: {
      type: Number,
      required: [true, "Weight limit is required"],
      min: [1, "Weight limit must be at least 1"],
    },
    questState: {
      type: String,
      enum: Object.values(QuestState),
      default: QuestState.RESTING,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "MagicItem",
      },
    ],
    missionsCompleted: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/** Mongoose model for the MagicMover collection. */
export const MagicMover = mongoose.model<IMagicMover>("MagicMover", MagicMoverSchema);
