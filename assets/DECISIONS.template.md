# DECISIONS — [Project Name]

> This document records every meaningful methodological, technical, and process decision made in this project.
> After reaching a decision with Claude Code or a collaborator, sink the conclusion here within 24 hours.
> Goal: preserve "why we did this" knowledge across devices, years, and tool changes.
>
> **Maintainer**: [name]
> **Started**: YYYY-MM-DD
> **Last updated**: YYYY-MM-DD

---

## 1. Project metadata

| Field | Value |
|---|---|
| Project name | |
| Primary goal | |
| Key deliverables | (papers / reports / code / datasets) |
| Working directory | `/Users/.../...` |
| Main repository | |
| Funding / sponsor | (optional) |

---

## 2. Decision index

> Quick scan. Update this table whenever a decision's status changes.

| ID | Date | Topic | Domain | Status |
|---|---|---|---|---|
| D-001 | YYYY-MM-DD | _(example)_ Choice of primary analysis framework | tooling | ✅ Accepted |
| D-002 | YYYY-MM-DD | _(example)_ Dependency management strategy | engineering | ✅ Accepted |
| D-003 | | | | |

**Status legend**

- ✅ Accepted — applied to analysis / code / writing
- 🟡 Proposed — under evaluation, awaiting evidence
- ⏸ Deferred — out of scope this phase
- 🔁 Revised — superseded in D-XXX
- ❌ Superseded — replaced by D-XXX (see section 4)

---

## 3. Decision records

> Reverse-chronological order. Newest at top.
> Once a decision is marked ✅ Accepted, the body is immutable. Changes go in a new D-XXX entry referencing the original.

---

### D-001 _[example]_ Primary analysis framework: tool A over tool B

- **Date**: YYYY-MM-DD
- **Status**: ✅ Accepted
- **Domain**: tooling
- **Phase**: project initialization

**Background**

(One paragraph: what problem the decision addresses, why it must be decided now, what constraints apply.)

**Options considered**

1. Tool A — characterization
2. Tool B — characterization
3. Tool C — characterization

**Decision**

(One sentence stating the conclusion. Include concrete parameters/values where relevant.)

**Rationale**

1. Reason
2. Reason
3. Reason

**Consequences**

- ✓ Benefit
- ✓ Benefit
- ✗ Cost / constraint
- ✗ Cost / constraint

**References**

- Literature/docs:
- Code:
- Data:
- CC session: YYYY-MM-DD `<keywords>`
- Related decisions: D-XXX

---

### D-002 _[copy this template for new entries]_

- **Date**:
- **Status**:
- **Domain**:
- **Phase**:

**Background**



**Options considered**

1.
2.

**Decision**



**Rationale**

1.
2.

**Consequences**

- ✓
- ✗

**References**

- Literature/docs:
- Code:
- Data:
- CC session:
- Related decisions:

---

## 4. Superseded decisions

> Preserved for traceability. Do not delete; mark with ❌ and note the replacing D-XXX.

(none yet)

---

## 5. Open questions

> Things that need a decision soon but aren't ripe. Once decided, move into section 3.

- [ ]
- [ ]

---

## 6. Maintenance protocol

1. **Timeliness** — record decisions within 24 hours; memory drifts fast.
2. **Immutability** — accepted decisions are not edited. New direction = new D-XXX referencing the prior.
3. **Granularity** — one decision per entry. Split entangled topics.
4. **CC session references** — record date + keywords only. Do NOT paste raw conversation transcripts.
5. **Cross-project links** — use `[project-name]/D-XXX` if depending on another project's decision.
6. **Version control** — commit after each new entry: `decisions: D-XXX <title>`.

---

*Format inspired by Architecture Decision Records (ADR) but adapted for general research / engineering project use. See [adr.github.io](https://adr.github.io) for the original ADR concept.*
