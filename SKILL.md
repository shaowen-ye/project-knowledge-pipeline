---
name: project-knowledge-pipeline
description: Set up and maintain a durable knowledge sinking pipeline for Claude Code projects, centered on a human-readable DECISIONS.md log and an optional symlink-based session-binding scheme that makes Claude Code session history follow the project across moves, archival, and cross-machine migrations. Use this skill whenever the user (1) asks about Claude Code session management, project portability, archival, or cross-machine workflows; (2) mentions DECISIONS.md, decision records, ADRs, claude-bind, ".claude-sessions", or "how do I keep this knowledge"; (3) is initializing a new long-term project that will accumulate substantive technical or methodological discussion; or (4) has just completed a substantive technical conversation that reached a clear decision point worth recording. Trigger PROACTIVELY at decision moments even when the user did not explicitly ask to record — most users forget to record decisions in real time and appreciate the prompt.
---

# Project Knowledge Pipeline

Helps maintain durable project knowledge across Claude Code sessions, machines, and years. Three layers in order of importance:

1. **Decision recording** — `DECISIONS.md` at the project root captures every meaningful decision in human-readable form. Survives any tool change.
2. **System hardening** — extend session retention; back up `~/.claude/projects/` regularly.
3. **Project binding (opt-in)** — symlink `~/.claude/projects/<encoded>` to `<project>/.claude-sessions/` so session data follows the project on the filesystem.

**Order matters.** Layer 1 is universal and most important. Layer 2 is operational hygiene. Layer 3 is opt-in for long-term technical projects only — it is **not suitable** for projects that contain sensitive personal, medical, financial, or family content (those should remain in the global `~/.claude/projects/` to avoid accidentally syncing to git or cloud).

---

## When to act

### Proactive: detect decision moments

After a substantive technical or methodological discussion, watch for these signals:

- The user has chosen between alternatives: *"let's go with X"*, *"I'll use approach A"*, *"yes, that's the right call"*
- A parameter or configuration is settled: *"set k=10"*, *"use the Tweedie family"*, *"32 GB should be enough"*
- An architectural or sequencing decision is clarified: *"do X first, then Y"*, *"factor it into module Z"*
- Agreement is reached on a non-trivial point after weighing tradeoffs

When detected, check whether `DECISIONS.md` exists in the project root.

If yes — offer once:
> *"This sounds like a decision worth recording. Want me to add a `D-XXX` entry to DECISIONS.md?"*

If no — offer to set up the pipeline:
> *"This was a meaningful decision. We don't have a `DECISIONS.md` in this project yet — want me to set one up so we can log this and future decisions?"*

Do not push more than once per decision. Do not interrupt active problem-solving — wait until a clear pause.

### Reactive: setup or maintenance requests

Trigger immediately on phrases like:

- "set up DECISIONS.md" / "start a decision log"
- "make this project portable" / "I want to move this project"
- "how do I keep my Claude Code sessions" / "won't I lose context if I move this"
- "claude-bind" / ".claude-sessions"
- "archive this project" / "set up cross-machine workflow"

---

## Workflows

### W1. Initialize the pipeline for a new project

1. Verify project root (look for `.git`, `package.json`, `pyproject.toml`, or ask user).
2. Check whether `DECISIONS.md` exists. If absent, copy `assets/DECISIONS.template.md` to project root.
3. Walk through the project metadata table at the top with the user — fill in name, goal, paths, repo URL.
4. If no `CLAUDE.md` exists at project root, suggest creating one (a 50–200 line briefing doc improves Claude Code's context recall significantly).
5. **Ask whether to enable session binding (Layer 3).** Apply the privacy filter (see W5). Default to NOT binding when in doubt.
6. If binding is approved:
   - Install `assets/claude-bind` to `~/.local/bin/claude-bind` (and `chmod +x`)
   - Verify `~/.local/bin` is on `PATH`
   - Run `claude-bind` from the project root
   - Add `.claude-sessions/` to project's `.gitignore` (this is non-negotiable — see W5)

### W2. Record a decision

Use this exact format. Append the new entry just below the section-three header in `DECISIONS.md` (newest at top).

```markdown
### D-<NNN> <Concise title with verb-object structure>

- **Date**: YYYY-MM-DD
- **Status**: ✅ Accepted | 🟡 Proposed | ⏸ Deferred | 🔁 Revised | ❌ Superseded
- **Domain**: <methodology | code architecture | tooling | process | data>
- **Phase**: <project phase or sprint label>

**Background**

<one paragraph: what problem, what triggered the decision now, what constraints>

**Options considered**

1. <option A — one-line characterization>
2. <option B — one-line characterization>
3. <option C — one-line characterization>

**Decision**

<one sentence; include concrete parameters/values>

**Rationale**

1. <reason>
2. <reason>
3. <reason>

**Consequences**

- ✓ <benefit>
- ✓ <benefit>
- ✗ <cost or constraint>
- ✗ <cost or constraint>

**References**

- Literature/docs: <author-year + URL or DOI>
- Code: <path>
- Data: <path>
- CC session: YYYY-MM-DD `<keywords>`
- Related decisions: D-XXX, D-YYY
```

After writing the entry:
1. Update the index table in section two of `DECISIONS.md` with a new row
2. Suggest `git add DECISIONS.md && git commit -m "decisions: D-XXX <title>"`

**Hard rules**

- Once a decision is marked ✅ Accepted, the body is **immutable**. Changes go in a NEW D-YYY entry that references and supersedes the prior one.
- One decision per entry. If two issues are entangled, write two entries with cross-references via "Related decisions".
- Always include both ✓ benefits and ✗ costs in Consequences. A decision with no listed costs has not been thought through.

### W3. Move or rename a project

If the project is bound:
1. Run `claude-bind status` from the current location to confirm.
2. Move the directory using normal tools (`mv`, `git mv`). The symlink at `~/.claude/projects/<old-encoded>` becomes stale but data is safe inside `.claude-sessions/`.
3. From the new location, run `claude-bind rebind`. It cleans up stale symlinks and creates the new one based on the new path's encoding.

If the project is not bound:
- Old conversations stay tied to the old absolute path and become orphaned in `~/.claude/projects/<old-encoded>`.
- Recover by manually renaming: `mv ~/.claude/projects/<old-encoded> ~/.claude/projects/<new-encoded>` (encoding is the path with `/` and `.` replaced by `-`).

### W4. Cross-machine migration

Source machine:
```bash
cd <parent-of-project>
tar czf project.tgz <project>/   # includes .claude-sessions/ if bound
```

Transfer via scp / rsync / external drive.

Target machine:
```bash
cd <destination>
tar xzf project.tgz
cd <project>
claude-bind rebind   # only if bound
```

Then `claude --resume` on the target machine shows source-machine sessions.

**Do NOT** sync `~/.claude/` itself to iCloud / Dropbox / OneDrive — that directory contains cross-project global state and locks, which corrupt under cloud-sync conflicts. Make the project portable, not the global config.

### W5. Privacy filter and pre-share checks

Before recommending or executing `claude-bind`, ask the user:

| Question | If yes |
|---|---|
| Does this project involve medical, personal, family, or financial discussions? | **Do not bind.** Sessions stay in global `~/.claude/projects/`. |
| Will this project be pushed to GitHub or any public/shared remote? | Bind only if `.gitignore` includes `.claude-sessions/`. Verify before binding. |
| Will project contents be shared with collaborators? | Warn that session content includes Claude's full chain-of-thought, pasted file contents, and command outputs. When in doubt, do not bind. |
| Is this a backup of an already-bound project going to an unencrypted external drive? | Warn the user to encrypt or unbind before moving. |

**Before any external sharing of a bound project**, prompt:
> *"This project is bound — `.claude-sessions/` contains conversation history. Want me to run `claude-bind unbind` and remove it before you share?"*

---

## Reference files

- `references/architecture.md` — Deep explanation of how Claude Code stores sessions, the path-encoding rule, why each pipeline layer exists, and known failure modes. Read this when the user asks "why does this work" / "what happens if X breaks" / wants to debug a stale or broken symlink.

## Assets

- `assets/DECISIONS.template.md` — The drop-in template. Copy to project root and customize the metadata table.
- `assets/claude-bind` — The bind/rebind/unbind script. Install to `~/.local/bin/` and `chmod +x`.

---

## What this skill does NOT do

- Encrypt session content. Claude Code stores everything in plaintext; this skill only manages location.
- Manage low-level code architecture decisions in any specialized way (use `arch-record` or similar tools if needed, or roll architecture entries into DECISIONS as your team prefers).
- Replace Anthropic's possible future native "project-local storage" feature. When that ships, Layer 3 of this pipeline can be retired; Layers 1 and 2 retain value indefinitely.
