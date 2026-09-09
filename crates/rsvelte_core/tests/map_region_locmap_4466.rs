//! A region appended to the comment buffer must record its `LocRange`, or its
//! offsets reach the source map untranslated and resolve against the source line
//! table as if they were source offsets.

use rsvelte_core::{CompileOptions, GenerateMode, compile};
use sourcemap::SourceMap;

/// Every one of these puts a comment inside a template expression, which is what
/// opens a source region; before the fix each reported segments past the end of
/// the source line they name.
const CASES: &[(&str, &str)] = &[
    (
        "handler-comment-only-body",
        "<script>\n\tlet a = 1;\n</script>\n\n<button\n\tonclick={function (e) {\n\t\t// nothing to do yet\n\t}}>{a}</button\n>\n",
    ),
    (
        "arrow-inline-block-comment",
        "<script>\n\tlet v = $state(1);\n</script>\n\n<button onclick={() => /* c */ v++}>x</button>\n",
    ),
    (
        "each-const-parameter-comment",
        "<script>\n\tlet v = $state(1);\n</script>\n\n{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}\n",
    ),
];

fn out_of_range(source: &str, map_json: &str) -> Vec<String> {
    let map = SourceMap::from_slice(map_json.as_bytes()).expect("map parses");
    let lines: Vec<&str> = source.split('\n').collect();
    let mut bad = Vec::new();
    for token in map.tokens() {
        let line = token.get_src_line() as usize;
        let col = token.get_src_col() as usize;
        match lines.get(line) {
            None => bad.push(format!("line {line} past EOF")),
            // A column equal to the line length is the exclusive end of the last
            // token on that line, which upstream also emits.
            Some(text) if col > text.chars().count() => bad.push(format!(
                "{}:{} but line is {} wide",
                line + 1,
                col,
                text.chars().count()
            )),
            Some(_) => {}
        }
    }
    bad
}

#[test]
fn a_source_region_maps_back_into_its_own_source() {
    let mut failures = Vec::new();
    for (name, source) in CASES {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            for dev in [false, true] {
                let result = compile(
                    source,
                    CompileOptions {
                        generate,
                        dev,
                        filename: Some(format!("{name}.svelte")),
                        ..Default::default()
                    },
                )
                .unwrap_or_else(|e| {
                    panic!("{name} {generate:?} dev={dev} failed to compile: {e:?}")
                });
                let Some(map) = result.js.map.as_ref() else {
                    continue;
                };
                let bad = out_of_range(source, map);
                if !bad.is_empty() {
                    failures.push(format!("{name} {generate:?} dev={dev}: {}", bad.join(", ")));
                }
            }
        }
    }
    assert!(
        failures.is_empty(),
        "source-map segments point outside their source line:\n{}",
        failures.join("\n")
    );
}
