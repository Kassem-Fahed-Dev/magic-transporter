/**
 * @module config/swagger
 * @description Swagger/OpenAPI 3.0 specification configuration.
 * Defines reusable component schemas and references route-level JSDoc annotations.
 */

import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./index";
import path from "path";

/** Swagger configuration options with component schemas for all models. */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Magic Transporters API",
      version: "1.0.0",
      description:
        "REST API for managing Magic Movers and their missions. " +
        "Magic Movers carry Magic Items on quests, powered by virtual magic.\n\n" +
        "## Quest State Machine\n" +
        "- **resting** → loading → on-mission → resting\n" +
        "- A mover must have items loaded before starting a mission.\n" +
        "- A mover on a mission cannot load additional items.",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
    ],
    tags: [
      { name: "Magic Movers", description: "Endpoints for managing Magic Movers and their missions" },
      { name: "Magic Items", description: "Endpoints for managing Magic Items" },
      { name: "Activity Logs", description: "Endpoints for retrieving activity logs" },
    ],
    components: {
      schemas: {
        MagicItem: {
          type: "object",
          properties: {
            _id: { type: "string", description: "MongoDB document ID", example: "60d5ec49f1b2c8b1a8e1e1e1" },
            name: { type: "string", description: "Display name of the item", example: "Enchanted Sword" },
            weight: { type: "number", description: "Weight (magic power) required to carry", minimum: 0.01, example: 15 },
            assignedTo: { type: "string", nullable: true, description: "ID of the mover currently carrying this item (null if available)" },
            createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
            updatedAt: { type: "string", format: "date-time", description: "Last update timestamp" },
          },
        },
        MagicMover: {
          type: "object",
          properties: {
            _id: { type: "string", description: "MongoDB document ID", example: "60d5ec49f1b2c8b1a8e1e1e2" },
            weightLimit: { type: "number", description: "Maximum weight the mover can carry", minimum: 1, example: 100 },
            currentWeight: { type: "number", description: "Current total weight of loaded items", minimum: 0, example: 35 },
            questState: {
              type: "string",
              enum: ["resting", "loading", "on-mission"],
              description: "Current lifecycle state",
              example: "resting",
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/MagicItem" },
              description: "Currently loaded Magic Items",
            },
            missionsCompleted: { type: "integer", description: "Total missions completed", minimum: 0, example: 0 },
            createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
            updatedAt: { type: "string", format: "date-time", description: "Last update timestamp" },
          },
        },
        ActivityLog: {
          type: "object",
          properties: {
            _id: { type: "string", description: "MongoDB document ID" },
            moverId: { type: "string", description: "Reference to the Magic Mover" },
            action: {
              type: "string",
              enum: ["resting", "loading", "on-mission"],
              description: "The state transition that was logged",
            },
            items: {
              type: "array",
              items: { type: "string" },
              description: "Item IDs involved in this action",
            },
            createdAt: { type: "string", format: "date-time", description: "When the action occurred" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object", description: "Response payload" },
            message: { type: "string", description: "Optional success message" },
          },
          required: ["success", "data"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", description: "Error message", example: "Magic Mover not found" },
          },
          required: ["success", "message"],
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              description: "Validation error message (formatted from validation errors)",
              example: "Weight limit must be at least 1; Name is required",
            },
          },
          required: ["success", "message"],
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../routes/*.ts"),    // For development (ts-node-dev)
    path.join(__dirname, "../routes/*.js"),    // For production (compiled)
  ],
};

/** Generated OpenAPI specification object. */
export const swaggerSpec = swaggerJsdoc(options);
