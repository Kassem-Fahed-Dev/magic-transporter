/**
 * @module models/activity-log
 * @description Mongoose model for activity logs tracking Magic Mover state changes.
 * Every load, start-mission, and end-mission action is recorded here.
 */

import mongoose, { Schema, Document, Types } from "mongoose";
import { QuestState } from "../types/enums";

/**
 * Represents an activity log entry tracking a Magic Mover's state changes.
 *
 * @interface IActivityLog
 * @extends {Document}
 * @property {Types.ObjectId} moverId - Reference to the Magic Mover
 * @property {QuestState} action - The quest state transition that was logged
 * @property {Types.ObjectId[]} items - References to items involved in this action
 * @property {Date} createdAt - Timestamp of when the action occurred
 */
export interface IActivityLog extends Document {
  moverId: Types.ObjectId;
  action: QuestState;
  items: Types.ObjectId[];
  createdAt: Date;
}

/** Mongoose schema definition for Activity Log. */
const ActivityLogSchema = new Schema<IActivityLog>(
  {
    moverId: {
      type: Schema.Types.ObjectId,
      ref: "MagicMover",
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(QuestState),
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "MagicItem",
      },
    ],
  },
  { timestamps: true }
);

/** Mongoose model for the ActivityLog collection. */
export const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
