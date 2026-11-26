const { api } = require("./client");
const { makePet, makeUser, makeOrder } = require("./factories");

const PET = "/pet";
const STORE_ORDER = "/store/order";
const USER = "/user";


async function createPet(pet) {
  const res = await api.post(PET, { json: pet });
  if (res.status !== 200) {
    throw new Error(`createPet failed: ${res.status} ${res.text}`);
  }
  return pet;
}

async function removePet(petId) {
  if (!petId) return;
  await api.del(`${PET}/${petId}`);
}


async function createOrder(order) {
  const res = await api.post(STORE_ORDER, { json: order });
  if (res.status !== 200) {
    throw new Error(`createOrder failed: ${res.status} ${res.text}`);
  }
  return order;
}

async function removeOrder(orderId) {
  if (!orderId) return;
  await api.del(`${STORE_ORDER}/${orderId}`);
}


async function createUser(user) {
  const res = await api.post(USER, { json: user });
  if (res.status !== 200) {
    throw new Error(`createUser failed: ${res.status} ${res.text}`);
  }
  return user;
}

async function removeUser(username) {
  if (!username) return;
  await api.del(`${USER}/${username}`);
}

module.exports = {
  PET,
  STORE_ORDER,
  USER,
  createPet,
  removePet,
  createOrder,
  removeOrder,
  createUser,
  removeUser,
  makePet,
  makeUser,
  makeOrder,
};