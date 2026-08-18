# Fulfil

Cursor plugin for [Fulfil](https://www.fulfil.io), the ERP for modern commerce.
Connects Cursor to your workspace through Fulfil's remote
[MCP](https://modelcontextprotocol.io/) server.

Ask about orders, inventory, shipments and invoices in plain language. Read live
API docs while writing an integration. Run reports, query the data warehouse, and
build Micro Apps — all under the signed-in user's own Fulfil permissions.

## Install

1. Open **Cursor Settings → Plugins**.
2. Search for **Fulfil**, click **Install**.
3. Enter your MCP server URL: `https://<workspace-id>.fulfil.io/mcp/v1/http`,
   using your Fulfil workspace ID.
4. Complete the Fulfil sign-in prompt.

Or run `/add-plugin fulfil` in chat.

## MCP

```json
{
  "mcpServers": {
    "fulfil": {
      "type": "http",
      "url": "${FULFIL_MCP_URL}"
    }
  }
}
```

No client ID or secret to create. Fulfil supports OAuth 2.0 Dynamic Client
Registration, so Cursor registers itself and runs the authorization-code flow
with PKCE on first connect.

## Tools

| Tool | Purpose |
|:--|:--|
| `list_models` | Models this user can reach |
| `get_model_schema` | Fields, types, relations |
| `get_model_jsonrpc_api_docs` | Methods and parameter schemas |
| `get_model_rest_api_docs` | Verbs, paths, payloads for client code |
| `rpc` | Call a model method — reads, writes, and domain actions |
| `search` / `fetch` | Natural-language record lookup, then full record read |
| `list_reports` / `get_report_schema` | Discover built-in reports and their filters |
| `execute_report` / `get_report_page` | Run a report, page through results |
| `discover_tables` / `get_table_schema` | Data warehouse tables and columns |
| `query_data_warehouse` | Read-only SQL against the warehouse |
| `search_fulfil_docs` | Search Fulfil's product documentation |

The plugin does not hardcode tool schemas — Cursor reads them from the server on
connect, so they stay current as the platform changes.

## Skills

Loaded on demand; they cost nothing until a conversation needs them.

| Skill | Covers |
|:--|:--|
| `fulfil-model-api` | Reaching records and building integrations, docs-first |
| `fulfil-reports` | Discovering and running built-in reports |
| `fulfil-data-warehouse` | Discovery-first analytical querying and cost discipline |
| `micro-app-builder` | Micro App lifecycle, and where to read the current runtime guide |

## Commands

| Command | What it does |
|:--|:--|
| `/new-micro-app` | Scaffold a Micro App locally and register it in the workspace |
| `/deploy-micro-app` | Check the local source and upload it as a draft version |
| `/publish-micro-app` | Promote a draft to live |
| `/rollback-micro-app` | Return live to an earlier published version |

## Rules

| Rule | Scope |
|:--|:--|
| `fulfil-mcp` | Discover before calling; report results honestly |
| `fulfil-writes` | Confirmation and batching before anything that changes production data |
| `micro-app` | Applied to files under `micro-apps/` — no bundler, no imports, session-based data |
| `data-warehouse-cost` | Applied before analytical queries — named columns, bounded ranges, no `OFFSET` |

## Micro Apps

Micro Apps are single-page apps served from your workspace. This plugin keeps
their source in your repo — real diffs, reviews, and history — and deploys
through MCP. Deploying creates a draft; publishing makes it live; rollback
returns to an earlier version.

The runtime, data API, size limits, and design system are published by the server
itself as the `fulfil://guide/micro-apps` resource. The plugin points the agent
at it rather than copying it, so guidance cannot drift from the platform.

## Data warehouse

An analytical mirror of the ERP for aggregates and trends the record API should
not page through. Requires a Fulfil user with custom-report permissions. Queries
bill scanned bytes against a **daily budget shared by the whole workspace**, so
the bundled rule enforces named columns, bounded date ranges, and keyset
pagination.

## Permissions

Every call runs as the signed-in Fulfil user, under their own model access —
`list_models` shows only what they may reach. The `rpc` tool can write, so the
bundled write-safety rule requires the agent to show you the affected records and
get confirmation first.

## Links

- [Fulfil developer docs](https://developers.fulfil.io)
- [Fulfil Python client](https://pypi.org/project/fulfil_client/)

## License

MIT
