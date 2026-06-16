//! End-to-end type-aware lint test: the real corsa/`tsgo` backend resolving
//! TypeScript types for `svelte/no-unused-props` on cases the syntactic path
//! cannot handle (`extends`, intersection, nested object props).
//!
//! Gated on a discoverable `tsgo` binary (install with
//! `npm i @typescript/native-preview` at the repo root). Skips with a notice
//! when none is found, so the suite is a no-op in environments without it.

use std::path::{Path, PathBuf};

use rsvelte_lint::config::LintConfig;
use rsvelte_lint::rule::Severity;
use rsvelte_lint::rules::no_unused_props;
use rsvelte_lint_types::{CorsaTypeBackend, resolve_tsgo};

fn tsgo() -> Option<PathBuf> {
    // Walk up from this crate to the worktree root, where node_modules lives.
    resolve_tsgo(Path::new(env!("CARGO_MANIFEST_DIR")))
}

/// Write `source` to a fresh temp dir as `<name>` and lint it with the typed
/// `no-unused-props` path through the real backend; returns the messages.
fn typed_messages(name: &str, source: &str, tsgo: &Path) -> Vec<String> {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte-lint-types-{}-{}",
        std::process::id(),
        name.replace(['/', '.'], "_")
    ));
    std::fs::create_dir_all(&dir).unwrap();
    let svelte_path = dir.join(name);
    std::fs::write(&svelte_path, source).unwrap();

    let mut backend =
        CorsaTypeBackend::new(source, &svelte_path, tsgo).expect("backend should start");
    let cfg = LintConfig::recommended().with_override("svelte/no-unused-props", Severity::Warn);
    let diags = no_unused_props::diagnostics_typed(source, &svelte_path, &cfg, &mut backend);

    drop(backend);
    let _ = std::fs::remove_dir_all(&dir);

    diags.into_iter().map(|d| d.message).collect()
}

fn assert_unused(msgs: &[String], expected: &[&str]) {
    let mut got: Vec<&str> = msgs.iter().map(String::as_str).collect();
    got.sort_unstable();
    let mut want: Vec<&str> = expected.to_vec();
    want.sort_unstable();
    assert_eq!(got, want, "unexpected findings");
}

#[test]
fn extends_resolves_inherited_unused() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP extends_resolves_inherited_unused: no tsgo binary found");
        return;
    };
    // Mirrors eslint-plugin-svelte `no-unused-props/invalid/extends-unused`.
    let src = r#"<script lang="ts">
	interface BaseProps {
		id: string;
		type: 'user' | 'admin';
		role: string;
	}

	interface Props extends BaseProps {
		name: string;
		email: string;
	}

	let props: Props = $props();
	console.log(props.id, props.type, props.name);
</script>
"#;
    let msgs = typed_messages("Extends.svelte", src, &tsgo);
    assert_unused(
        &msgs,
        &[
            "'role' is an unused Props property.",
            "'email' is an unused Props property.",
        ],
    );
}

#[test]
fn intersection_resolves_unused() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP intersection_resolves_unused: no tsgo binary found");
        return;
    };
    // Mirrors `no-unused-props/invalid/intersection-unused`.
    let src = r#"<script lang="ts">
	type WithId = {
		id: string;
		version: number;
	};

	type WithTimestamp = {
		createdAt: Date;
		updatedAt: Date;
	};

	type Props = WithId &
		WithTimestamp & {
			name: string;
		};

	const props: Props = $props();
	console.log(props.id, props.name, props.createdAt);
</script>
"#;
    let msgs = typed_messages("Intersection.svelte", src, &tsgo);
    assert_unused(
        &msgs,
        &[
            "'version' is an unused Props property.",
            "'updatedAt' is an unused Props property.",
        ],
    );
}

#[test]
fn nested_object_prop_unused() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP nested_object_prop_unused: no tsgo binary found");
        return;
    };
    // Mirrors `no-unused-props/invalid/nested-unused`.
    let src = r#"<script lang="ts">
	interface Props {
		user: {
			name: string;
			location: string;
		};
	}
	let props: Props = $props();
	console.log(props.user.name);
</script>
"#;
    let msgs = typed_messages("Nested.svelte", src, &tsgo);
    assert_unused(&msgs, &["'location' in 'user' is an unused property."]);
}

#[test]
fn fully_used_props_report_nothing() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP fully_used_props_report_nothing: no tsgo binary found");
        return;
    };
    let src = r#"<script lang="ts">
	interface Base { a: string }
	interface Props extends Base { b: number }
	let { a, b }: Props = $props();
	console.log(a, b);
</script>
"#;
    let msgs = typed_messages("AllUsed.svelte", src, &tsgo);
    assert_unused(&msgs, &[]);
}
