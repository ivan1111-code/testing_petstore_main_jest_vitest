const { api } = require("./support/client");
const {
  PET,
  createPet,
  removePet,
  makePet,
} = require("./support/fixtures");

describe("Pet Positive", () => {
  let pet;

  beforeEach(() => {
    pet = makePet();
  });

  afterEach(async () => {
    await removePet(pet.id);
  });

  test("Add a new pet [POST /pet]", async () => {
    const res = await api.post(PET, { json: pet });
    expect(res.status).toBe(200);

    const data = res.body;
    expect(data.id).toBe(pet.id);
    expect(data.name).toBe(pet.name);
    expect(data.status).toBe(pet.status);
    expect(data.category).toEqual(pet.category);
    expect(data.photoUrls).toEqual(pet.photoUrls);

    const get = await api.get(`${PET}/${pet.id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe(pet.name);
  });

  test("Update an existing pet [POST /pet/{id}]", async () => {
    await createPet(pet);
  
    const newName = "somepet";
    const newStatus = "pending";
  
    const res = await api.post(`${PET}/${pet.id}`, {
      form: { name: newName, status: newStatus },
    });
    expect(res.status).toBe(200);
  
    const get = await api.get(`${PET}/${pet.id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe(newName);
    expect(get.body.status).toBe(newStatus);
    expect(get.body.id).toBe(pet.id);
    expect(get.body.category).toEqual(pet.category);
  });

  test("Upload an image [POST /pet/{id}/uploadImage]", async () => {
    await createPet(pet);
  
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }),
      "test.png"
    );
    form.append("additionalMetadata", "test upload");
  
    const res = await api.postFormData(`${PET}/${pet.id}/uploadImage`, form);

    expect([200, 500]).toContain(res.status);
  
    const get = await api.get(`${PET}/${pet.id}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(pet.id);
  });

  test("Find pet by id [GET /pet/{id}]", async () => {
    await createPet(pet);

    const res = await api.get(`${PET}/${pet.id}`);
    expect(res.status).toBe(200);

    const data = res.body;
    expect(data.id).toBe(pet.id);
    expect(data.name).toBe(pet.name);
    expect(data.status).toBe(pet.status);
    expect(data.category).toEqual(pet.category);
    expect(data.photoUrls).toEqual(pet.photoUrls);
  });

  test("Find pets by status [GET /pet/findByStatus]", async () => {
    for (const status of ["available", "pending", "sold"]) {
      const res = await api.get(`${PET}/findByStatus`, { params: { status } });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body.every((p) => p.status === status)).toBe(true);
      }
    }
  });

  test("Update an existing pet [PUT /pet]", async () => {
    await createPet(pet);

    const updated = { ...pet, name: "somepet" };
    const res = await api.put(PET, { json: updated });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("somepet");
    expect(res.body.id).toBe(pet.id);

    const get = await api.get(`${PET}/${pet.id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe("somepet");
    expect(get.body.status).toBe(pet.status);
  });

  test("Delete a pet [DELETE /pet/{id}]", async () => {
    await createPet(pet);

    const del = await api.del(`${PET}/${pet.id}`);
    expect(del.status).toBe(200);

    const get = await api.get(`${PET}/${pet.id}`);
    expect(get.status).toBe(404);

    const delAgain = await api.del(`${PET}/${pet.id}`);
    expect(delAgain.status).toBe(404);
  });
});

describe("Pet Negative", () => {
  test.each([
    [{ id: 1, tags: [[], [], []] }],
    [{ id: 1, photoUrls: [{}, {}, {}] }],
    [{ id: 1, category: [] }],
  ])("Add a new pet with invalid data %j [POST /pet]", async (invalidJson) => {
    const res = await api.post(PET, { json: invalidJson });
    expect(res.status).toBe(500);
    expect(res.body.type).toBe("unknown");
    expect(res.body.message).toBe("something bad happened");

    const get = await api.get(`${PET}/1`);
    expect(get.status).toBe(404);
  });

  test.each([
    ["tags", []],
    ["photoUrls", []],
    ["category", {}],
  ])(
    "Update pet with invalid form data %s=%j [POST /pet/{id}]",
    async (option, value) => {
      const pet = makePet();
      await createPet(pet);
  
      const res = await api.post(`${PET}/${pet.id}`, {
        form: { [option]: JSON.stringify(value) },
      });
      // Petstore обычно возвращает 200 даже на мусор
      expect([200, 400, 500]).toContain(res.status);
  
      const get = await api.get(`${PET}/${pet.id}`);
      expect(get.status).toBe(200);
      expect(get.body.id).toBe(pet.id);
  
      await removePet(pet.id);
    }
  );

  test.each([-1, -2, -3])("Get pet with negative id %i [GET /pet/{id}]", async (id) => {
    const res = await api.get(`${PET}/${id}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test.each(["unknown", "abc", "abcde"])(
    "Find pet by invalid status %s [GET /pet/findByStatus]",
    async (status) => {
      const res = await api.get(`${PET}/findByStatus`, { params: { status } });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    }
  );

  test.each([
    [{ id: 111, name: "pet_A" }, { id: 111, name: [1] }],
    [{ id: 222, name: "pet_B" }, { id: 222, name: [2] }],
    [{ id: 333, name: "pet_C" }, { id: 333, name: [3] }],
  ])("Update pet with invalid fields [PUT /pet]", async (postData, putData) => {
    const post = await api.post(PET, { json: postData });
    expect(post.status).toBe(200);

    const put = await api.put(PET, { json: putData });
    expect(put.status).toBe(500);

    const get = await api.get(`${PET}/${postData.id}`);
    expect(get.status).toBe(200);
    expect(get.body.name).toBe(postData.name);

    await removePet(postData.id);
  });

  test("Delete pet with string as id [DELETE /pet/{id}]", async () => {
    const res = await api.del(`${PET}/[]`);
    expect([400, 404]).toContain(res.status);
  });
});