use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// Two independent sites sliced a `&str` at a byte offset they had measured
/// elsewhere, so a multi-byte character anywhere near it aborted the process:
/// the source-map column (an em dash in an instance-script comment) and the
/// `svelte-ignore` back-scan (a variation selector in markup, dev mode only).
/// Both inputs are reductions of real corpus components and both compile
/// upstream.
#[test]
fn multi_byte_characters_do_not_abort_the_compiler() {
    for (source, dev) in [
        (
            include_str!("fixtures_utf8_boundary/sourcemap_column.svelte"),
            false,
        ),
        (
            include_str!("fixtures_utf8_boundary/svelte_ignore_scan.svelte"),
            true,
        ),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            compile(
                source,
                CompileOptions {
                    generate,
                    dev,
                    ..Default::default()
                },
            )
            .expect("compiles");
        }
    }
}
