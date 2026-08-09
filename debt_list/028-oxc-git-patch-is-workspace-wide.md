# P2 — every OXC dependency is overridden to a development Git revision

Category: supply chain / reproducibility / maintenance

Evidence: root `[patch.crates-io]` redirects 14 `oxc_*` crates to one GitHub revision and labels the workaround “SPIKE” (`Cargo.toml:137-154`). It applies to every workspace member and normal build.

Impact: clean/offline builds depend on a Git checkout beyond registry artifacts; one revision update changes the compiler, formatter, semantic, and codegen types simultaneously and complicates publishing consumers that cannot inherit the patch.

Remediation: converge on a released OXC version with unified dependency constraints, or isolate the patch to a clearly temporary development workflow with an owner and removal condition.

Acceptance: registry-only and offline builds resolve one released version of each OXC crate and pass the full suite without the root patch.
