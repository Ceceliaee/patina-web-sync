# Product Principles and Scope

## Purpose

Patina Web Sync is the browser extension companion for Patina. Its job is narrow: observe the current active webpage in the browser and send the minimum useful metadata to the Patina desktop app running on the same computer.

This repository exists so the browser extension can have its own source, validation, review, and release cadence without making the Patina desktop app release depend on browser store workflows.

## Product Boundary

Patina Web Sync is in scope for:

- Chromium-family browser extension source, packaging, and release assets.
- Firefox-family browser extension source, packaging, AMO signing, and release assets.
- Extension options and popup UI needed to configure local Patina connection settings.
- Local-only delivery of active-tab metadata to Patina through `127.0.0.1` or `localhost`.
- Browser-store privacy documentation and listing material for the extension.

Patina Web Sync is not in scope for:

- Patina desktop app runtime behavior.
- Patina local HTTP receiving endpoint implementation.
- Patina SQLite storage, backup, restore, cleanup, History, Data, Settings, or Classification read models.
- Cloud sync, account identity, team workspaces, remote ingestion, analytics, or SaaS features.
- Reading page body content, form values, passwords, screenshots, clipboard contents, cookies, download history, or browser history databases.

## Product Principles

- Stay local-first. The extension talks to the user-owned Patina app on the same machine, not to a remote service.
- Send only necessary active-tab metadata. More data is a privacy cost unless there is a clear Patina user benefit.
- Keep Patina in control of recording. If Patina disables Web Sync or rejects a token, the extension should surface that state instead of inventing its own recording rules.
- Keep browser targets aligned when possible. Chromium and Firefox behavior should diverge only where browser APIs or store requirements force it.
- Respect browser review cadence. Firefox AMO review and browser store updates may lag behind Patina desktop releases, so Patina must remain compatible with recently released extension clients.

## Decision Rules

When a change affects only extension packaging, browser UI, or browser API handling, this repository owns the decision.

When a change affects persisted web activity semantics, endpoint behavior, token rules, backup compatibility, or History / Classification display, the Patina repository owns the decision and the protocol document must be updated before the extension relies on the change.

When a change would require a remote service, account system, or analytics pipeline, treat it as out of scope unless Patina's product direction is explicitly changed first.
