/**
 * @module tests/e2e-full-workflow
 * @description Comprehensive end-to-end integration test for the complete Magic Transporters workflow.
 *
 * This test validates:
 * - Creating Magic Movers and Magic Items
 * - Loading items onto movers (with weight validation)
 * - Starting and ending missions
 * - Database activity logging
 * - Leaderboard functionality (top movers by missions completed)
 * - Complete mission lifecycle (resting → loading → on-mission → resting)
 * - State transition rules and validations
 */

import "reflect-metadata";
import request from "supertest";
import app from "../src/app";
import { ActivityLog } from "../src/models/activity-log.model";

describe("Magic Transporters - Full E2E Workflow", () => {
  /**
   * Complete end-to-end scenario testing the entire Magic Transporters system.
   * Simulates multiple movers completing missions and validates all business rules.
   */
  describe("Complete Mission Lifecycle with Multiple Movers", () => {
    it("should handle a complete multi-mover scenario with activity logging", async () => {
      // ===== SETUP: Create Magic Items =====
      const swordRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Enchanted Sword", weight: 15 });
      expect(swordRes.status).toBe(201);
      const sword = swordRes.body.data;

      const shieldRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Magic Shield", weight: 20 });
      expect(shieldRes.status).toBe(201);
      const shield = shieldRes.body.data;

      const potionRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Health Potion", weight: 5 });
      expect(potionRes.status).toBe(201);
      const potion = potionRes.body.data;

      const ringRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Golden Ring", weight: 2 });
      expect(ringRes.status).toBe(201);
      const ring = ringRes.body.data;

      // Verify all items were created
      const itemsRes = await request(app).get("/api/magic-items");
      expect(itemsRes.status).toBe(200);
      expect(itemsRes.body.data).toHaveLength(4);

      // ===== MOVER 1: Complete 2 missions =====
      const mover1Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      expect(mover1Res.status).toBe(201);
      const mover1 = mover1Res.body.data;
      expect(mover1.questState).toBe("resting");
      expect(mover1.missionsCompleted).toBe(0);

      // Mission 1 for Mover1
      const load1Res = await request(app)
        .post(`/api/magic-movers/${mover1._id}/load`)
        .send({ itemIds: [sword._id, shield._id] });
      expect(load1Res.status).toBe(200);
      expect(load1Res.body.data.questState).toBe("loading");
      expect(load1Res.body.data.items).toHaveLength(2);

      // Verify activity log for loading
      let logs = await ActivityLog.find({ moverId: mover1._id }).sort({ createdAt: -1 });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("loading");
      expect(logs[0].items).toHaveLength(2);

      const start1Res = await request(app)
        .put(`/api/magic-movers/${mover1._id}/start-mission`);
      expect(start1Res.status).toBe(200);
      expect(start1Res.body.data.questState).toBe("on-mission");

      // Verify activity log for starting mission
      logs = await ActivityLog.find({ moverId: mover1._id }).sort({ createdAt: -1 });
      expect(logs).toHaveLength(2);
      expect(logs[0].action).toBe("on-mission");

      const end1Res = await request(app)
        .put(`/api/magic-movers/${mover1._id}/end-mission`);
      expect(end1Res.status).toBe(200);
      expect(end1Res.body.data.questState).toBe("resting");
      expect(end1Res.body.data.items).toHaveLength(0);
      expect(end1Res.body.data.missionsCompleted).toBe(1);

      // Verify activity log for ending mission
      logs = await ActivityLog.find({ moverId: mover1._id }).sort({ createdAt: -1 });
      expect(logs).toHaveLength(3);
      expect(logs[0].action).toBe("resting");

      // Mission 2 for Mover1
      const load2Res = await request(app)
        .post(`/api/magic-movers/${mover1._id}/load`)
        .send({ itemIds: [potion._id, ring._id] });
      expect(load2Res.status).toBe(200);
      expect(load2Res.body.data.questState).toBe("loading");

      await request(app).put(`/api/magic-movers/${mover1._id}/start-mission`);
      const end2Res = await request(app)
        .put(`/api/magic-movers/${mover1._id}/end-mission`);
      expect(end2Res.body.data.missionsCompleted).toBe(2);

      // Verify total activity logs for Mover1 (load, start, end × 2 missions = 6)
      logs = await ActivityLog.find({ moverId: mover1._id });
      expect(logs).toHaveLength(6);

      // ===== MOVER 2: Complete 1 mission =====
      const mover2Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 50 });
      expect(mover2Res.status).toBe(201);
      const mover2 = mover2Res.body.data;

      await request(app)
        .post(`/api/magic-movers/${mover2._id}/load`)
        .send({ itemIds: [ring._id] });
      await request(app).put(`/api/magic-movers/${mover2._id}/start-mission`);
      const endMover2Res = await request(app)
        .put(`/api/magic-movers/${mover2._id}/end-mission`);
      expect(endMover2Res.body.data.missionsCompleted).toBe(1);

      // ===== MOVER 3: No missions completed =====
      const mover3Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 75 });
      expect(mover3Res.status).toBe(201);

      // ===== VERIFY LEADERBOARD (Top Movers) =====
      const topMoversRes = await request(app).get("/api/magic-movers/top-movers");
      expect(topMoversRes.status).toBe(200);
      expect(topMoversRes.body.data).toHaveLength(3);

      // Verify descending order by missionsCompleted
      expect(topMoversRes.body.data[0].missionsCompleted).toBe(2); // Mover1
      expect(topMoversRes.body.data[1].missionsCompleted).toBe(1); // Mover2
      expect(topMoversRes.body.data[2].missionsCompleted).toBe(0); // Mover3

      // ===== VERIFY ALL MOVERS =====
      const allMoversRes = await request(app).get("/api/magic-movers");
      expect(allMoversRes.status).toBe(200);
      expect(allMoversRes.body.data).toHaveLength(3);
    });
  });

  /**
   * Tests weight limit validation and edge cases.
   */
  describe("Weight Limit Validation", () => {
    it("should prevent loading items that exceed weight limit", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 10 });
      const mover = moverRes.body.data;

      const heavyItemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Heavy Boulder", weight: 50 });
      const heavyItem = heavyItemRes.body.data;

      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [heavyItem._id] });

      expect(loadRes.status).toBe(400);
      expect(loadRes.body.message).toContain("exceeds weight limit");
    });

    it("should allow loading up to exact weight limit", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 25 });
      const mover = moverRes.body.data;

      const item1Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 1", weight: 10 });
      const item2Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 2", weight: 15 });

      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item1Res.body.data._id, item2Res.body.data._id] });

      expect(loadRes.status).toBe(200);
      expect(loadRes.body.data.questState).toBe("loading");
    });

    it("should prevent loading items that exceed weight limit in one request", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 20 });
      const mover = moverRes.body.data;

      const item1Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 1", weight: 15 });
      const item2Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 2", weight: 10 });

      // Try to load both items at once (25 total, limit is 20)
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item1Res.body.data._id, item2Res.body.data._id] });

      expect(loadRes.status).toBe(400);
      expect(loadRes.body.message).toMatch(/exceed/i);
    });
  });

  /**
   * Tests state transition rules and validations.
   */
  describe("State Transition Rules", () => {
    it("should prevent loading items while on a mission", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const item1Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 1", weight: 10 });
      const item2Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 2", weight: 10 });

      // Load item and start mission
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item1Res.body.data._id] });
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      // Try to load another item while on mission
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item2Res.body.data._id] });

      expect(loadRes.status).toBe(400);
      expect(loadRes.body.message).toContain("Cannot load items while on a mission");
    });

    it("should prevent starting a mission without items", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const startRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      expect(startRes.status).toBe(400);
      expect(startRes.body.message).toContain("from resting state");
    });

    it("should prevent starting a mission if already on one", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Gem", weight: 5 });

      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [itemRes.body.data._id] });
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      const start2Res = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      expect(start2Res.status).toBe(400);
      expect(start2Res.body.message).toContain("already on a mission");
    });

    it("should prevent ending a mission if not on one", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const endRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);

      expect(endRes.status).toBe(400);
      expect(endRes.body.message).toContain("not currently on a mission");
    });
  });

  /**
   * Tests database activity logging functionality.
   */
  describe("Activity Logging", () => {
    it("should create activity logs for all state transitions", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Crystal", weight: 10 });
      const item = itemRes.body.data;

      // Load items
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });

      let logs = await ActivityLog.find({ moverId: mover._id }).sort({ createdAt: 1 });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("loading");
      expect(logs[0].items.map(id => id.toString())).toContain(item._id);

      // Start mission
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      logs = await ActivityLog.find({ moverId: mover._id }).sort({ createdAt: 1 });
      expect(logs).toHaveLength(2);
      expect(logs[1].action).toBe("on-mission");

      // End mission
      await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);

      logs = await ActivityLog.find({ moverId: mover._id }).sort({ createdAt: 1 });
      expect(logs).toHaveLength(3);
      expect(logs[2].action).toBe("resting");
      // Resting log should contain the items that were just delivered
      expect(logs[2].items).toHaveLength(1);
      expect(logs[2].items.map(id => id.toString())).toContain(item._id);
    });

    it("should track items in activity logs correctly", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const item1Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Sword", weight: 10 });
      const item2Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Shield", weight: 15 });

      // Load multiple items
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({
          itemIds: [item1Res.body.data._id, item2Res.body.data._id]
        });

      const logs = await ActivityLog.find({ moverId: mover._id });
      expect(logs).toHaveLength(1);
      expect(logs[0].items).toHaveLength(2);
      expect(logs[0].items.map(id => id.toString())).toContain(item1Res.body.data._id);
      expect(logs[0].items.map(id => id.toString())).toContain(item2Res.body.data._id);
    });
  });

  /**
   * Tests error handling and validation.
   */
  describe("Error Handling", () => {
    it("should return 404 for non-existent mover", async () => {
      const loadRes = await request(app)
        .post("/api/magic-movers/60d5ec49f1b2c8b1a8e1e1e1/load")
        .send({ itemIds: ["60d5ec49f1b2c8b1a8e1e1e2"] });

      expect(loadRes.status).toBe(404);
      expect(loadRes.body.message).toContain("not found");
    });

    it("should return 404 for non-existent items", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: ["60d5ec49f1b2c8b1a8e1e1e1"] });

      expect(loadRes.status).toBe(404);
      expect(loadRes.body.message).toContain("not found");
    });

    it("should validate itemIds array is not empty", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [] });

      expect(loadRes.status).toBe(400);
    });

    it("should validate MongoDB ObjectId format", async () => {
      const loadRes = await request(app)
        .post("/api/magic-movers/invalid-id/load")
        .send({ itemIds: ["also-invalid"] });

      expect(loadRes.status).toBe(400);
    });
  });

  /**
   * Tests the complete Quest State Machine.
   */
  describe("Quest State Machine", () => {
    it("should follow the correct state progression: resting → loading → on-mission → resting", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Amulet", weight: 5 });
      const item = itemRes.body.data;

      // Initial state: resting
      expect(mover.questState).toBe("resting");

      // Load items: resting → loading
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });
      expect(loadRes.body.data.questState).toBe("loading");

      // Start mission: loading → on-mission
      const startRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);
      expect(startRes.body.data.questState).toBe("on-mission");

      // End mission: on-mission → resting
      const endRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);
      expect(endRes.body.data.questState).toBe("resting");
    });

    it("should allow loading multiple items at once in loading state", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const item1Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 1", weight: 10 });
      const item2Res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Item 2", weight: 10 });

      // Load both items in one request
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item1Res.body.data._id, item2Res.body.data._id] });
      expect(loadRes.status).toBe(200);
      expect(loadRes.body.data.questState).toBe("loading");
      expect(loadRes.body.data.items).toHaveLength(2);
    });
  });

  /**
   * Tests for new validations (duplicate items, item ownership).
   */
  describe("Item Ownership and Duplicate Validation", () => {
    it("should prevent loading duplicate items in the same request", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Magic Orb", weight: 10 });
      const item = itemRes.body.data;

      // Try to load the same item multiple times
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id, item._id] });

      expect(loadRes.status).toBe(422);
      expect(loadRes.body.message).toContain("duplicate items");
    });

    it("should prevent loading items already assigned to another mover", async () => {
      const mover1Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover1 = mover1Res.body.data;

      const mover2Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover2 = mover2Res.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Ancient Relic", weight: 10 });
      const item = itemRes.body.data;

      // Mover 1 loads the item
      await request(app)
        .post(`/api/magic-movers/${mover1._id}/load`)
        .send({ itemIds: [item._id] });

      // Mover 2 tries to load the same item
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover2._id}/load`)
        .send({ itemIds: [item._id] });

      expect(loadRes.status).toBe(409);
      expect(loadRes.body.message).toContain("already assigned");
    });

    it("should allow loading an item after it's been unassigned (mission ended)", async () => {
      const mover1Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover1 = mover1Res.body.data;

      const mover2Res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover2 = mover2Res.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Reusable Item", weight: 10 });
      const item = itemRes.body.data;

      // Mover 1 loads and completes a mission
      await request(app)
        .post(`/api/magic-movers/${mover1._id}/load`)
        .send({ itemIds: [item._id] });
      await request(app).put(`/api/magic-movers/${mover1._id}/start-mission`);
      await request(app).put(`/api/magic-movers/${mover1._id}/end-mission`);

      // Now mover 2 should be able to load the item
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover2._id}/load`)
        .send({ itemIds: [item._id] });

      expect(loadRes.status).toBe(200);
      expect(loadRes.body.data.items).toHaveLength(1);
    });
  });

  /**
   * Tests for activity log retrieval endpoints.
   */
  describe("Activity Log Endpoints", () => {
    it("should retrieve all activity logs", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Test Item", weight: 10 });
      const item = itemRes.body.data;

      // Create some activity
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });

      const logsRes = await request(app).get("/api/activity-logs");

      expect(logsRes.status).toBe(200);
      expect(logsRes.body.success).toBe(true);
      expect(Array.isArray(logsRes.body.data)).toBe(true);
      expect(logsRes.body.data.length).toBeGreaterThan(0);
    });

    it("should retrieve activity logs for a specific mover", async () => {
      const moverRes = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });
      const mover = moverRes.body.data;

      const itemRes = await request(app)
        .post("/api/magic-items")
        .send({ name: "Another Item", weight: 5 });
      const item = itemRes.body.data;

      // Create activity for this mover
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });
      await request(app).put(`/api/magic-movers/${mover._id}/start-mission`);
      await request(app).put(`/api/magic-movers/${mover._id}/end-mission`);

      const logsRes = await request(app).get(`/api/activity-logs/mover/${mover._id}`);

      expect(logsRes.status).toBe(200);
      expect(logsRes.body.success).toBe(true);
      expect(logsRes.body.data).toHaveLength(3); // load, start, end
      expect(logsRes.body.data[0].action).toBe("resting");
      expect(logsRes.body.data[1].action).toBe("on-mission");
      expect(logsRes.body.data[2].action).toBe("loading");
    });

    it("should return 400 for invalid mover ID format in logs endpoint", async () => {
      const logsRes = await request(app).get("/api/activity-logs/mover/invalid-id");

      expect(logsRes.status).toBe(400);
    });
  });
});
