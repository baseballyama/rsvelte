//! Drift guard for the vendored svelte2tsx shim declarations.
//!
//! `crates/rsvelte_check/src/svelte_check/shims/` embeds copies of
//! `submodules/language-tools/packages/svelte2tsx/*.d.ts` because rsvelte
//! ships a standalone binary with no `svelte2tsx` in the consumer's
//! `node_modules`. A copy is only as good as its freshness: #1889 was a frozen
//! snapshot silently ageing past `svelte/elements`. This test makes a
//! language-tools bump — or an undeclared hand-edit of a vendored file —
//! surface as a failure instead.
//!
//! Deliberate local additions are declared in `LOCAL_ADDITIONS` and subtracted
//! before the comparison, so they are reviewable in one place instead of
//! invisible inside a 400-line `.d.ts`. Everything else must be byte-identical.
//!
//! Skipped when the submodule is not checked out, so the suite stays runnable
//! on a fresh clone. Under `CI` the submodule *is* checked out by the job that
//! runs this test (`.github/workflows/ci.yml`'s `test` shards init
//! `submodules/language-tools`), so a missing file there is a misconfigured
//! job, not an unavailable assertion.

use std::path::PathBuf;

/// Every vendored file, relative to its own root.
const VENDORED: &[&str] = &["svelte-shims-v4.d.ts", "svelte-jsx-v4.d.ts"];

/// Lines rsvelte adds on top of the upstream copy, per file. Each one needs a
/// reason to exist here rather than upstream.
///
/// * `svelte-jsx-v4.d.ts` — `'svelte:boundary'` (#1896). Upstream's
///   `IntrinsicElements` snapshot predates the element. It only matters on the
///   fallback branch of `select_global_types`, where no project
///   `svelte-html.d.ts` was found.
const LOCAL_ADDITIONS: &[(&str, &[&str])] = &[(
    "svelte-jsx-v4.d.ts",
    &["    'svelte:boundary': HTMLProps<'svelte:boundary', HTMLAttributes>;"],
)];

fn crate_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn upstream_root() -> PathBuf {
    crate_root()
        .join("../..")
        .join("submodules/language-tools/packages/svelte2tsx")
}

fn local_additions(name: &str) -> &'static [&'static str] {
    LOCAL_ADDITIONS
        .iter()
        .find(|(file, _)| *file == name)
        .map(|(_, lines)| *lines)
        .unwrap_or(&[])
}

#[test]
fn vendored_shims_match_the_language_tools_submodule() {
    let upstream = upstream_root();
    if !upstream.join(VENDORED[0]).is_file() {
        assert!(
            std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
            "submodules/language-tools is not checked out in a job that declares \
             RSVELTE_REQUIRE_PREREQS — the vendored-shim drift assertions would be silently \
             skipped. Run `git submodule update --init \
             submodules/language-tools`."
        );
        eprintln!("Skipping: submodules/language-tools not initialised");
        return;
    }

    let vendored_root = crate_root().join("src/svelte_check/shims");
    for name in VENDORED {
        let ours = vendored_root.join(name);
        let theirs = upstream.join(name);
        let ours_text = std::fs::read_to_string(&ours)
            .unwrap_or_else(|e| panic!("cannot read vendored {}: {e}", ours.display()));
        let theirs_text = std::fs::read_to_string(&theirs)
            .unwrap_or_else(|e| panic!("cannot read upstream {}: {e}", theirs.display()));

        let declared = local_additions(name);
        let mut pending: Vec<&str> = declared.to_vec();
        let stripped: Vec<&str> = ours_text
            .lines()
            .filter(|line| {
                // Drop each declared addition once, so a duplicate still fails.
                match pending.iter().position(|added| added == line) {
                    Some(i) => {
                        pending.remove(i);
                        false
                    }
                    None => true,
                }
            })
            .collect();
        assert!(
            pending.is_empty(),
            "declared local addition(s) to `{name}` are no longer present: \
             {pending:?}. Remove them from LOCAL_ADDITIONS if upstream now \
             ships them."
        );

        assert_eq!(
            stripped,
            theirs_text.lines().collect::<Vec<_>>(),
            "vendored `{name}` has drifted from \
             submodules/language-tools/packages/svelte2tsx/{name} beyond its \
             declared local additions.\nRe-copy the upstream file, or declare \
             the delta in LOCAL_ADDITIONS with a reason. An undeclared patch \
             ages out again on the next `svelte/elements` addition (#1889)."
        );
    }
}
