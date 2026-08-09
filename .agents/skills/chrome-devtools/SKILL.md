---
name: chrome-devtools
description: Browser debugging through Chrome DevTools via MCPorter. Use when asked to inspect a local web page, take a screenshot, inspect network requests, or run a Lighthouse audit.
---

# Chrome DevTools

Use this skill to debug a local web app through MCPorter and Chrome DevTools.

## Workflow

1. Check whether MCPorter is already running:

```bash
mcporter daemon status
```

2. If it is not running, start it:

```bash
mcporter daemon start
```

3. Use the Chrome DevTools tool format:

```bash
mcporter call chrome-devtools.<tool> [key:"value" ...]
```

## Common Commands

- `mcporter call chrome-devtools.navigate_page url:"<url>"`
- `mcporter call chrome-devtools.take_snapshot`
- `mcporter call chrome-devtools.take_screenshot filePath:"dashboard.png"`
- `mcporter call chrome-devtools.list_network_requests`
- `mcporter call chrome-devtools.lighthouse_audit`

## Use When

- Inspecting a local page
- Capturing a screenshot
- Inspecting network activity
- Running a Lighthouse audit
