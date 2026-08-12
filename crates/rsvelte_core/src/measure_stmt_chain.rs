//! Counts what the per-statement transform chain in
//! `transform_instance_script_for_visitors` allocates, per stage.
//!
//! The chain runs ~20 rewrite stages over every top-level statement of an
//! instance script, and a stage that fires its guard but rewrites nothing used
//! to be indistinguishable from one that rewrote: both returned a fresh
//! `String`. Correctness tests cannot separate those two, so the split is
//! counted rather than assumed.
//!
//! A stage counts as `owned` when its output does not share a buffer with its
//! input — moving a `String` through keeps its pointer, so this measures the
//! allocation rather than the `Cow` discriminant, which a pass-through would
//! otherwise report as owned forever after the first real rewrite.

use std::cell::RefCell;

/// One chain stage's tally for the current thread.
#[derive(Clone, Copy)]
pub struct Stage {
    pub name: &'static str,
    pub owned: u64,
    pub owned_bytes: u64,
    pub borrowed: u64,
    pub borrowed_bytes: u64,
}

thread_local! {
    static STAGES: RefCell<Vec<Stage>> = const { RefCell::new(Vec::new()) };
}

/// # Panics
///
/// Panics if statement-chain measurement state is accessed reentrantly.
pub fn record(name: &'static str, input: *const u8, value: &str) {
    let owned = !std::ptr::eq(value.as_ptr(), input);
    let len = value.len() as u64;
    STAGES.with(|s| {
        let mut s = s.borrow_mut();
        let entry = match s.iter_mut().position(|e| e.name == name) {
            Some(i) => &mut s[i],
            None => {
                s.push(Stage {
                    name,
                    owned: 0,
                    owned_bytes: 0,
                    borrowed: 0,
                    borrowed_bytes: 0,
                });
                s.last_mut().expect("just pushed")
            }
        };
        if owned {
            entry.owned += 1;
            entry.owned_bytes += len;
        } else {
            entry.borrowed += 1;
            entry.borrowed_bytes += len;
        }
    });
}

/// Per-stage tallies since the last [`reset`], in first-run order.
#[must_use]
pub fn snapshot() -> Vec<Stage> {
    STAGES.with(|s| s.borrow().clone())
}

/// `(owned, owned_bytes, borrowed, borrowed_bytes)` across every stage.
#[must_use]
pub fn totals() -> (u64, u64, u64, u64) {
    snapshot().iter().fold((0, 0, 0, 0), |acc, s| {
        (
            acc.0 + s.owned,
            acc.1 + s.owned_bytes,
            acc.2 + s.borrowed,
            acc.3 + s.borrowed_bytes,
        )
    })
}

pub fn reset() {
    STAGES.with(|s| s.borrow_mut().clear());
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::{CompileOptions, GenerateMode, compile};

    /// A legacy (non-runes) component: every guarded stage in the chain fires.
    const LEGACY: &str = r#"<script>
	import { onMount } from 'svelte';
	import Child from './Child.svelte';

	export let label = 'hi';
	export let rows = [];

	let count = 0;
	let items = [1, 2, 3];
	let selected = null;

	const greeting = 'hello world, this is a fairly long constant string';
	const formatter = new Intl.NumberFormat('en-US', { style: 'decimal' });
	const noop = () => {};

	function bump() {
		count += 1;
	}

	function reset_all() {
		count = 0;
		items = [];
		selected = null;
	}

	function describe(row) {
		return `${row.id}: ${row.name} (${formatter.format(row.value)})`;
	}

	async function load() {
		const response = await fetch('/api/rows');
		rows = await response.json();
	}

	onMount(() => {
		load();
		noop();
	});

	$: doubled = count * 2;
	$: summary = rows.map(describe).join(', ');
</script>

<button onclick={bump}>{label} {count} {doubled} {items.length} {greeting}</button>
<Child {rows} {summary} {selected} />
"#;

    /// A runes component: the legacy-only stages are skipped by their guards, so
    /// only the always-on stages can be observed here.
    const RUNES: &str = r#"<script>
	import { untrack } from 'svelte';
	import Child from './Child.svelte';

	let { label, rows = [] } = $props();

	let count = $state(0);
	let selected = $state(null);
	let doubled = $derived(count * 2);
	let summary = $derived(rows.map((row) => row.name).join(', '));

	const greeting = 'hello world, this is a fairly long constant string';
	const formatter = new Intl.NumberFormat('en-US', { style: 'decimal' });

	function bump() {
		count += 1;
	}

	function reset_all() {
		count = 0;
		selected = null;
	}

	function describe(row) {
		return `${row.id}: ${row.name} (${formatter.format(row.value)})`;
	}

	$effect(() => {
		untrack(() => describe(rows[0] ?? { id: 0, name: '', value: 0 }));
	});
</script>

<button onclick={bump}>{label} {count} {doubled} {greeting}</button>
<Child {rows} {summary} {selected} />
"#;

    fn measure_with(source: &str, filename: &str, generate: GenerateMode) -> Vec<Stage> {
        reset();
        compile(
            source,
            CompileOptions {
                filename: Some(filename.to_string()),
                generate,
                ..CompileOptions::default()
            },
        )
        .expect("fixture must compile");
        snapshot()
    }

    fn measure(source: &str, filename: &str) -> Vec<Stage> {
        measure_with(source, filename, GenerateMode::Client)
    }

    fn report(label: &str, stages: &[Stage]) {
        println!("--- {label} ---");
        for s in stages {
            println!(
                "{:<34} owned {:>4} / {:>7} B   borrowed {:>4} / {:>7} B",
                s.name, s.owned, s.owned_bytes, s.borrowed, s.borrowed_bytes
            );
        }
        let (owned, owned_bytes, borrowed, borrowed_bytes) =
            stages.iter().fold((0u64, 0u64, 0u64, 0u64), |acc, s| {
                (
                    acc.0 + s.owned,
                    acc.1 + s.owned_bytes,
                    acc.2 + s.borrowed,
                    acc.3 + s.borrowed_bytes,
                )
            });
        println!(
            "{:<34} owned {:>4} / {:>7} B   borrowed {:>4} / {:>7} B",
            "TOTAL", owned, owned_bytes, borrowed, borrowed_bytes
        );
    }

    fn stage_of<'a>(stages: &'a [Stage], name: &str) -> &'a Stage {
        stages
            .iter()
            .find(|s| s.name == name)
            .unwrap_or_else(|| panic!("stage {name} never ran, so it measures nothing"))
    }

    #[test]
    fn stmt_chain_allocation_report() {
        let legacy = measure(LEGACY, "Legacy.svelte");
        report("legacy", &legacy);
        let runes = measure(RUNES, "Runes.svelte");
        report("runes", &runes);

        assert!(
            !legacy.is_empty() && !runes.is_empty(),
            "the chain must have run at all — an empty report measures nothing"
        );

        // Each converted stage has to be observed handing its input through at
        // least once. Byte-identical output is not evidence that it does: a
        // conversion that never takes the borrowed path passes every
        // correctness test while saving nothing.
        for name in [
            "runes",
            "destructure_assignments",
            "store_unsub_for_state_sets",
            "member_mutations",
            "prop_update_expressions",
            "prop_assignments",
            "legacy_destructure_declarations",
            "legacy_state_declarations",
            "state_reads",
        ] {
            assert!(
                stage_of(&legacy, name).borrowed > 0,
                "stage {name} never handed its input through"
            );
        }

        // Negative control: SSR does not run this chain at all, so no stage may
        // report anything for it — if one does, the counter is not measuring
        // the chain it claims to.
        let server = measure_with(LEGACY, "Legacy.svelte", GenerateMode::Server);
        assert!(
            server.is_empty(),
            "the per-statement chain is client-only, but SSR recorded stages"
        );
    }

    const BINS: [(usize, &str); 5] = [
        (1024, "0-1 KB"),
        (3 * 1024, "1-3 KB"),
        (8 * 1024, "3-8 KB"),
        (20 * 1024, "8-20 KB"),
        (usize::MAX, ">20 KB"),
    ];

    fn collect_svelte_files(dir: &std::path::Path, out: &mut Vec<std::path::PathBuf>) {
        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_svelte_files(&path, out);
            } else if path.extension().is_some_and(|e| e == "svelte") {
                out.push(path);
            }
        }
    }

    /// Which stage of the chain grows faster than the corpus it is fed.
    ///
    /// A stage whose bytes-per-file rises faster than the bin's source
    /// bytes-per-file is the superlinear one; that comparison is what the
    /// column ratios below are for, and it is load-independent.
    ///
    /// Point `RSVELTE_STMT_CHAIN_CORPUS` at a tree of `.svelte` files and run
    /// with `--ignored --nocapture`.
    #[test]
    #[ignore = "needs a corpus directory in RSVELTE_STMT_CHAIN_CORPUS"]
    fn stmt_chain_size_bins() {
        let root = std::env::var("RSVELTE_STMT_CHAIN_CORPUS")
            .expect("set RSVELTE_STMT_CHAIN_CORPUS to a directory of .svelte files");
        let mut files = Vec::new();
        collect_svelte_files(std::path::Path::new(&root), &mut files);
        files.sort();
        assert!(!files.is_empty(), "corpus {root} holds no .svelte files");

        for (limit, label) in BINS {
            let lower = BINS
                .iter()
                .take_while(|(l, _)| *l < limit)
                .last()
                .map_or(0, |(l, _)| *l);
            let mut compiled = 0u64;
            let mut source_bytes = 0u64;
            let mut totals: Vec<Stage> = Vec::new();
            for path in &files {
                let Ok(source) = std::fs::read_to_string(path) else {
                    continue;
                };
                if source.len() < lower || source.len() >= limit {
                    continue;
                }
                reset();
                let name = path.file_name().unwrap_or_default().to_string_lossy();
                if compile(
                    &source,
                    CompileOptions {
                        filename: Some(name.into_owned()),
                        ..CompileOptions::default()
                    },
                )
                .is_err()
                {
                    continue;
                }
                compiled += 1;
                source_bytes += source.len() as u64;
                for stage in snapshot() {
                    match totals.iter_mut().find(|t| t.name == stage.name) {
                        Some(total) => {
                            total.owned += stage.owned;
                            total.owned_bytes += stage.owned_bytes;
                            total.borrowed += stage.borrowed;
                            total.borrowed_bytes += stage.borrowed_bytes;
                        }
                        None => totals.push(stage),
                    }
                }
            }
            if compiled == 0 {
                continue;
            }
            let per_file = |n: u64| n as f64 / compiled as f64;
            println!(
                "--- {label}: {compiled} files, {:.0} source B/file ---",
                per_file(source_bytes)
            );
            totals.sort_by(|a, b| {
                (b.owned_bytes + b.borrowed_bytes).cmp(&(a.owned_bytes + a.borrowed_bytes))
            });
            for stage in &totals {
                let handled = stage.owned_bytes + stage.borrowed_bytes;
                println!(
                    "{:<34} {:>8.0} B/file  ({:>5.2}x source)  {:>6.1} runs/file",
                    stage.name,
                    per_file(handled),
                    per_file(handled) / per_file(source_bytes),
                    per_file(stage.owned + stage.borrowed),
                );
            }
        }
    }
}
