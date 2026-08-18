---
name: fulfil-reports
description: Run Fulfil's built-in reports — inventory, sales, aging, and other standard summaries. Use when the user asks for a named Fulfil report or a standard operational or financial summary.
---

# Fulfil reports

Built-in reports are maintained by Fulfil and already encode the correct joins
and the correct definitions of things like revenue, on-hand, and past due.
Prefer one over assembling the same answer from record queries.

## Workflow

`list_reports` → `get_report_schema(report_name)` → `execute_report(...)` →
`get_report_page(...)` for further pages.

Read the schema before running. Report filters are their own thing — use exactly
the keys the schema names, not record-query filter syntax.

## Reporting results

- Always state the filters you ran — date range, warehouse, company. A figure
  without its period is a wrong answer.
- If you read only the first page, say so rather than presenting a partial total.
- No report fits? Move to the data warehouse, not to a hand-rolled loop over
  records.
