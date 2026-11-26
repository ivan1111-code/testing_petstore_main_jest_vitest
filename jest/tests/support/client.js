const BASE_URL = "https://petstore.swagger.io/v2";
const TIMEOUT_MS = 10_000;

async function request(method, path, { json, form, params, headers } = {}) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let body;
  const reqHeaders = { ...headers };

  if (json !== undefined) {
    body = JSON.stringify(json);
    reqHeaders["Content-Type"] = "application/json";
  } else if (form !== undefined) {
    body = new URLSearchParams(form).toString();
    reqHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  }

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body,
      signal: controller.signal,
    });

    const text = await res.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    return {
      status: res.status,
      headers: res.headers,
      body: parsed,
      text,
      ok: res.ok,
      contentType: res.headers.get("content-type") || "",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function postFormData(path, formData) {
  const url = new URL(BASE_URL + path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData, // fetch сам выставит multipart boundary
      signal: controller.signal,
    });

    const text = await res.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    return {
      status: res.status,
      headers: res.headers,
      body: parsed,
      text,
      ok: res.ok,
      contentType: res.headers.get("content-type") || "",
    };
  } finally {
    clearTimeout(timer);
  }
}

const api = {
  baseUrl: BASE_URL,
  get: (path, opts) => request("GET", path, opts),
  post: (path, opts) => request("POST", path, opts),
  put: (path, opts) => request("PUT", path, opts),
  del: (path, opts) => request("DELETE", path, opts),
  postFormData,
};

module.exports = { api, BASE_URL };