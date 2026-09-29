import { test } from "node:test";
import assert from "node:assert/strict";
import { findPatient, listPatients } from "../../src/patients.js";

test("lists patients without clinical details", () => {
  assert.deepEqual(listPatients()[0], { id: 1, name: "Ana García" });
});

test("finds an existing patient", () => {
  assert.equal(findPatient(2).ward, "Traumatología");
});
