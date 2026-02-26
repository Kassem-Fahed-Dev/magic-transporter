/**
 * @module app
 * @description Express application setup.
 * Configures middleware, routes, API documentation, and error handling.
 */

import "reflect-metadata";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/error-handler";
import moverRoutes from "./routes/mover.routes";
import itemRoutes from "./routes/item.routes";
import logRoutes from "./routes/log.routes";

/** Express application instance. */
const app = express();

/** Parse incoming JSON request bodies. */
app.use(express.json());

/** Swagger UI for live API documentation. */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/** Magic Mover routes — CRUD and mission lifecycle. */
app.use("/api/magic-movers", moverRoutes);

/** Magic Item routes — CRUD. */
app.use("/api/magic-items", itemRoutes);

/** Activity Log routes — Retrieval of activity logs. */
app.use("/api/activity-logs", logRoutes);

/** Health check endpoint for monitoring and Docker health checks. */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/** 404 handler for undefined routes — must be before error handler. */
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: "Route not found",
  });
});

/** Global error handler — must be registered last. */
app.use(errorHandler);

export default app;
