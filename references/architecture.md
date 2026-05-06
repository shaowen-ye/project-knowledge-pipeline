# Architecture Reference: How Claude Code Stores Sessions

This file provides the technical mechanism behind the project-knowledge-pipeline skill. Read it when the user asks "why does this work", needs to debug a stale or broken symlink, or wants to understand failure modes.

## Storage layout

Claude Code (CC) stores everything under `~/.claude/`:

```
~/.claude/
├── .claude.json            global config + project mapping index
├── settings.json           user-level settings (cleanupPeriodDays, etc.)
├── projects/
│   ├── <encoded-A>/
│   │   ├── <session-uuid-1>.jsonl
│   │   ├── <session-uuid-2>.jsonl
│   │   └── ...
│   └── <encoded-B>/
│       └── ...
├── history.jsonl           cross-project slash-command history
├── shell-snapshots/        shell state captures
└── plugins/, skills/, etc.
```

Each session is one `.jsonl` file: an append-only event log of messages, tool calls, and tool results. Filenames are session UUIDs. CC's `--resume` command lists these by modification time.

## The path-encoding rule

`<encoded>` is **not a cryptographic hash** — it is a deterministic, reversible character substitution:

```
encoded = absolute_path.replace('/', '-').replace('.', '-')
```

Examples:

| Project path | Encoded directory name |
|---|---|
| `/Users/alice/Projects/data-pipeline` | `-Users-alice-Projects-data-pipeline` |
| `/home/bob/code/api.v2` | `-home-bob-code-api-v2` |
| `/Users/x/Documents/Research/foo` | `-Users-x-Documents-Research-foo` |

This is reversible (mostly — collisions can occur if two real paths differ only in `/` vs `.`, but that is exceedingly rare in practice).

In bash:

```bash
encoded="$(echo "$PWD" | sed 's|[/.]|-|g')"
```

## Why each pipeline layer exists

### Layer 1: DECISIONS.md — solves the longest-horizon problem

CC's session JSONL files are not designed as a knowledge artifact:
- They are noisy: full chain-of-thought, tool calls, file dumps
- They are tied to a specific tool (CC) and a specific format
- They are auto-cleaned after `cleanupPeriodDays` (default 30)
- They cannot be skimmed by a human in a reasonable time

A handwritten `DECISIONS.md` is the only thing that survives:
- CC version changes (storage format may shift)
- Tool migrations (switching from CC to another agent)
- Year-scale archival (long after the original session expired)
- Cross-team handoffs (others read `DECISIONS.md`; they cannot reasonably read raw transcripts)

**This layer's value is invariant to CC's design choices.** It would be valuable even if CC did not exist.

### Layer 2: System hardening — solves operational failures

Two failure modes the user does not typically anticipate:

**Auto-cleanup**: `cleanupPeriodDays = 30` by default. A long-running project that goes dormant for 31 days loses its history. Setting this to 90 or 180 in `~/.claude/settings.json` shifts the safety margin.

**Disk failure / accidental deletion**: `~/.claude/projects/` is on the same disk as everything else. A periodic rsync to a second location (external drive, NAS, cloud-backed folder) is cheap insurance.

```bash
# Suggested cron entry: weekly backup
0 3 * * 0 rsync -a --delete "$HOME/.claude/projects/" "$HOME/Backups/claude-sessions/"
```

### Layer 3: Project binding — solves the path-coupling problem

The path-encoding rule means CC's notion of "this project" is the absolute path, not the directory contents. Consequences:

- `mv /Users/alice/Project /Users/alice/Archive/Project` orphans all sessions
- Migrating a project across machines (different home directory paths, different usernames) loses session continuity
- A symlinked directory accessed via different paths may have multiple disconnected session trees

The binding scheme inverts the storage:

```
Before binding:
  ~/.claude/projects/-Users-alice-Project/
    ├── session-001.jsonl
    └── session-002.jsonl

After binding:
  ~/.claude/projects/-Users-alice-Project    →    /Users/alice/Project/.claude-sessions
  /Users/alice/Project/.claude-sessions/
    ├── session-001.jsonl
    └── session-002.jsonl
```

CC's read/write behavior is unchanged — it follows the symlink transparently. But now the data is *in* the project. Move the project, and the data moves with it.

After moving, the symlink at the old location is stale (broken) but harmless. Run `claude-bind rebind` from the new location to install a fresh symlink at the new encoded path.

## Failure modes and recovery

### Stale symlink after move (without rebind)

Symptom: `claude --continue` from the moved project starts fresh; no history.

Diagnosis:
```bash
claude-bind status
# Status: UNINITIALIZED (no session history yet)
ls -la ~/.claude/projects/<old-encoded>
# lrwxr-xr-x ... <old-encoded> -> /Users/alice/OLD-PATH/.claude-sessions  (broken)
```

Recovery: `claude-bind rebind` from the new project location.

### Both a real directory and a symlink-target exist (conflict)

Symptom: `claude-bind` exits with error: *"Conflict: both global directory and ... exist. Resolve manually."*

This happens if the user worked on the project after deleting the symlink but before re-binding. CC re-created `~/.claude/projects/<encoded>/` as a real directory while `.claude-sessions/` still exists in the project.

Resolution:
```bash
cd <project>
# Inspect both
ls ~/.claude/projects/<encoded>/   # newer sessions here
ls ./.claude-sessions/              # older sessions here

# Manually merge — copy newer into older, then re-bind
rsync -a ~/.claude/projects/<encoded>/ ./.claude-sessions/
rm -rf ~/.claude/projects/<encoded>
claude-bind   # re-establishes symlink
```

### Symlink survived but pointee deleted (.claude-sessions removed)

Symptom: `claude-bind status` reports BOUND, but `--resume` is empty. `readlink` points to a non-existent path.

Recovery:
```bash
rm ~/.claude/projects/<encoded>
mkdir -p ./.claude-sessions
claude-bind
```

History is unrecoverable unless backed up (Layer 2).

### CC version updates the encoding rule

If a future CC version changes how `<encoded>` is computed:

Symptom: After upgrade, `claude-bind status` reports DEFAULT or UNINITIALIZED for projects that were bound; `--resume` shows no history.

Recovery:
1. Identify the new encoding scheme (check CC release notes or inspect `~/.claude/projects/`).
2. Update the `sed` rule in `claude-bind` accordingly.
3. Run `claude-bind rebind` on each affected project.

This is why this skill is non-official and requires occasional verification after CC upgrades. The pipeline's first two layers (DECISIONS.md, backups) are robust to such changes.

## Related Anthropic discussions

The community has requested project-local session storage as a native feature. Relevant GitHub issues:

- `anthropics/claude-code#1516` — Lost conversation history when moving directories
- `anthropics/claude-code#9306` — Project-local conversation history storage
- `anthropics/claude-code#12646` — Local session history and context persistence
- `anthropics/claude-code#22387` — Allow session storage in project directory

If/when Anthropic ships native support, Layer 3 of this pipeline can be retired. Layers 1 and 2 retain value indefinitely.
