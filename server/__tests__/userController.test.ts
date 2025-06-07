import request from "supertest";
import app from "../index";

describe("User API", () => {
	test("GET /api/v1/user/:id returns user data", async () => {
		const res = await request(app).get("/api/v1/user/1");
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", 1);
	}, 10000);

	test("POST /api/v1/user/register creates a new user", async () => {
		const res = await request(app).post("/api/v1/user/register").send({
			username: "John Doe",
			email: "johndoe@example.com",
			password: "password123",
			isAdmin: false,
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("name", "John Doe");
	});
});
