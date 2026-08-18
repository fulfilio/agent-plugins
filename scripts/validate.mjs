#!/usr/bin/env node
// Validates this marketplace and every plugin in it against the Cursor plugin
// manifest rules (cursor/plugins schemas), plus the frontmatter requirements
// enforced by the marketplace template validator.

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const errors = [];
const warnings = [];

const NAME_RE = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const KNOWN_KEYS = new Set([
  "name", "displayName", "description", "version", "minClientVersions", "author",
  "publisher", "homepage", "repository", "license", "logo", "keywords",
  "category", "tags", "commands", "agents", "skills", "rules", "hooks",
  "variables", "mcpServers",
]);
const COMPONENT_KEYS = ["rules", "skills", "agents", "commands", "hooks", "mcpServers"];

const exists = (p) => fs.access(p).then(() => true, () => false);

async function readJson(file, label) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (err) {
    errors.push(`${label}: ${err.code === "ENOENT" ? "missing" : `invalid JSON — ${err.message}`} (${path.relative(root, file)})`);
    return null;
  }
}

function frontmatter(content) {
  const text = content.replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    const i = line.indexOf(":");
    if (i === -1 || !line.trim() || line.trim().startsWith("#")) continue;
    fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fields;
}

async function walk(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const e of await fs.readdir(current, { withFileTypes: true })) {
      const p = path.join(current, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) out.push(p);
    }
  }
  return out;
}

const isDoc = (f) => [".md", ".mdc", ".markdown"].includes(path.extname(f).toLowerCase());

async function checkFrontmatter(dir, label, required, match, plugin) {
  if (!(await exists(dir))) return 0;
  let n = 0;
  for (const file of await walk(dir)) {
    if (!match(file)) continue;
    n += 1;
    const fields = frontmatter(await fs.readFile(file, "utf8"));
    const rel = path.relative(root, file);
    if (!fields) {
      errors.push(`${plugin}: ${label} missing YAML frontmatter — ${rel}`);
      continue;
    }
    for (const key of required) {
      if (!fields[key]) errors.push(`${plugin}: ${label} missing "${key}" in frontmatter — ${rel}`);
    }
  }
  return n;
}

async function validatePlugin(dir, entryName) {
  const manifest = await readJson(path.join(dir, ".cursor-plugin", "plugin.json"), `${entryName} manifest`);
  if (!manifest) return null;
  const name = manifest.name ?? entryName;

  if (!NAME_RE.test(manifest.name ?? "")) errors.push(`${name}: "name" must be lowercase kebab-case.`);
  if (manifest.name && manifest.name !== entryName) {
    errors.push(`${entryName}: marketplace entry name does not match manifest name "${manifest.name}".`);
  }
  for (const key of Object.keys(manifest)) {
    if (!KNOWN_KEYS.has(key)) errors.push(`${name}: unknown manifest key "${key}" — the marketplace schema rejects it.`);
  }
  if (!manifest.author?.name) errors.push(`${name}: "author.name" is required.`);
  for (const key of ["displayName", "description", "version", "license", "logo"]) {
    if (!manifest[key]) warnings.push(`${name}: manifest has no "${key}" — recommended for a listing.`);
  }

  // Declared paths must resolve.
  for (const field of ["logo", ...COMPONENT_KEYS]) {
    const value = manifest[field];
    const paths = typeof value === "string" ? [value] : Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
    for (const p of paths) {
      if (p.startsWith("http://") || p.startsWith("https://")) continue;
      if (path.isAbsolute(p) || p.split("/").includes("..")) errors.push(`${name}: field "${field}" has unsafe path "${p}".`);
      else if (!(await exists(path.resolve(dir, p)))) errors.push(`${name}: field "${field}" references missing path "${p}".`);
    }
  }

  // Components that exist on disk must be declared, or the client will not load them.
  for (const field of ["rules", "skills", "agents", "commands"]) {
    if ((await exists(path.join(dir, field))) && !manifest[field]) {
      errors.push(`${name}: ships ${field}/ but the manifest does not declare "${field}".`);
    }
  }
  if ((await exists(path.join(dir, "mcp.json"))) && !manifest.mcpServers) {
    errors.push(`${name}: ships mcp.json but the manifest does not declare "mcpServers".`);
  }

  // MCP variables must be both declared and used.
  const mcpPath = path.join(dir, "mcp.json");
  if (await exists(mcpPath)) {
    const raw = await fs.readFile(mcpPath, "utf8");
    try { JSON.parse(raw); } catch (e) { errors.push(`${name}: mcp.json is not valid JSON — ${e.message}`); }
    const declared = new Set(Object.keys(manifest.variables?.properties ?? {}));
    const used = new Set([...raw.matchAll(/\$\{([A-Z0-9_]+)\}/g)].map((m) => m[1]));
    for (const v of used) if (!declared.has(v)) errors.push(`${name}: mcp.json uses \${${v}} but "variables" does not declare it.`);
    for (const v of declared) if (!used.has(v)) warnings.push(`${name}: variable "${v}" is declared but never used in mcp.json.`);
  }

  const counts = {
    rules: await checkFrontmatter(path.join(dir, "rules"), "rule", ["description"], isDoc, name),
    skills: await checkFrontmatter(path.join(dir, "skills"), "skill", ["name", "description"], (f) => path.basename(f) === "SKILL.md", name),
    agents: await checkFrontmatter(path.join(dir, "agents"), "agent", ["name", "description"], isDoc, name),
    commands: await checkFrontmatter(path.join(dir, "commands"), "command", ["name", "description"], (f) => isDoc(f) || f.endsWith(".txt"), name),
  };

  for (const [label, file] of [["README", "README.md"], ["CHANGELOG", "CHANGELOG.md"], ["LICENSE", "LICENSE"]]) {
    if (!(await exists(path.join(dir, file)))) warnings.push(`${name}: no ${label} — required by cursor/plugins for a third-party listing.`);
  }

  return { name, counts };
}

const marketplace = await readJson(path.join(root, ".cursor-plugin", "marketplace.json"), "Marketplace manifest");
if (!marketplace) {
  console.error(errors.join("\n"));
  process.exit(1);
}
if (!NAME_RE.test(marketplace.name ?? "")) errors.push('Marketplace "name" must be lowercase kebab-case.');
if (!marketplace.owner?.name) errors.push('Marketplace "owner.name" is required.');

const entries = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
if (!entries.length) errors.push('Marketplace "plugins" must be a non-empty array.');

const seen = new Set();
const results = [];
for (const [i, entry] of entries.entries()) {
  const label = `plugins[${i}]`;
  if (!entry?.name || !NAME_RE.test(entry.name)) { errors.push(`${label}.name must be lowercase kebab-case.`); continue; }
  if (seen.has(entry.name)) errors.push(`Duplicate plugin name: "${entry.name}"`);
  seen.add(entry.name);
  const source = entry.source ?? "";
  if (!source || path.isAbsolute(source) || source.split("/").includes("..")) { errors.push(`${label}.source is not a safe relative path.`); continue; }
  const dir = path.resolve(root, source);
  if (!(await exists(dir))) { errors.push(`${label}.source directory is missing: ${source}`); continue; }
  const result = await validatePlugin(dir, entry.name);
  if (result) results.push(result);
}

// Anything under plugins/ that the marketplace forgot to list is invisible.
const pluginsDir = path.join(root, "plugins");
if (await exists(pluginsDir)) {
  for (const e of await fs.readdir(pluginsDir, { withFileTypes: true })) {
    if (e.isDirectory() && !seen.has(e.name)) {
      errors.push(`plugins/${e.name} exists but is not listed in marketplace.json — it will not be installable.`);
    }
  }
}

if (warnings.length) {
  console.log("Warnings:");
  for (const w of warnings) console.log(`- ${w}`);
  console.log("");
}
if (errors.length) {
  console.error("Validation failed:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
for (const { name, counts } of results) {
  console.log(`${name}: ${counts.rules} rules, ${counts.skills} skills, ${counts.agents} agents, ${counts.commands} commands`);
}
console.log(`Validation passed — ${results.length} plugin${results.length === 1 ? "" : "s"}.`);
