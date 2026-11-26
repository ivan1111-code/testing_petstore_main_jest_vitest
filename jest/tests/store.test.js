const { api } = require("./support/client");
const {
  PET,
  STORE_ORDER,
  createPet,
  removePet,
  createOrder,
  removeOrder,
  makePet,
  makeOrder,
} = require("./support/fixtures");

const STORE = "/store";

describe("Store Positive", () => {
  let pet;
  let order;

  beforeEach(() => {
    pet = makePet();
    order = makeOrder();
  });

  afterEach(async () => {
    await removeOrder(order.id);
    await removePet(pet.id);
  });

  test("Add a new order [POST /store/order]", async () => {
    await createPet(pet);
    order.petId = pet.id;

    const res = await api.post(STORE_ORDER, { json: order });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
    expect(res.body.petId).toBe(pet.id);
    expect(res.body.status).toBe(order.status);
    expect(res.body.quantity).toBe(order.quantity);

    const get = await api.get(`${STORE_ORDER}/${order.id}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(order.id);
  });

  test("Find order by id [GET /store/order/{id}]", async () => {
    await createPet(pet);
    order.petId = pet.id;
    await createOrder(order);

    const res = await api.get(`${STORE_ORDER}/${order.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
    expect(res.body.petId).toBe(pet.id);
    expect(res.body.status).toBe(order.status);
    expect(res.body.quantity).toBe(order.quantity);
  });

  test("Find inventory list [GET /store/inventory]", async () => {
    const before = await api.get(`${STORE}/inventory`);
    expect(before.status).toBe(200);
    expect(typeof before.body).toBe("object");
    const pre = before.body.available || 0;

    await createPet(pet);
    order.petId = pet.id;
    order.status = "available";
    await createOrder(order);

    const after = await api.get(`${STORE}/inventory`);
    expect(after.status).toBe(200);
    const post = after.body.available || 0;
    expect(post).toBeGreaterThanOrEqual(pre);
  });

  test("Remove order [DELETE /store/order/{id}]", async () => {
    await createPet(pet);
    order.petId = pet.id;
    await createOrder(order);

    const del = await api.del(`${STORE_ORDER}/${order.id}`);
    expect(del.status).toBe(200);

    const get = await api.get(`${STORE_ORDER}/${order.id}`);
    expect(get.status).toBe(404);

    const delAgain = await api.del(`${STORE_ORDER}/${order.id}`);
    expect(delAgain.status).toBe(404);
  });
});

describe("Store Negative", () => {
  test.each([1, [2], "3"])("Create order with invalid data %j [POST /store/order]", async (data) => {
    const res = await api.post(STORE_ORDER, { json: data });
    expect([400, 404, 500]).toContain(res.status);
    expect(res.body).toHaveProperty("message");
  });

  test.each([{ id: 1 }, [2], null])(
    "Get order with invalid id %j [GET /store/order/{id}]",
    async (data) => {
      const res = await api.get(`${STORE_ORDER}/${data}`);
      expect([400, 404, 500]).toContain(res.status);
    }
  );

  test.each(["peric", "sold", "pending"])(
    "Get inventory with invalid path %s [GET /store/inventory/{x}]",
    async (data) => {
      const res = await api.get(`${STORE}/inventory/${data}`);
      expect([404, 500]).toContain(res.status);
    }
  );

  test.each([{ id: 1 }, { id: [] }, { id: "" }])(
    "Delete order with invalid id %j [DELETE /store/order/{id}]",
    async (data) => {
      const res = await api.del(`${STORE_ORDER}/${data}`);
      expect([400, 404, 500]).toContain(res.status);
    }
  );
});