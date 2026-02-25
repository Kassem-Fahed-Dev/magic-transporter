/**
 * @module models/magic-item
 * @description Mongoose model for Magic Items that can be transported by Magic Movers.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Represents a Magic Item that can be transported by a Magic Mover.
 *
 * @interface IMagicItem
 * @extends {Document}
 * @property {string} name - The display name of the item
 * @property {number} weight - How much magic power (weight) the item requires to carry
 */
export interface IMagicItem extends Document {
  name: string;
  weight: number;
}

/** Mongoose schema definition for Magic Item. */
const MagicItemSchema = new Schema<IMagicItem>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, "Item weight is required"],
      min: [0.01, "Weight must be greater than 0"],
    },
  },
  { timestamps: true }
);

/** Mongoose model for the MagicItem collection. */
export const MagicItem = mongoose.model<IMagicItem>("MagicItem", MagicItemSchema);
