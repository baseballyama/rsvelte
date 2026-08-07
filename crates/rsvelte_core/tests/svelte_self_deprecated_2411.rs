//! `svelte_self_deprecated` interpolates the component name and the *file*
//! basename, which are two independent values. Deriving the second from the
//! first prints a path that does not exist — and on a case-sensitive
//! filesystem the suggestion the compiler hands the user fails to resolve.
//!
//! Upstream `2-analyze/visitors/SvelteSelf.js`:
//!
//! ```js
//! if (context.state.analysis.runes) {
//!   const name = filename === UNKNOWN_FILENAME ? 'Self' : context.state.analysis.name;
//!   const basename = filename === UNKNOWN_FILENAME
//!     ? 'Self.svelte'
//!     : filename.split(/[/\\]/).pop();
//!   w.svelte_self_deprecated(node, name, basename);
//! }
//! ```
//!
//! Every expectation below was measured against official svelte 5.56.8, the
//! version `submodules/svelte` is pinned to.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const RUNES: &str = r#"<script>
	let { n = 5 } = $props();
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<p>{n}</p>
	<svelte:self n={n - 1} />
{/if}
"#;

const LEGACY: &str = r#"<script>
	export let n = 5;
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<p>{n}</p>
	<svelte:self n={n - 1} />
{/if}
"#;

/// The derived component name collides with a declared identifier, so the
/// conflict suffixing renames the component but must not rename the file.
const CONFLICT: &str = r#"<script>
	let { n = 5 } = $props();
	const Input = 1;
	console.log(Input);
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<svelte:self n={n - 1} />
{/if}
"#;

fn self_warnings(src: &str, opts: CompileOptions) -> Vec<String> {
    compile(src, opts)
        .expect("compile")
        .warnings
        .into_iter()
        .filter(|w| w.code == "svelte_self_deprecated")
        .map(|w| w.message.clone())
        .collect()
}

fn opts(filename: Option<&str>) -> CompileOptions {
    CompileOptions {
        filename: filename.map(str::to_string),
        generate: GenerateMode::Client,
        css: CssMode::External,
        ..Default::default()
    }
}

fn only(src: &str, o: CompileOptions) -> String {
    let w = self_warnings(src, o);
    assert_eq!(w.len(), 1, "expected exactly one warning, got {w:?}");
    w.into_iter().next().unwrap()
}

fn assert_suggests(msg: &str, ident: &str, path: &str) {
    let want = format!("`import {ident} from './{path}'`");
    assert!(
        msg.contains(&want),
        "expected suggestion {want}\n     in message: {msg}"
    );
}

#[test]
fn basename_is_the_real_filename_not_the_capitalised_name() {
    let m = only(RUNES, opts(Some("input.svelte")));
    assert_suggests(&m, "Input", "input.svelte");
}

#[test]
fn basename_strips_directories() {
    let m = only(RUNES, opts(Some("src/lib/MyThing.svelte")));
    assert_suggests(&m, "MyThing", "MyThing.svelte");
}

#[test]
fn basename_splits_on_backslashes_too() {
    let m = only(RUNES, opts(Some(r"src\lib\MyThing.svelte")));
    assert_suggests(&m, "MyThing", "MyThing.svelte");
}

#[test]
fn basename_is_relative_to_root_dir() {
    let mut o = opts(Some("/a/b/src/Widget.svelte"));
    o.root_dir = Some("/a/b".to_string());
    let m = only(RUNES, o);
    assert_suggests(&m, "Widget", "Widget.svelte");
}

#[test]
fn unknown_filename_uses_the_self_placeholder() {
    // Both the identifier and the path fall back — this is the branch that
    // produced upstream's checked-in `warnings.json`, which is why that file
    // is not a valid oracle for a run that does pass a filename.
    assert_suggests(&only(RUNES, opts(None)), "Self", "Self.svelte");
    assert_suggests(&only(RUNES, opts(Some("(unknown)"))), "Self", "Self.svelte");
}

#[test]
fn name_conflict_suffix_does_not_reach_the_path() {
    // The strongest separation case: the conflict renames the component but
    // must not rename the file. Only the path is asserted here — the
    // identifier half still reads `Input` where official reads `Input_1`,
    // because the conflict suffixing runs after the template walk rather than
    // before it. That ordering is a separate defect, tracked on its own.
    let m = only(CONFLICT, opts(Some("input.svelte")));
    assert!(
        m.contains("from './input.svelte'"),
        "path must stay the real file: {m}"
    );
}

#[test]
fn explicit_name_option_does_not_reach_the_path() {
    let mut o = opts(Some("input.svelte"));
    o.name = Some("Custom".to_string());
    let m = only(RUNES, o);
    assert_suggests(&m, "Custom", "input.svelte");
}

#[test]
fn legacy_mode_does_not_deprecate_svelte_self() {
    // `<svelte:self>` is the supported spelling in legacy mode; upstream gates
    // the whole warning on `analysis.runes`.
    let w = self_warnings(LEGACY, opts(Some("input.svelte")));
    assert!(
        w.is_empty(),
        "expected no warning in legacy mode, got {w:?}"
    );
}
