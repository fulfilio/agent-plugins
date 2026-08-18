---
name: fulfil-model-api
description: Query and update Fulfil ERP records, or write client code against the Fulfil API. Use when the user asks about their orders, inventory, shipments, invoices, customers, or products, or wants to build an integration against Fulfil.
---

# Fulfil model API

Every business object in Fulfil is a model with a uniform API, reachable through
the `rpc` tool on the fulfil MCP server.

## Learn the API at runtime, not from memory

| Tool | Ask it for |
|:--|:--|
| `list_models` | Which models this user can reach |
| `get_model_schema` | Fields, types, relations |
| `get_model_jsonrpc_api_docs` | Methods and their parameter schemas — read before every `rpc` call |
| `get_model_rest_api_docs` | Verbs, paths, and payloads when writing HTTP client code |

These return the current truth for this workspace and this user. Do not
substitute remembered method names, parameter shapes, or filter syntax for what
they return — copy the shapes out of the docs tool.

Model names are underscore form (`sales_order`). Absent from `list_models` means
not reachable — say so rather than improvising a route.

## Choosing the right tool

- One known record → `search`, then `fetch`.
- A filtered set of records → `rpc(..., "find", ...)`, paging to the end if the
  user asked for everything.
- Totals, trends, group-bys, anything spanning large history → the data warehouse
  (see the `fulfil-data-warehouse` skill). Do not sum thousands of records by
  paging them.
- A standard operational or financial summary → check `list_reports` first; a
  built-in report already encodes the right joins and definitions.

## Client code

For integrations outside the editor, `pip install fulfil_client` and build the
payloads from `get_model_rest_api_docs` rather than from field names you recall.

## Failures

Fulfil returns business-rule errors for wrong state, missing stock, closed
periods, and permissions. That message is the answer — surface it. Never swallow
it, never retry around it, and never report an operation as successful because
the call returned.
