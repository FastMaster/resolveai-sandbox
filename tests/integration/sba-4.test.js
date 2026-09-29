import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = join(__dirname, "..", "public");

let server;
let base;

before(async () => {
  const { default: serverModule } = await import("../src/server.js");
  server = serverModule;
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

describe("Frontend Integration Tests", () => {
  test("serves index.html at root path /", async () => {
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 200);
    const contentType = response.headers.get("content-type");
    assert.ok(contentType?.includes("text/html"));
    const html = await response.text();
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("Gestión de Pacientes"));
    assert.ok(html.includes('id="search-input"'));
    assert.ok(html.includes('id="patient-list"'));
    assert.ok(html.includes('id="patient-detail"'));
  });

  test("serves static assets (CSS, JS)", async () => {
    const cssResponse = await fetch(`${base}/styles.css`);
    assert.equal(cssResponse.status, 200);
    assert.ok(cssResponse.headers.get("content-type")?.includes("text/css"));

    const jsResponse = await fetch(`${base}/app.js`);
    assert.equal(jsResponse.status, 200);
    assert.ok(jsResponse.headers.get("content-type")?.includes("javascript"));
  });

  test("API endpoints still work under /api/*", async () => {
    const patientsResponse = await fetch(`${base}/api/patients`);
    assert.equal(patientsResponse.status, 200);
    const patients = await patientsResponse.json();
    assert.ok(Array.isArray(patients));
    assert.equal(patients.length, 4);

    const patientResponse = await fetch(`${base}/api/patients/1`);
    assert.equal(patientResponse.status, 200);
    const patient = await patientResponse.json();
    assert.equal(patient.id, 1);
    assert.equal(patient.name, "Ana García");
    assert.equal(patient.ward, 3);

    const notFoundResponse = await fetch(`${base}/api/patients/999`);
    assert.equal(notFoundResponse.status, 404);
  });

  test("health endpoint works", async () => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data, { ok: true });
  });
});

describe("Frontend Accessibility Tests", () => {
  test("index.html includes skip link for keyboard navigation", async () => {
    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.ok(html.includes('class="skip-link"'));
    assert.ok(html.includes('href="#main"'));
    assert.ok(html.includes("Saltar al contenido principal"));
    assert.ok(html.includes('id="main"'));
  });

  test("search input has proper ARIA attributes", async () => {
    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.ok(html.includes('id="search-input"'));
    assert.ok(html.includes('aria-describedby="search-hint"'));
    assert.ok(html.includes('id="search-hint"'));
    assert.ok(html.includes('class="visually-hidden"'));
  });

  test("patient list has proper ARIA roles", async () => {
    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.ok(html.includes('role="listbox"'));
    assert.ok(html.includes('aria-label="Pacientes"'));
  });

  test("detail section has aria-live for dynamic updates", async () => {
    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.ok(html.includes('aria-live="polite"'));
  });

  test("CSS includes focus-visible styles for keyboard navigation", async () => {
    const response = await fetch(`${base}/styles.css`);
    const css = await response.text();
    assert.ok(css.includes(":focus-visible"));
    assert.ok(css.includes("outline"));
    assert.ok(css.includes("outline-offset"));
  });

  test("CSS includes high contrast support", async () => {
    const response = await fetch(`${base}/styles.css`);
    const css = await response.text();
    assert.ok(css.includes("prefers-contrast") || css.includes("currentColor"));
  });
});

describe("Frontend Responsive Tests", () => {
  test("CSS includes mobile breakpoint (≤480px)", async () => {
    const response = await fetch(`${base}/styles.css`);
    const css = await response.text();
    assert.ok(css.includes("@media") && css.includes("480px"));
  });

  test("viewport meta tag is present", async () => {
    const response = await fetch(`${base}/`);
    const html = await response.text();
    assert.ok(html.includes('name="viewport"'));
    assert.ok(html.includes("width=device-width"));
    assert.ok(html.includes("initial-scale=1"));
  });
});

describe("Frontend Search Functionality (via served JS)", () => {
  test("app.js contains case-insensitive search logic", async () => {
    const response = await fetch(`${base}/app.js`);
    const js = await response.text();
    assert.ok(js.includes("toLowerCase"));
    assert.ok(js.includes("includes"));
    assert.ok(js.includes("filterPatients") || js.includes("filter"));
  });

  test("app.js fetches patients from /api/patients on load", async () => {
    const response = await fetch(`${base}/app.js`);
    const js = await response.text();
    assert.ok(js.includes("/api/patients"));
    assert.ok(js.includes("fetch"));
  });

  test("app.js fetches patient detail from /api/patients/:id on selection", async () => {
    const response = await fetch(`${base}/app.js`);
    const js = await response.text();
    assert.ok(js.includes("/api/patients/"));
    assert.ok(js.includes("fetchPatientDetail") || js.includes("selectPatient"));
  });

  test("app.js includes XSS protection (escapeHtml)", async () => {
    const response = await fetch(`${base}/app.js`);
    const js = await response.text();
    assert.ok(js.includes("escapeHtml"));
    assert.ok(js.includes("textContent"));
    assert.ok(js.includes("innerHTML"));
  });
});

describe("Frontend Keyboard Navigation", () => {
  test("patient list items are keyboard focusable (tabindex)", async () => {
    const response = await fetch(`${base}/app.js`);
    const js = await response.text();
    assert.ok(js.includes("tabIndex") || js.includes("tabindex"));
    assert.ok(js.includes("keydown") || js.includes("keypress"));
    assert.ok(js.includes("Enter") || js.includes("Space"));
  });

  test("CSS provides visible focus styles for interactive elements", async () => {
    const response = await fetch(`${base}/styles.css`);
    const css = await response.text();
    assert.ok(css.includes(".patient-item:focus-visible") || css.includes(":focus-visible"));
    assert.ok(css.includes("outline") || css.includes("box-shadow"));
  });
});
