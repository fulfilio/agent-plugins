---
name: fulfil-data-warehouse
description: Query the Fulfil data warehouse for aggregates, trends, cohorts, and leaderboards across sales, inventory, and fulfilment. Use when the user asks for totals, time series, or group-bys over more data than a record query should page through.
---

# Fulfil data warehouse

A read-only analytical mirror of the ERP, queried with SQL. Fast over large
history, isolated from operational load, and behind the ERP by a sync lag — for
current state or a single record, use the record API instead.

## Always in this order

`discover_tables` → `get_table_schema(table_name)` → `query_data_warehouse`.

Tables and columns differ per workspace and per plan. Discovery is free; a
guessed name costs a failed query and still bills scanned bytes.

## Cost is shared

Queries bill against a cumulative **daily budget for the whole workspace**.
Exhausting it blocks analytics for every user in it until reset. So:

- Select named columns, never `*` on a wide table.
- Filter on the table's date column on anything historical.
- Prototype on a narrow range, widen once the SQL is right.
- Never paginate with `OFFSET` — it re-scans the table per page and is rejected.
  Use keyset pagination.
- Do not loop a query with shifting parameters where one `GROUP BY` answers it.

On a budget or permission error, report the server's message to the user. Do not
retry and do not silently fall back to approximating the answer from the record
API.

## Reporting

State the date range, filters, and row limit with the numbers, and say when a
result hit the limit. A truncated result presented as a total is a wrong answer.
