export function randId() {
  return Math.floor(Math.random() * 1e9);
}

export function randStr(prefix = "pet") {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export function makePet(overrides = {}) {
  return {
    id: randId(),
    name: randStr("pet"),
    category: { id: 0, name: "dog" },
    photoUrls: [
      "https://avatars.mds.yandex.net/i?id=3fcfaf1b632971120fe28d9c4cefa57f_l-5499599-images-thumbs&n=13",
    ],
    status: "available",
    ...overrides,
  };
}

export function makeUser(overrides = {}) {
  const id = Math.floor(Math.random() * 9999) + 1;
  return {
    id,
    username: `ivanglush${id}`,
    firstName: "ivan",
    lastName: "glushenko",
    email: `ivanglush${id}@gmail.com`,
    password: "12345",
    phone: "+1 (234) 567 89-10",
    userStatus: 1,
    ...overrides,
  };
}

export function makeOrder(overrides = {}) {
  return {
    id: randId(),
    petId: null,
    quantity: 1,
    shipDate: "2026-11-02T10:00:00.000Z",
    status: "placed",
    complete: false,
    ...overrides,
  };
}