# Codex Markdown File Placement Guide

Use this as the map for where each file belongs and what it is best used for.

## Recommended layout

### Global Codex instructions

Use this for your personal defaults that should apply across most projects.

```text
~/.codex/AGENTS.md
```

Good for:

- clean code preferences
- design pattern preferences
- planning/checklist discipline
- “do not touch unrelated files” rules
- verification expectations

Do **not** put project-specific architecture here unless all your projects use it.

### Project-level Codex instructions

Use this for repo-specific architecture and workflow rules.

```text
<repo-root>/AGENTS.md
```

Good for:

- project architecture
- folder structure
- feature workflow
- testing/lint/build commands
- project-specific “do not touch” rules

### Optional docs folder

Use this when you want files to be readable by humans and linkable from `AGENTS.md`.

```text
<repo-root>/docs/codex/domain-presenter-adapter-view.md
<repo-root>/docs/codex/design-patterns.md
<repo-root>/docs/codex/clean-code.md
<repo-root>/docs/codex/new-feature-flow.md
```

Then reference them from the project `AGENTS.md`.

## Suggested setup

For most projects, use:

```text
~/.codex/AGENTS.md
<repo-root>/AGENTS.md
<repo-root>/docs/codex/domain-presenter-adapter-view.md
<repo-root>/docs/codex/design-patterns.md
<repo-root>/docs/codex/clean-code.md
<repo-root>/docs/codex/new-feature-flow.md
```

## What each provided file is best used as

| File | Best location | Best used as |
|---|---|---|
| `global-AGENTS.md` | `~/.codex/AGENTS.md` | Personal default rules for Codex |
| `project-AGENTS.md` | `<repo-root>/AGENTS.md` | Repo-level instructions that point Codex to your docs |
| `domain-presenter-adapter-view.md` | `<repo-root>/docs/codex/` | Architecture reference |
| `design-patterns.md` | `~/.codex/references/` or `<repo-root>/docs/codex/` | Reusable design-pattern reference |
| `clean-code.md` | `~/.codex/references/` or `<repo-root>/docs/codex/` | Clean-code rules Codex should follow |
| `new-feature-flow.md` | `<repo-root>/docs/codex/` | Feature planning and implementation workflow |

## Codex notes

Codex reads `AGENTS.md` files automatically. A global file can live at `~/.codex/AGENTS.md`, and project files can live at the repo root or deeper directories. More specific project instructions override broader ones.

Skills are better when you want an explicitly reusable workflow that Codex can invoke on demand. For these files, start with `AGENTS.md` + docs first. Convert repeated workflows into skills later.
