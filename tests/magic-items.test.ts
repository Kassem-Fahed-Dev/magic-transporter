import "reflect-metadata";
import request from "supertest";
import app from "../src/app";

describe("Magic Items API", () => {
  describe("POST /api/magic-items", () => {
    it("should create a new magic item", async () => {
      const res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Enchanted Sword", weight: 5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Enchanted Sword");
      expect(res.body.data.weight).toBe(5);
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/magic-items")
        .send({ weight: 5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if weight is invalid", async () => {
      const res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Broken Shield", weight: -1 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if weight is zero", async () => {
      const res = await request(app)
        .post("/api/magic-items")
        .send({ name: "Feather", weight: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/magic-items", () => {
    it("should return an empty array initially", async () => {
      const res = await request(app).get("/api/magic-items");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should return all created items", async () => {
      await request(app).post("/api/magic-items").send({ name: "Potion", weight: 2 });
      await request(app).post("/api/magic-items").send({ name: "Shield", weight: 10 });

      const res = await request(app).get("/api/magic-items");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
