// Loads every module so broken imports or exports fail the build.
await import("../src/patients.js");
const { handler } = await import("../src/app.js");
if (typeof handler !== "function") {
  console.error("src/app.js must export a handler function");
  process.exit(1);
}
console.log("compile ok");
