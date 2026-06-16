//! End-to-end type-aware test for `svelte/no-navigation-without-resolve`,
//! exercising the backend's `probe_expr` (forward-mapping) path: a navigation
//! target whose resolved TYPE is `ResolvedPathname` (or nullish, for links) is
//! recognized as allowed and not reported.
//!
//! Uses a locally-aliased branded type named `ResolvedPathname` so the test is
//! self-contained (no `$app/types` ambient package required); the rule's
//! `goto`/`<a>` detection is syntactic and works regardless of `$app/*`
//! resolving. Gated on a discoverable `tsgo` binary.

use std::path::{Path, PathBuf};

use rsvelte_lint::config::LintConfig;
use rsvelte_lint::rule::Severity;
use rsvelte_lint::rules::no_navigation_without_resolve as nav;
use rsvelte_lint_types::{CorsaTypeBackend, resolve_tsgo};

fn tsgo() -> Option<PathBuf> {
    resolve_tsgo(Path::new(env!("CARGO_MANIFEST_DIR")))
}

fn typed_messages(name: &str, source: &str, tsgo: &Path) -> Vec<String> {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte-lint-nav-{}-{}",
        std::process::id(),
        name.replace(['/', '.'], "_")
    ));
    std::fs::create_dir_all(&dir).unwrap();
    let svelte_path = dir.join(name);
    std::fs::write(&svelte_path, source).unwrap();

    let mut backend =
        CorsaTypeBackend::new(source, &svelte_path, tsgo).expect("backend should start");
    let cfg = LintConfig::recommended()
        .with_override("svelte/no-navigation-without-resolve", Severity::Warn);
    let diags = nav::diagnostics_typed(source, &svelte_path, &cfg, &mut backend);

    drop(backend);
    let _ = std::fs::remove_dir_all(&dir);
    diags.into_iter().map(|d| d.message).collect()
}

#[test]
fn goto_with_resolved_pathname_is_allowed() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP goto_with_resolved_pathname_is_allowed: no tsgo binary found");
        return;
    };
    let src = r#"<script lang="ts">
	import { goto } from '$app/navigation';
	type ResolvedPathname = string & { __brand: 'resolved' };
	const href = '/foo' as ResolvedPathname;
	goto(href);
</script>
"#;
    let msgs = typed_messages("GotoResolved.svelte", src, &tsgo);
    assert!(
        msgs.is_empty(),
        "ResolvedPathname goto should be allowed; got {msgs:?}"
    );
}

#[test]
fn goto_with_plain_string_is_reported() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP goto_with_plain_string_is_reported: no tsgo binary found");
        return;
    };
    // Control: a plain-string target is NOT allowed and must be reported, even
    // through the type-aware path.
    let src = r#"<script lang="ts">
	import { goto } from '$app/navigation';
	const href: string = '/foo';
	goto(href);
</script>
"#;
    let msgs = typed_messages("GotoPlain.svelte", src, &tsgo);
    assert_eq!(
        msgs,
        vec!["Unexpected goto() call without resolve().".to_string()],
        "plain-string goto should be reported"
    );
}

#[test]
fn link_with_resolved_pathname_is_allowed() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP link_with_resolved_pathname_is_allowed: no tsgo binary found");
        return;
    };
    // Exercises forward-mapping of a TEMPLATE expression (`<a {href}>`).
    let src = r#"<script lang="ts">
	type ResolvedPathname = string & { __brand: 'resolved' };
	interface Props { href: ResolvedPathname }
	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
"#;
    let msgs = typed_messages("LinkResolved.svelte", src, &tsgo);
    assert!(
        msgs.is_empty(),
        "ResolvedPathname link should be allowed; got {msgs:?}"
    );
}

#[test]
fn link_with_nullish_href_is_allowed() {
    let Some(tsgo) = tsgo() else {
        eprintln!("SKIP link_with_nullish_href_is_allowed: no tsgo binary found");
        return;
    };
    // Mirrors `no-navigation-without-resolve/valid/link-nullish02`: a `null`-typed
    // href on a link is allowed (links permit nullish).
    let src = r#"<script lang="ts">
	interface Props { href: null }
	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
"#;
    let msgs = typed_messages("LinkNullish.svelte", src, &tsgo);
    assert!(
        msgs.is_empty(),
        "null-typed href link should be allowed; got {msgs:?}"
    );
}
