# Fulfil agent plugins

Plugins that connect coding agents to [Fulfil](https://www.fulfil.io), the ERP
for modern commerce.

| Plugin | What it does |
|:--|:--|
| [`fulfil`](plugins/fulfil/) | Connect to your Fulfil workspace — query records, read live API docs, run reports, query the data warehouse, and build Micro Apps |

## Install

**From the Cursor marketplace** — search for **Fulfil** in
**Cursor Settings → Plugins**, or run `/add-plugin fulfil` in chat.

**From this repository** — add it as a marketplace in
**Cursor Settings → Plugins**, then install the plugins you want.

Each plugin's own README covers its setup and configuration.

## Repository layout

```
.cursor-plugin/marketplace.json   # lists the plugins in this repo
plugins/<name>/
├── .cursor-plugin/plugin.json    # plugin manifest
├── mcp.json                      # MCP servers
├── rules/*.mdc                   # rules
├── skills/<skill>/SKILL.md       # skills
├── commands/*.md                 # slash commands
├── assets/logo.svg
└── README.md  CHANGELOG.md  LICENSE
scripts/validate.mjs
```

## Adding a plugin

1. Create `plugins/<name>/` with a `.cursor-plugin/plugin.json` manifest, a
   README, a CHANGELOG, a LICENSE, and a logo.
2. Add the components it needs — `rules/`, `skills/`, `commands/`, `agents/`,
   `hooks/`, `mcp.json` — and declare each one in the manifest.
3. Register it in `.cursor-plugin/marketplace.json`.
4. Run the validator.

## Validate

```bash
node scripts/validate.mjs
```

Checks every manifest against the marketplace schema, verifies declared
component paths exist, requires frontmatter on rules, skills, agents and
commands, and cross-checks that MCP variables are both declared and used.

## License

MIT
