---
name: deploy-micro-app
description: Deploy the local Fulfil Micro App files as a new draft version.
---

# Deploy Micro App

1. Identify the app directory under `micro-apps/`. If several exist, ask which.
2. Check the source against the constraints in the `fulfil://guide/micro-apps`
   resource — file counts, sizes, entry point, and the no-imports rule. Fix
   violations first: files that upload cleanly can still fail in the browser.
3. Deploy the file contents read from disk.
4. Report the version number created and state plainly that it is a draft and not
   yet live.

Publish with `/publish-micro-app` once the user has reviewed it.
