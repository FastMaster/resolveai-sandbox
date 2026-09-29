import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { handler } from "../../src/app.js";

let server;
let base;
before(async () => {
  server = createServer(handler);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test("health endpoint answers 200", async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("returns an existing patient", async () => {
  const response = await fetch(`${base}/api/patients/1`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).name, "Ana García");
});

test("returns 404 for non-existent patient", async () => {
  const response = await fetch(`${base}/api/patients/999`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Paciente no encontrado" });
});
