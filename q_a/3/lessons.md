Judge a planning framework by its downstream machinery (decomposition, context-carrying story files, validation gates), not by the quality of the documents it produces.
Scale process to change size: full pipeline for 3+-story work, direct implementation for fixes — a PRD for a one-file change is negative value.
When an LLM-driven workflow is unreliable, look for state that exists only as prose; making state machine-readable (frontmatter) usually fixes the reliability and the token cost at once.
Deterministic projections of files onto external systems (issues, labels, project boards) are a script's job; spend LLM tokens only on the content inside them, never on the state mutations.
Make every external-state mutation idempotent and verified by a read-back, and report failures with the raw error instead of skipping — silent partial syncs are worse than loud failures.
A negative result from a discovery step must enumerate what was found and why each candidate was rejected; a bare "nothing found" hides discovery bugs.
Design interactive tools around exactly one approval gate; every added mode or submenu is a future reason the tool stops being used.
Identity by hidden stable marker beats identity by title matching for any upsert against an external system.
Prefer machine-global configuration (global gitignore) over per-repo automation when the failure mode is forgetting the per-repo step.
Semi-automate destructive cleanup: dry-run by default, mutate only after explicit confirmation, never touch history.
Treat vendor-reported efficiency multipliers as hypotheses; adopt on a real workload with before/after measurement before making a tool part of the default setup.
Index-based context tools pay off on exploration-heavy multi-day work in large repos and not on small repos or localized edits.
When usage limits bind, compare subscription-tier upgrades against per-use overage in monthly terms first — subscriptions usually dominate — and attack consumption (tooling overhead) in the same pass.
Run evidence-gathering tooling inside the repository where the evidence lives (per-repo plugin) instead of centralizing it in one repo and reaching across.
Split engine from identity (personal config vs generic skills) from day one; it makes open-sourcing a config deletion instead of a rewrite.
Gate open-source release decisions on dogfooded artifacts the tool actually produced, not on the idea's appeal.
