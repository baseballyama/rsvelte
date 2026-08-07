//! Gate: the two implementations of every ported Phase-3 client pass must emit
//! the same thing.
//!
//! `ast_rewrite::dual_run::resolve` chooses between a pass's text-splicing
//! implementation and its in-place one from `RSVELTE_AST_SPLICE`, read once per
//! process. A disagreement between them is therefore compiler output that
//! depends on an environment variable — and it is invisible to every other
//! gate: a test through the public entry point exercises exactly one of the two
//! per process, and the corpus output-equality gate compares through
//! `ast_equiv_batch`, which is blind to a divergence that lives only in
//! comments (see the NOT COVERED note in `scripts/compat-corpus/verify.mjs`).
//!
//! `dual_run_tally --per-fixture` is run as a child process rather than
//! in-process because the harness switch is a `LazyLock` over the environment:
//! it has to be set before the first compile in the process that reads it.

use std::collections::BTreeSet;
use std::path::{Path, PathBuf};
use std::process::Command;

fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("crates/<pkg> is two levels below the repo root")
        .to_path_buf()
}

fn ratchet_path(root: &Path) -> PathBuf {
    root.join("compatibility/dual-run-known-failures.json")
}

fn read_ratchet(root: &Path) -> BTreeSet<String> {
    let text = std::fs::read_to_string(ratchet_path(root)).expect("read the ratchet");
    let entries: Vec<serde_json::Value> = serde_json::from_str(&text).expect("parse the ratchet");
    entries
        .iter()
        .map(|e| {
            format!(
                "{}\t{}",
                e["id"].as_str().expect("entry has an id"),
                e["pass"].as_str().expect("entry has a pass"),
            )
        })
        .collect()
}

fn write_ratchet(root: &Path, measured: &BTreeSet<String>) {
    let entries: Vec<serde_json::Value> = measured
        .iter()
        .map(|line| {
            let (id, pass) = line.split_once('\t').expect("measured line is id\\tpass");
            serde_json::json!({ "id": id, "pass": pass })
        })
        .collect();
    let mut json = serde_json::to_string_pretty(&entries).expect("serialize the ratchet");
    // `serde_json` indents with spaces; the checked-in ratchets use tabs.
    json = json
        .lines()
        .map(|line| {
            let depth = line.len() - line.trim_start().len();
            format!("{}{}", "\t".repeat(depth / 2), line.trim_start())
        })
        .collect::<Vec<_>>()
        .join("\n");
    json.push('\n');
    std::fs::write(ratchet_path(root), json).expect("write the ratchet");
}

#[test]
fn the_two_implementations_of_every_pass_agree() {
    let root = repo_root();
    let fixtures = root.join("submodules/svelte/packages/svelte/tests");
    assert!(
        fixtures.exists(),
        "Svelte submodule missing at {} — run `git submodule update --init`",
        fixtures.display()
    );

    let output = Command::new(env!("CARGO_BIN_EXE_dual_run_tally"))
        .env("RSVELTE_AST_DUAL_RUN", "1")
        .arg("--per-fixture")
        .arg(&fixtures)
        .output()
        .expect("run dual_run_tally");
    let stdout = String::from_utf8_lossy(&output.stdout);

    // A run that measured nothing satisfies "no new mismatch" exactly as well as
    // a clean one does, so the population is asserted before the verdict.
    let counted: usize = stdout
        .lines()
        .find_map(|l| l.strip_suffix(" fixtures")?.parse().ok())
        .unwrap_or_else(|| panic!("dual_run_tally printed no fixture count:\n{stdout}"));
    assert!(
        counted > 4000,
        "expected the official fixture corpus, dual_run_tally saw only {counted} files"
    );

    let measured: BTreeSet<String> = stdout
        .lines()
        .filter_map(|l| l.strip_prefix("MISMATCH\t"))
        .map(str::to_owned)
        .collect();

    if std::env::var_os("UPDATE_DUAL_RUN_RATCHET").is_some() {
        write_ratchet(&root, &measured);
        return;
    }

    let known = read_ratchet(&root);
    let regressions: Vec<&String> = measured.difference(&known).collect();
    let fixed: Vec<&String> = known.difference(&measured).collect();
    assert!(
        regressions.is_empty(),
        "the two implementations of a Phase-3 pass now disagree on an input \
         that is not in the ratchet — compiler output would depend on \
         RSVELTE_AST_SPLICE:\n{}",
        regressions
            .iter()
            .map(|s| format!("  {s}"))
            .collect::<Vec<_>>()
            .join("\n")
    );
    assert!(
        fixed.is_empty(),
        "these ratchet entries now agree — re-baseline in the same change that \
         fixed them (UPDATE_DUAL_RUN_RATCHET=1 cargo test -p rsvelte_devtools \
         --test dual_run_gate) and update \
         compatibility/dual-run-known-failures.md:\n{}",
        fixed
            .iter()
            .map(|s| format!("  {s}"))
            .collect::<Vec<_>>()
            .join("\n")
    );
}
