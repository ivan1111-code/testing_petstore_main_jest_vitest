import { api } from "./client.js";

export const PET = "/pet";
export const STORE_ORDER = "/store/order";
export const STORE = "/store";
export const USER = "/user";


export async function createPet(pet) {
  const res = await api.post(PET, { json: pet });
  if (res.status !== 200) {
    throw new Error(`createPet failed: ${res.status} ${res.text}`);
  }
  return pet;
}

export async function removePet(petId) {
  if (!petId) return;
  await api.del(`${PET}/${petId}`);
}


export async function createOrder(order) {
  const res = await api.post(STORE_ORDER, { json: order });
  if (res.status !== 200) {
    throw new Error(`createOrder failed: ${res.status} ${res.text}`);
  }
  return order;
}

export async function removeOrder(orderId) {
  if (!orderId) return;
  await api.del(`${STORE_ORDER}/${orderId}`);
}


export async function createUser(user) {
  const res = await api.post(USER, { json: user });
  if (res.status !== 200) {
    throw new Error(`createUser failed: ${res.status} ${res.text}`);
  }
  return user;
}

export async function removeUser(username) {
  if (!username) return;
  await api.del(`${USER}/${username}`);
}