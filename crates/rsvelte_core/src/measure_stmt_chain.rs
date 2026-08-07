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

use std::borrow::Cow;
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

pub fn record(name: &'static str, input: *const u8, value: &Cow<'_, str>) {
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
pub fn snapshot() -> Vec<Stage> {
    STAGES.with(|s| s.borrow().clone())
}

/// `(owned, owned_bytes, borrowed, borrowed_bytes)` across every stage.
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
    use crate::compiler::{CompileOptions, compile};

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

    fn measure(source: &str, filename: &str) -> Vec<Stage> {
        reset();
        compile(
            source,
            CompileOptions {
                filename: Some(filename.to_string()),
                ..CompileOptions::default()
            },
        )
        .expect("fixture must compile");
        snapshot()
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
    }
}
