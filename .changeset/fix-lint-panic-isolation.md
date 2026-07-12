---
---

fix(lint): make the `rsvelte-lint` per-file panic isolation effective under distribution builds

`rsvelte-lint`'s CLI wraps each file in `catch_unwind` so that a compiler panic
on one pathological file is turned into a single `lint-internal-error`
diagnostic instead of aborting the whole run. That guarantee was silently void
in the shipped binary: the shared `[profile.release]` (and the `dist` profile
that inherits it) set `panic = "abort"`, which makes a panic call `abort()`
immediately — `catch_unwind` never gets to run, so the process dies with
`SIGABRT` (exit 134) and every file's output is lost. `cargo test` always
unwinds, so unit tests could not catch the regression.

Add a dedicated `dist-lint` cargo profile (`inherits = "dist"` + `panic =
"unwind"`) and build the CLI with `--profile dist-lint`, so the per-file
isolation actually holds while keeping dist's optimization and symbol stripping.
The corpus-compat lint job — which runs the CLI over ~12k files, exactly the
scenario the isolation protects — now builds with this profile. The misleading
"must not abort the whole run" comments now state the profile requirement.

No published-package code changes (`rsvelte_lint` is `publish = false`).
