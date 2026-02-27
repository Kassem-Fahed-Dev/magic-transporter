import "reflect-metadata";
import request from "supertest";
import app from "../src/app";

/** Helper to create a mover and return the response body data. */
async function createMover(weightLimit: number, name: string = "Test Mover") {
  const res = await request(app)
    .post("/api/magic-movers")
    .send({ name, weightLimit });
  return res.body.data;
}

/** Helper to create an item and return the response body data. */
async function createItem(name: string, weight: number) {
  const res = await request(app)
    .post("/api/magic-items")
    .send({ name, weight });
  return res.body.data;
}

describe("Magic Movers API", () => {
  describe("POST /api/magic-movers", () => {
    it("should create a new magic mover", async () => {
      const res = await request(app)
        .post("/api/magic-movers")
        .send({ name: "Test Mover", weightLimit: 100 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weightLimit).toBe(100);
      expect(res.body.data.questState).toBe("resting");
      expect(res.body.data.missionsCompleted).toBe(0);
    });

    it("should return 400 if weightLimit is missing", async () => {
      const res = await request(app)
        .post("/api/magic-movers")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if weightLimit is less than 1", async () => {
      const res = await request(app)
        .post("/api/magic-movers")
        .send({ name: "Test Mover", weightLimit: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/magic-movers")
        .send({ weightLimit: 100 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/magic-movers", () => {
    it("should return all movers", async () => {
      await createMover(50);
      await createMover(100);

      const res = await request(app).get("/api/magic-movers");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("POST /api/magic-movers/:id/load", () => {
    it("should load items onto a mover", async () => {
      const mover = await createMover(100);
      const item = await createItem("Magic Gem", 10);

      const res = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });

      expect(res.status).toBe(200);
      expect(res.body.data.questState).toBe("loading");
      expect(res.body.data.items).toHaveLength(1);
    });

    it("should reject loading if weight exceeds limit", async () => {
      const mover = await createMover(5);
      const item = await createItem("Heavy Rock", 10);

      const res = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("exceeds");
    });

    it("should reject loading if mover is on a mission", async () => {
      const mover = await createMover(100);
      const item1 = await createItem("Sword", 5);
      const item2 = await createItem("Shield", 5);

      // Load and start mission
      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item1._id] });
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      // Try to load more items
      const res = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item2._id] });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Cannot load");
    });

    it("should return 400 if itemIds is empty", async () => {
      const mover = await createMover(100);

      const res = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [] });

      expect(res.status).toBe(400);
    });

    it("should return 404 if mover does not exist", async () => {
      const res = await request(app)
        .post("/api/magic-movers/60d5ec49f1b2c8b1a8e1e1e1/load")
        .send({ itemIds: ["60d5ec49f1b2c8b1a8e1e1e2"] });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/magic-movers/:id/start-mission", () => {
    it("should start a mission", async () => {
      const mover = await createMover(100);
      const item = await createItem("Amulet", 3);

      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });

      const res = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      expect(res.status).toBe(200);
      expect(res.body.data.questState).toBe("on-mission");
    });

    it("should reject starting a mission without items", async () => {
      const mover = await createMover(100);

      const res = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("from resting state");
    });

    it("should reject starting a mission if already on one", async () => {
      const mover = await createMover(100);
      const item = await createItem("Staff", 5);

      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      const res = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("already");
    });
  });

  describe("PUT /api/magic-movers/:id/end-mission", () => {
    it("should end a mission and unload items", async () => {
      const mover = await createMover(100);
      const item = await createItem("Ring", 1);

      await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [item._id] });
      await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);

      const res = await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);

      expect(res.status).toBe(200);
      expect(res.body.data.questState).toBe("resting");
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.missionsCompleted).toBe(1);
    });

    it("should reject ending a mission if not on one", async () => {
      const mover = await createMover(100);

      const res = await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("not currently");
    });
  });

  describe("GET /api/magic-movers/top-movers", () => {
    it("should return movers sorted by missions completed descending", async () => {
      const mover1 = await createMover(100);
      const mover2 = await createMover(100);
      const item1 = await createItem("Gem A", 5);
      const item2 = await createItem("Gem B", 5);
      const item3 = await createItem("Gem C", 5);

      // Mover2 completes 2 missions
      await request(app).post(`/api/magic-movers/${mover2._id}/load`).send({ itemIds: [item1._id] });
      await request(app).put(`/api/magic-movers/${mover2._id}/start-mission`);
      await request(app).put(`/api/magic-movers/${mover2._id}/end-mission`);
      await request(app).post(`/api/magic-movers/${mover2._id}/load`).send({ itemIds: [item2._id] });
      await request(app).put(`/api/magic-movers/${mover2._id}/start-mission`);
      await request(app).put(`/api/magic-movers/${mover2._id}/end-mission`);

      // Mover1 completes 1 mission
      await request(app).post(`/api/magic-movers/${mover1._id}/load`).send({ itemIds: [item3._id] });
      await request(app).put(`/api/magic-movers/${mover1._id}/start-mission`);
      await request(app).put(`/api/magic-movers/${mover1._id}/end-mission`);

      const res = await request(app).get("/api/magic-movers/top-movers");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].missionsCompleted).toBe(2);
      expect(res.body.data[1].missionsCompleted).toBe(1);
    });
  });

  describe("Full lifecycle", () => {
    it("should complete a full mover lifecycle: create, load, start, end", async () => {
      // Create mover
      const mover = await createMover(50);
      expect(mover.questState).toBe("resting");

      // Create items
      const sword = await createItem("Sword", 15);
      const shield = await createItem("Shield", 20);

      // Load items
      const loadRes = await request(app)
        .post(`/api/magic-movers/${mover._id}/load`)
        .send({ itemIds: [sword._id, shield._id] });
      expect(loadRes.body.data.questState).toBe("loading");

      // Start mission
      const startRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/start-mission`);
      expect(startRes.body.data.questState).toBe("on-mission");

      // End mission
      const endRes = await request(app)
        .put(`/api/magic-movers/${mover._id}/end-mission`);
      expect(endRes.body.data.questState).toBe("resting");
      expect(endRes.body.data.items).toHaveLength(0);
      expect(endRes.body.data.missionsCompleted).toBe(1);
    });
  });
});
