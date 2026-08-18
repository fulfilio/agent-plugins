---
name: micro-app-builder
description: Build, deploy, publish, and roll back Fulfil Micro Apps — single-page apps served from a Fulfil workspace. Use when the user wants an internal tool, dashboard, or custom screen inside Fulfil, or mentions a micro app.
---

# Fulfil Micro App builder

Micro Apps are single-page apps served from the user's Fulfil workspace, sharing
their session — no auth code, no CORS, no separate hosting.

## Read the guide first

The fulfil MCP server publishes the current development guide as the
`fulfil://guide/micro-apps` resource: runtime libraries and globals, the
`window.__FULFIL__` data API, size limits, and the Fulfil design system. Read it
before writing any app code — it is maintained with the platform and this skill
is not.

For the lifecycle methods and their exact parameters, read
`get_model_jsonrpc_api_docs(model_name="micro_app")`.

## Work locally, deploy explicitly

Write files in the repo (`micro-apps/<app-name>/`), not in chat. Deploy uploads
what is on disk. This keeps apps in git with real diffs and history, and makes
rollback a code operation as well as a platform one.

## Lifecycle

Create → deploy (produces a draft version) → publish (makes a version live) →
rollback (returns live to an earlier version).

Deploy and publish are separate on purpose: you can build and test without
disturbing what users see. So:

- Always report the version number, and whether it is live or still a draft.
- A deploy that was never published is not a shipped change. Never report one
  as if it were.
- Publishing changes what everyone in that workspace sees — confirm before doing
  it, and name the version it replaces so a rollback target is on the record.
- Confirm the live version by reading the app back after a publish or rollback
  rather than assuming the call took effect.

Apps can be retired reversibly before deletion. Prefer that to leaving something
live and unowned.

## Before publishing

- Loading, empty, and error states are implemented — every data call renders its
  failure rather than showing an empty view.
- No hardcoded record, company, or warehouse ids.
- Source committed to the repo, then deployed — in that order.
