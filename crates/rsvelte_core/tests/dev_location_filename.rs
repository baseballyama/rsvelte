//! Dev-mode location strings come from `locate_node()`, which prints
//! `state.filename` — the whole `rootDir`-relative path, run through
//! `sanitize_location()` (`/` → `/\u{200b}`) — not just the basename.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str, filename: &str, root_dir: Option<&str>) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some(filename.to_string()),
            root_dir: root_dir.map(str::to_string),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const TRACE_SRC: &str = r#"<script>
	let obj = $state({ a: 1 });
	function f() {
		$inspect.trace();
		obj.a;
	}
	f();
</script>
<p>{obj.a}</p>
"#;

#[test]
fn the_trace_label_carries_the_whole_relative_path() {
    let out = compile_client_dev(TRACE_SRC, "sub/dir/Tr.svelte", None);
    assert!(
        out.contains("'f (sub/\u{200b}dir/\u{200b}Tr.svelte:3:1)'"),
        "expected the sanitized relative path in the trace label, got:\n{out}"
    );
}

#[test]
fn the_trace_label_is_relative_to_root_dir() {
    let out = compile_client_dev(TRACE_SRC, "/repo/sub/Tr.svelte", Some("/repo"));
    assert!(
        out.contains("'f (sub/\u{200b}Tr.svelte:3:1)'"),
        "expected the path to be made rootDir-relative, got:\n{out}"
    );
}
