// Dependency-free lint: syntax check plus a few style rules.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const roots = ["src", "tests", "scripts"];
const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".js")) files.push(path);
  }
};
roots.forEach(walk);

// Built from parts so this rule does not flag its own source.
const debuggerStatement = new RegExp(String.raw`\b` + "debug" + String.raw`ger\b`);
const problems = [];
for (const file of files) {
  execFileSync(process.execPath, ["--check", file]);
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/\s+$/.test(line)) problems.push(`${file}:${i + 1} trailing whitespace`);
      if (/\bvar\s/.test(line)) problems.push(`${file}:${i + 1} use let/const instead of var`);
      if (debuggerStatement.test(line)) problems.push(`${file}:${i + 1} remove the debugging breakpoint`);
    });
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`lint ok (${files.length} files)`);
