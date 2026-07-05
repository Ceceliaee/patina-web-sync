---
name: documentation-writer
description: Use this skill whenever editing Patina Web Sync documentation, README files, protocol docs, release policy, AGENTS.md, changelog entries, or docs/working and docs/archive plans. Keep extension docs clear, source-of-truth oriented, and appropriate for a small browser companion project.
---

# Patina Web Sync Documentation Writer

Use this skill for documentation work in the Patina Web Sync repository.

## Source Of Truth Order

Read the current repository instructions before editing docs:

1. `AGENTS.md`
2. `docs/product-principles-and-scope.md`
3. `docs/architecture.md`
4. `docs/versioning-and-release-policy.md`
5. `docs/web-activity-protocol.md`

Use these files as the active long-term source of truth. Do not use archived plans as the default execution basis.

## Document Types

Classify the document before writing:

- Reference: stable facts, contracts, commands, release rules, or repository layout.
- Explanation: product boundaries, architecture reasoning, privacy boundaries, and compatibility policy.
- How-to: a focused recipe for a release, migration, store submission, or debugging task.
- Tutorial: only for learning-oriented walkthroughs; avoid adding tutorials unless the user explicitly wants one.

Prefer reference and explanation for long-lived `docs/` files in this repository.

## Long-Term Docs Rules

Top-level `docs/` files must describe durable rules that remain useful across tasks. They should not read like one-off execution plans.

Use top-level `docs/` for:

- Product boundaries and non-goals.
- Architecture and ownership boundaries.
- Versioning, packaging, AMO signing, and release policy.
- The Patina local web activity protocol.
- Documentation hygiene or engineering quality policy if those rules become long-lived.

Keep README focused on project orientation and common commands. Put durable policy in `docs/` and link to it from README when useful.

## Working And Archive Rules

If a task needs a checklist or execution plan, put it under `docs/working/` while it is active.

When the task is finished:

1. Mark completed checklist items.
2. Add a short archive note at the top with completion date, status, and whether the file remains source of truth.
3. Move the file to `docs/archive/`.
4. Copy any durable rule changes into the relevant top-level `docs/` file.

Archived documents are historical context. They are not the default source of truth.

## Writing Style

Write in plain, direct language. Keep this extension repository small and concrete. Avoid importing Patina desktop-specific wording unless it applies to browser extension maintenance.

When documenting privacy or permissions, be exact about what the extension reads, sends, stores, and avoids.

When documenting release work, distinguish clearly between:

- Local unsigned package checks.
- GitHub Release assets.
- Firefox AMO signing.
- Patina desktop app releases.

## Validation

For documentation-only changes, run at least:

```bash
npm run check
```

For release-policy, workflow, or packaging documentation changes, also run:

```bash
npm run release:check
```

If validation cannot be run, record the reason in the final response.
