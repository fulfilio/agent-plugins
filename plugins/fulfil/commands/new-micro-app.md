---
name: new-micro-app
description: Scaffold a new Fulfil Micro App locally and register it in the workspace.
---

# New Micro App

1. Establish what the app does and who uses it, if the request does not say.
2. Read the `fulfil://guide/micro-apps` resource and
   `get_model_jsonrpc_api_docs(model_name="micro_app")` before writing anything.
3. Register the app. If the name is rejected, use the server's message — do not
   guess at the naming rules.
4. Create the source under `micro-apps/<name>/` locally: a working shell with
   loading, empty, and error states, following the design system in the guide.
5. Do **not** deploy. Show the user the files and confirm the data model first,
   then `/deploy-micro-app`.

Report the app record and the URL it will be served at.
