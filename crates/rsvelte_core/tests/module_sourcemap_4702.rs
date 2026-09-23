//! `compileModule` returns a source map (#4702).
//!
//! `compile_module` hard-coded `map: None`, so every `.svelte.js` / `.svelte.ts`
//! came back with `js.map === null` while upstream returns esrap's own map. The
//! consumers that branch on it (`@rsvelte/vite-plugin-svelte`'s optimizer reads
//! `result.map ? … : result.code`) therefore skipped the module path silently.
//!
//! rsvelte's module pipeline rewrites text instead of printing an AST, so the
//! mappings are the server component path's token scan rather than esrap's, and
//! they are NOT byte-equal to upstream's. What this file pins is the header —
//! every field of which is the oracle's (`submodules/svelte` `636eaaaa6`,
//! `VERSION 5.57.1`) — plus the properties a consumer relies on: the mappings
//! decode, they stay inside both texts, and each generated statement resolves to
//! the source line that declares it.
//!
//! Column resolution is coarser than upstream's, and measured rather than
//! asserted: on the source below the oracle emits 32 client segments starting at
//! generated column 0 of each statement, where the token scan emits 16 and the
//! leftmost one on `export const x = 1;` is column 13 (`x`) — the scan matches
//! identifiers and operators, not the `export` / `const` / `function` keywords
//! esrap anchors a statement at. Line resolution is what this file guards.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};
use serde_json::Value;

const SRC: &str =
    "export const x = 1;\nlet count = $state(0);\nexport function inc() { count += 1; }\n";

fn compiled(filename: Option<&str>, generate: GenerateMode) -> (String, Value) {
    let result = compile_module(
        SRC,
        ModuleCompileOptions {
            filename: filename.map(str::to_string),
            generate,
            ..Default::default()
        },
    )
    .expect("compiles");
    let map = result.js.map.as_deref().expect("a module carries a js map");
    (
        result.js.code,
        serde_json::from_str(map).expect("the map is JSON"),
    )
}

/// Decode `mappings` into `(gen_line, gen_col, src_line, src_col)` quadruples.
fn decode(mappings: &str) -> Vec<(usize, usize, usize, usize)> {
    let mut out = Vec::new();
    let mut state = [0i64; 4];
    for (gen_line, line) in mappings.split(';').enumerate() {
        state[0] = 0;
        for field in line.split(',').filter(|f| !f.is_empty()) {
            let mut values = Vec::new();
            let (mut value, mut shift) = (0i64, 0u32);
            for c in field.bytes() {
                let digit = match c {
                    b'A'..=b'Z' => i64::from(c - b'A'),
                    b'a'..=b'z' => i64::from(c - b'a') + 26,
                    b'0'..=b'9' => i64::from(c - b'0') + 52,
                    b'+' => 62,
                    b'/' => 63,
                    _ => panic!("bad VLQ digit {c:?} in {mappings:?}"),
                };
                value += (digit & 31) << shift;
                if digit & 32 == 0 {
                    let negative = value & 1 == 1;
                    value >>= 1;
                    values.push(if negative { -value } else { value });
                    (value, shift) = (0, 0);
                } else {
                    shift += 5;
                }
            }
            for (i, v) in values.iter().take(4).enumerate() {
                state[i] += v;
            }
            assert!(
                state.iter().all(|v| *v >= 0),
                "a decoded field went negative: {state:?}"
            );
            if values.len() >= 4 {
                out.push((
                    gen_line,
                    state[0] as usize,
                    state[2] as usize,
                    state[3] as usize,
                ));
            }
        }
    }
    out
}

#[test]
fn a_module_result_carries_a_source_map_on_both_targets() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let (_, map) = compiled(Some("src/lib/T.svelte.js"), generate);
        assert_eq!(map["version"], 3, "{generate:?}: {map:#}");
        // Upstream's module map comes out of esrap's `print()`, which sets no
        // `file` key — the CSS map is the only one that names its output.
        assert!(map.get("file").is_none(), "{generate:?}: {map:#}");
        assert_eq!(map["sources"], serde_json::json!(["T.svelte.js"]));
        assert_eq!(map["sourcesContent"], serde_json::json!([SRC]));
        assert_eq!(map["names"], serde_json::json!([]));
    }
}

/// An absent filename is not an absent name: upstream's validator substitutes
/// `(unknown)` before the printer ever reads it.
#[test]
fn an_unnamed_module_is_named_unknown() {
    let (_, map) = compiled(None, GenerateMode::Client);
    assert_eq!(map["sources"], serde_json::json!(["(unknown)"]));
}

#[test]
fn every_mapping_lands_inside_both_texts() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let (code, map) = compiled(Some("T.svelte.js"), generate);
        let segments = decode(map["mappings"].as_str().expect("mappings is a string"));
        assert!(!segments.is_empty(), "{generate:?} mapped nothing");
        let generated: Vec<&str> = code.split('\n').collect();
        let source: Vec<&str> = SRC.split('\n').collect();
        for &(gen_line, gen_col, src_line, src_col) in &segments {
            let target = generated.get(gen_line).unwrap_or_else(|| {
                panic!("{generate:?}: generated line {gen_line} does not exist")
            });
            assert!(
                gen_col <= target.len(),
                "{generate:?}: generated {gen_line}:{gen_col} is past {target:?}"
            );
            let src = source
                .get(src_line)
                .unwrap_or_else(|| panic!("{generate:?}: source line {src_line} does not exist"));
            assert!(
                src_col <= src.len(),
                "{generate:?}: source {src_line}:{src_col} is past {src:?}"
            );
        }
    }
}

/// Each statement's generated line resolves to the source line that declares
/// it — the property a debugger steps by, and the one the source lines here were
/// chosen to separate. Every source line is claimed by exactly one statement, so
/// a map whose segments were all `0:0` (the shape the component path falls back
/// to when nothing is tracked) fails two of the three rows.
#[test]
fn each_statement_resolves_to_its_own_source_line() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let (code, map) = compiled(Some("T.svelte.js"), generate);
        let segments = decode(map["mappings"].as_str().expect("mappings is a string"));
        let generated: Vec<&str> = code.split('\n').collect();
        for (statement, expected_source_line) in [
            ("export const x = 1;", 0usize),
            ("let count =", 1),
            ("export function inc()", 2),
        ] {
            let gen_line = generated
                .iter()
                .position(|line| line.starts_with(statement))
                .unwrap_or_else(|| panic!("{generate:?}: no line starts {statement:?}:\n{code}"));
            let on_line: Vec<_> = segments
                .iter()
                .filter(|&&(gl, ..)| gl == gen_line)
                .collect();
            assert!(
                !on_line.is_empty(),
                "{generate:?}: {statement:?} (generated line {gen_line}) is mapped by nothing; \
                 segments: {segments:?}"
            );
            assert!(
                on_line
                    .iter()
                    .all(|&&(_, _, sl, _)| sl == expected_source_line),
                "{generate:?}: {statement:?} (generated line {gen_line}) leaves source line \
                 {expected_source_line}: {on_line:?}"
            );
        }
    }
}

/// The live axis: `generate: None` produces no code, so it must produce no map
/// either — an implementation that returns a map unconditionally passes every
/// assertion above.
#[test]
fn a_module_compiled_for_no_target_has_no_code_to_map() {
    let result = compile_module(
        SRC,
        ModuleCompileOptions {
            filename: Some("T.svelte.js".to_string()),
            generate: GenerateMode::None,
            ..Default::default()
        },
    )
    .expect("compiles");
    assert_eq!(result.js.code, "");
    assert_eq!(
        result
            .js
            .map
            .as_deref()
            .map(|m| m.contains("\"mappings\":\"\"")),
        Some(true),
        "an empty output maps nothing: {:?}",
        result.js.map
    );
}
