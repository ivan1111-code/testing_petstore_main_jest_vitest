import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { api } from "./support/client.js";
import {
  USER,
  createUser,
  removeUser,
} from "./support/fixtures.js";
import { makeUser } from "./support/factories.js";

describe("User Positive", () => {
  let user;

  beforeEach(() => {
    user = makeUser();
  });

  afterEach(async () => {
    await removeUser(user.username);
  });

  test("Create User [POST /user]", async () => {
    const res = await api.post(USER, { json: user });
    expect(res.status).toBe(200);

    const get = await api.get(`${USER}/${user.username}`);
    expect(get.status).toBe(200);
    expect(get.body.username).toBe(user.username);
    expect(get.body.email).toBe(user.email);
  });

  test("Get User by username [GET /user/{username}]", async () => {
    await createUser(user);

    const res = await api.get(`${USER}/${user.username}`);
    expect(res.status).toBe(200);

    const data = res.body;
    expect(data.id).toBe(user.id);
    expect(data.username).toBe(user.username);
    expect(data.firstName).toBe(user.firstName);
    expect(data.lastName).toBe(user.lastName);
    expect(data.email).toBe(user.email);
    expect(data.phone).toBe(user.phone);
    expect(data.userStatus).toBe(user.userStatus);
  });

  test("Update User [PUT /user/{username}]", async () => {
    await createUser(user);

    const updated = { ...user, firstName: "Maomao", lastName: "Neko" };
    const res = await api.put(`${USER}/${user.username}`, { json: updated });
    expect(res.status).toBe(200);

    const get = await api.get(`${USER}/${user.username}`);
    expect(get.status).toBe(200);
    expect(get.body.firstName).toBe("Maomao");
    expect(get.body.lastName).toBe("Neko");
    expect(get.body.username).toBe(user.username);
    expect(get.body.email).toBe(user.email);
  });

  test("Delete User [DELETE /user/{username}]", async () => {
    await createUser(user);

    const del = await api.del(`${USER}/${user.username}`);
    expect(del.status).toBe(200);

    const get = await api.get(`${USER}/${user.username}`);
    expect(get.status).toBe(404);

    const delAgain = await api.del(`${USER}/${user.username}`);
    expect(delAgain.status).toBe(404);
  });

  test("Login User [GET /user/login]", async () => {
    await createUser(user);

    const res = await api.get(`${USER}/login`, {
      params: { username: user.username, password: user.password },
    });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message).toContain("logged in user session");
    const sessionId = res.body.message.split(":").pop().trim();
    expect(sessionId).toMatch(/^\d+$/);
  });

  test("Logout User [GET /user/logout]", async () => {
    const res = await api.get(`${USER}/logout`);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.message.toLowerCase()).toContain("ok");
  });

  test("Create users with list [POST /user/createWithList]", async () => {
    const users = [makeUser(), makeUser(), makeUser()];
    try {
      const res = await api.post(`${USER}/createWithList`, { json: users });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);

      for (const u of users) {
        const get = await api.get(`${USER}/${u.username}`);
        expect(get.status).toBe(200);
        expect(get.body.username).toBe(u.username);
      }
    } finally {
      for (const u of users) await removeUser(u.username);
    }
  });

  test("Create users with array [POST /user/createWithArray]", async () => {
    const users = [makeUser(), makeUser(), makeUser()];
    try {
      const res = await api.post(`${USER}/createWithArray`, { json: users });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);

      for (const u of users) {
        const get = await api.get(`${USER}/${u.username}`);
        expect(get.status).toBe(200);
      }
    } finally {
      for (const u of users) await removeUser(u.username);
    }
  });
});

describe("User Negative", () => {
  test.each([1, [2], "3"])(
    "Create user with invalid data %j [POST /user]",
    async (data) => {
      const res = await api.post(USER, { json: data });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("unknown");
      expect(res.body.message).toBe("something bad happened");
    }
  );

  test.each([1, [2], "3"])(
    "Get user with invalid username %j [GET /user/{username}]",
    async (data) => {
      const res = await api.get(`${USER}/${data}`);
      expect([400, 404]).toContain(res.status);

      if (res.contentType.includes("json")) {
        expect(res.body).toHaveProperty("message");
      } else {
        expect(res.text.length).toBeGreaterThan(0);
      }
    }
  );

  test("Update user with invalid fields [PUT /user/{username}]", async () => {
    const user = makeUser();
    await createUser(user);

    const invalid = { id: [1], username: user.username, invalidField: "abcde" };
    const res = await api.put(`${USER}/${user.username}`, { json: invalid });
    expect(res.status).toBe(500);

    const get = await api.get(`${USER}/${user.username}`);
    expect(get.status).toBe(200);
    expect(get.body.firstName).toBe(user.firstName);

    await removeUser(user.username);
  });

  test.each(["1", "[]", "nonexistent_user_xyz"])(
    "Delete user with invalid username %s [DELETE /user/{username}]",
    async (data) => {
      const res = await api.del(`${USER}/${data}`);
      expect([400, 404]).toContain(res.status);
    }
  );

  test.each([
    {},
    { username: "nonexistent_user_xyz" },
    { username: "", password: "" },
  ])("Login without valid credentials %j [GET /user/login]", async (params) => {
    const res = await api.get(`${USER}/login`, { params });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
  });

  test("Logout with wrong method [POST /user/logout]", async () => {
    const res = await api.post(`${USER}/logout`);
    expect([200, 404, 405]).toContain(res.status);
    expect(res.text.length).toBeGreaterThan(0);
  });

  test.each([1, "abc", { not: "a list" }])(
    "Create users with invalid list %j [POST /user/createWithList]",
    async (data) => {
      const res = await api.post(`${USER}/createWithList`, { json: data });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("unknown");
    }
  );

  test.each([1, "abc", { not: "an array" }])(
    "Create users with invalid array %j [POST /user/createWithArray]",
    async (data) => {
      const res = await api.post(`${USER}/createWithArray`, { json: data });
      expect(res.status).toBe(500);
      expect(res.body.type).toBe("unknown");
    }
  );
});