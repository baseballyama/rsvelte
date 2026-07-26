//! Source-map verification gate.
//!
//! `tests/sourcemaps.rs` only compares *generated code*; the map itself was
//! never checked (its comparison double-encoded the JSON so it could never
//! parse, and the result was gated behind an opt-in env var — both since
//! removed). This file is the actual gate: it
//! ports the assertions the official suite makes in
//! `packages/svelte/tests/sourcemaps/samples/*/_config.js` and adds two
//! structural measures, all ratcheted shrink-only through
//! `compatibility/sourcemap-known-failures.json`.
//!
//! Three checks, in increasing breadth:
//!
//! 1. `anchor` — the official `client:` / `server:` / `css:` entries. Each names
//!    a string in the *generated* output and asserts the segment covering it
//!    maps to that string's position in the *original* source. Same algorithm as
//!    upstream `tests/sourcemaps/test.ts::compare`.
//! 2. `map-parity` — where rsvelte's generated code is byte-identical to the
//!    official compiler's, every segment of the official map must have a
//!    counterpart at the same generated position pointing at the same original
//!    position. Counts both *missing* segments (rsvelte's map is coarser — the
//!    resolution loss measured in #1781) and *wrong* ones.
//! 3. `out-of-range` — segments whose original position lies past the end of the
//!    source line (or past the last line). The official compiler emits zero;
//!    the recorded counts are a shrink-only budget.
//!
//! Ground truth is the official compiler: the `client.js` / `client.js.map`
//! fixtures under `fixtures/<sha>/sourcemaps/` are produced by
//! `scripts/fixtures/generate-fixtures.mjs` running `submodules/svelte`'s own
//! `compile()` on the same input with the same options.

mod common;

use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::PathBuf;

use common::{ensure_fixtures_exist, load_fixture_output, svelte_path};
use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

// ============================================================================
// Official `_config.js` expectations
// ============================================================================

/// One entry of an official `client:` / `server:` / `css:` array.
struct Anchor {
    /// `str` — searched in the *original* source.
    str: &'static str,
    /// `strGenerated` — searched in the *generated* output. `None` = same as `str`.
    generated: Option<&'static str>,
    /// `idxOriginal` — use the (n+1)-th occurrence in the source.
    idx_original: usize,
    /// `idxGenerated` — use the (n+1)-th occurrence in the output.
    idx_generated: usize,
}

const fn a(str: &'static str) -> Anchor {
    Anchor {
        str,
        generated: None,
        idx_original: 0,
        idx_generated: 0,
    }
}

const fn a_gen(str: &'static str, generated: &'static str) -> Anchor {
    Anchor {
        str,
        generated: Some(generated),
        idx_original: 0,
        idx_generated: 0,
    }
}

const fn a_idx(str: &'static str, idx_original: usize, idx_generated: usize) -> Anchor {
    Anchor {
        str,
        generated: None,
        idx_original,
        idx_generated,
    }
}

/// Which output a set of anchors applies to.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Target {
    Client,
    Server,
    Css,
}

impl Target {
    fn as_str(self) -> &'static str {
        match self {
            Target::Client => "client",
            Target::Server => "server",
            Target::Css => "css",
        }
    }
}

/// The compile-only subset of `packages/svelte/tests/sourcemaps/samples`.
///
/// Two upstream categories are absent, and only these two:
///
/// - Samples driven by a `preprocess` hook. Their `_config.js` expectations
///   describe the *preprocessed* source, which a Rust test cannot reproduce (the
///   preprocessors are JS closures over `magic-string` / `typescript`).
/// - Upstream `skip: true` samples (`binding-shorthand`, `markup`), skipped for
///   the same reason upstream skips them.
///
/// Both still take part in checks 2 and 3, which need no config.
///
/// `sourcemap-empty-source` is a third shape — it is neither preprocessed nor
/// skipped, it passes an upstream map through `compileOptions.sourcemap`. rsvelte
/// ignores that option here (the fixture generator does not forward it either),
/// so the anchor exercises the plain compile. It is ported anyway: the
/// expectation holds on the oracle for both targets, and its *server* failure is
/// the one counterexample to "server maps are accurate" — leaving it out would
/// have hidden that.
///
/// When `server` is absent upstream, `test.ts` reuses the `client` list for the
/// server output; that fallback is spelled out here instead.
///
/// `EXPECTED_ANCHOR_COUNT` pins the size of this table so an anchor cannot be
/// quietly deleted to make the gate pass.
const ANCHORS: &[(&str, Target, &[Anchor])] = &[
    ("basic", Target::Client, &[a("bar.baz")]),
    ("basic", Target::Server, &[a("bar.baz")]),
    ("binding", Target::Client, &[a("bar.baz")]),
    ("binding", Target::Server, &[a("bar.baz")]),
    // Upstream writes `.foo.svelte-1eyw86p`; the scope hash is derived from the
    // filename, and upstream's `compile_directory` passes a different one than
    // the fixture generator's plain `input.svelte`. `4hbqx4` is what the
    // official compiler emits under *these* options (verified by running
    // `submodules/svelte`'s `compile()` directly), so the anchor still asserts
    // official truth — and rsvelte's hash parity is gated by `tests/css.rs`.
    ("css", Target::Css, &[a_gen(".foo", ".foo.svelte-4hbqx4")]),
    (
        "each-block",
        Target::Client,
        &[a("foo"), a("bar"), a_idx("bar", 1, 1)],
    ),
    (
        "each-block",
        Target::Server,
        &[a("foo"), a("bar"), a_idx("bar", 1, 1)],
    ),
    (
        "effects",
        Target::Client,
        &[
            a_gen("$effect.pre", "$.user_pre_effect"),
            a_gen("$effect", "$.user_effect"),
        ],
    ),
    ("script", Target::Client, &[a("42")]),
    ("script", Target::Server, &[a("42")]),
    (
        "sourcemap-empty-source",
        Target::Client,
        &[a("let doubled")],
    ),
    (
        "sourcemap-empty-source",
        Target::Server,
        &[a("let doubled")],
    ),
    (
        "script-after-comment",
        Target::Client,
        &[a("assertThisLine")],
    ),
    (
        "script-after-comment",
        Target::Server,
        &[a("assertThisLine")],
    ),
    (
        "two-scripts",
        Target::Client,
        &[a("first"), a("assertThisLine")],
    ),
    (
        "two-scripts",
        Target::Server,
        &[a("first"), a("assertThisLine")],
    ),
];

/// Floors that stop the gate from passing because it measured *nothing*.
///
/// This is precisely the defect this PR exists to expose: the compatibility
/// report skipped every sourcemaps sample (wrong filename) and reported 0/0 as
/// success. An upstream rename, an uninitialised submodule, or a failed fixture
/// generation would silently do the same here, so every input to the gate
/// carries a lower bound. Raise these only alongside the measurement.
const EXPECTED_SAMPLES: usize = 29;
const EXPECTED_ANCHOR_COUNT: usize = 23;
/// `<sample>/<target>` pairs whose generated code is byte-identical to the
/// official compiler's — the population `map-parity` can observe at all. A drop
/// means byte-parity regressed and the map check silently shrank with it.
const EXPECTED_IDENTICAL_OUTPUTS: usize = 56;

/// What `scripts/fixtures/generate-fixtures.mjs` compiled the oracle with. Every
/// sourcemaps `_config.js` fails to import under the generator (it pulls in the
/// vitest suite), so all of them fall back to this. Compared against each
/// sample's `metadata.json` so a generator change that makes the oracle and this
/// test disagree is caught instead of silently skewing every comparison.
const EXPECTED_FIXTURE_COMPILE_OPTIONS: &str = r#"{"dev":false}"#;

// ============================================================================
// Source Map v3 decoding
// ============================================================================

/// A decoded mapping segment: `[generated_column, source_index, source_line,
/// source_column]` (the optional 5th `names` field is kept when present).
type Segment = Vec<i64>;

struct DecodedMap {
    sources: Vec<String>,
    sources_content: Vec<Option<String>>,
    /// One entry per generated line.
    lines: Vec<Vec<Segment>>,
}

fn vlq_decode_line(line: &str, state: &mut [i64; 4]) -> Vec<Segment> {
    // Generated column resets per line; the other three fields carry over.
    state[0] = 0;
    let mut segments = Vec::new();
    for field in line.split(',') {
        if field.is_empty() {
            continue;
        }
        let mut values = Vec::new();
        let mut value: i64 = 0;
        let mut shift = 0u32;
        for c in field.bytes() {
            let digit = match c {
                b'A'..=b'Z' => (c - b'A') as i64,
                b'a'..=b'z' => (c - b'a') as i64 + 26,
                b'0'..=b'9' => (c - b'0') as i64 + 52,
                b'+' => 62,
                b'/' => 63,
                _ => return segments,
            };
            value += (digit & 31) << shift;
            if digit & 32 == 0 {
                let negative = value & 1 == 1;
                value >>= 1;
                values.push(if negative { -value } else { value });
                value = 0;
                shift = 0;
            } else {
                shift += 5;
            }
        }
        let mut segment = Vec::with_capacity(values.len());
        for (i, v) in values.into_iter().enumerate() {
            if i < 4 {
                state[i] += v;
                segment.push(state[i]);
            } else {
                // `names` index — carried separately; not used by any check here.
                segment.push(v);
            }
        }
        segments.push(segment);
    }
    segments
}

fn decode_map(json: &str) -> Option<DecodedMap> {
    let value: serde_json::Value = serde_json::from_str(json).ok()?;
    let obj = value.as_object()?;

    let sources = obj
        .get("sources")?
        .as_array()?
        .iter()
        .map(|s| s.as_str().unwrap_or_default().to_string())
        .collect();
    let sources_content = obj
        .get("sourcesContent")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().map(|s| s.as_str().map(str::to_string)).collect())
        .unwrap_or_default();

    let mappings = obj.get("mappings")?.as_str()?;
    let mut state = [0i64; 4];
    let lines = mappings
        .split(';')
        .map(|line| vlq_decode_line(line, &mut state))
        .collect();

    Some(DecodedMap {
        sources,
        sources_content,
        lines,
    })
}

// ============================================================================
// Character locating (mirrors `locate-character`)
// ============================================================================

/// 0-based line / column of a character offset, plus the offset itself.
#[derive(Clone, Copy, Debug)]
struct Loc {
    line: usize,
    column: usize,
    character: usize,
}

/// Character offset of the `nth` (0-based) occurrence of `needle`, mirroring
/// upstream's repeated `indexOf(str, prev + 1)`.
fn find_nth(haystack: &str, needle: &str, nth: usize) -> Option<usize> {
    let mut byte_from = 0usize;
    let mut found = None;
    for _ in 0..=nth {
        let at = haystack[byte_from..].find(needle)? + byte_from;
        found = Some(at);
        byte_from = at + needle.chars().next().map(char::len_utf8).unwrap_or(1);
    }
    let byte = found?;
    Some(haystack[..byte].chars().count())
}

fn locate(source: &str, character: usize) -> Loc {
    let mut line = 0usize;
    let mut column = 0usize;
    for (i, c) in source.chars().enumerate() {
        if i == character {
            break;
        }
        if c == '\n' {
            line += 1;
            column = 0;
        } else {
            column += 1;
        }
    }
    Loc {
        line,
        column,
        character,
    }
}

fn char_at(source: &str, character: usize) -> Option<char> {
    source.chars().nth(character)
}

// ============================================================================
// The upstream `compare` algorithm
// ============================================================================

/// Result of one anchor assertion.
enum AnchorOutcome {
    /// Assertion held (or was legitimately skipped, as upstream's `continue`).
    Ok,
    /// Assertion failed, with a human-readable reason.
    Failed(String),
}

fn check_anchor(source: &str, output: &str, map: &DecodedMap, entry: &Anchor) -> AnchorOutcome {
    let generated_str = entry.generated.unwrap_or(entry.str);

    let Some(gen_char) = find_nth(output, generated_str, entry.idx_generated) else {
        return AnchorOutcome::Failed(format!("'{generated_str}' not found in generated output"));
    };
    let generated = locate(output, gen_char);

    let Some(segments) = map.lines.get(generated.line) else {
        return AnchorOutcome::Failed(format!(
            "no mappings for generated line {} ('{generated_str}')",
            generated.line
        ));
    };
    let Some(segment) = segments.iter().find(|s| s[0] == generated.column as i64) else {
        return AnchorOutcome::Failed(format!(
            "no segment at {}:{} for '{generated_str}'",
            generated.line, generated.column
        ));
    };
    if segment.len() < 4 {
        return AnchorOutcome::Failed(format!(
            "segment at {}:{} for '{generated_str}' has no source position",
            generated.line, generated.column
        ));
    }

    let Some(orig_char) = find_nth(source, entry.str, entry.idx_original) else {
        return AnchorOutcome::Failed(format!("'{}' not found in input", entry.str));
    };
    let original = locate(source, orig_char);

    if segment[2] != original.line as i64 || segment[3] != original.column as i64 {
        return AnchorOutcome::Failed(format!(
            "'{}' at generated {}:{} maps to {}:{}, expected {}:{}",
            entry.str,
            generated.line,
            generated.column,
            segment[2],
            segment[3],
            original.line,
            original.column
        ));
    }

    // The segment covering the end of the string must land on the end of the
    // original string. Upstream tolerates a missing end segment when the string
    // runs to the end of the generated line. Running past the end of the whole
    // output is *not* tolerated: upstream indexes past the end, gets `undefined`,
    // and its `/[\r\n]/` test fails — so `None` is a failure here too.
    let generated_end = generated.column + generated_str.chars().count();
    let Some(end_segment) = segments.iter().find(|s| s[0] == generated_end as i64) else {
        let last_col = segments.last().map(|s| s[0]).unwrap_or(0);
        let next = char_at(output, generated.character + generated_str.chars().count());
        if last_col > generated_end as i64 || !matches!(next, Some('\n') | Some('\r')) {
            return AnchorOutcome::Failed(format!(
                "no end segment at {}:{} for '{}'",
                generated.line, generated_end, entry.str
            ));
        }
        return AnchorOutcome::Ok;
    };
    if end_segment.len() < 4 {
        return AnchorOutcome::Failed(format!(
            "end segment at {}:{} for '{}' has no source position",
            generated.line, generated_end, entry.str
        ));
    }

    let expected_end_column = original.column + entry.str.chars().count();
    if end_segment[2] != original.line as i64 || end_segment[3] != expected_end_column as i64 {
        return AnchorOutcome::Failed(format!(
            "end of '{}' maps to {}:{}, expected {}:{}",
            entry.str, end_segment[2], end_segment[3], original.line, expected_end_column
        ));
    }

    AnchorOutcome::Ok
}

// ============================================================================
// Structural measures
// ============================================================================

/// Number of segments whose original position lies outside its source, plus the
/// total segment count. A position is out of range when its line is past the
/// last line of the source, or its column is past the end of that line (column
/// == line length is legal: it addresses the line terminator).
fn out_of_range(map: &DecodedMap, fallback_source: &str) -> (usize, usize) {
    let contents: Vec<Vec<usize>> = map
        .sources
        .iter()
        .enumerate()
        .map(|(i, _)| {
            let text = map
                .sources_content
                .get(i)
                .and_then(|c| c.as_deref())
                .unwrap_or(fallback_source);
            text.split('\n')
                .map(|l| l.trim_end_matches('\r').chars().count())
                .collect()
        })
        .collect();

    let mut bad = 0;
    let mut total = 0;
    for line in &map.lines {
        for segment in line {
            if segment.len() < 4 {
                continue;
            }
            total += 1;
            let Some(lines) = contents.get(segment[1].max(0) as usize) else {
                bad += 1;
                continue;
            };
            let sl = segment[2].max(0) as usize;
            let sc = segment[3].max(0) as usize;
            match lines.get(sl) {
                Some(len) if sc <= *len => {}
                _ => bad += 1,
            }
        }
    }
    (bad, total)
}

/// Any negative field is invalid and breaks downstream consumers. Upstream
/// checks this for every sample; so do we. Only the four accumulated fields are
/// checked — `vlq_decode_line` leaves the 5th (`names`) as a raw delta, which is
/// legitimately negative when a map's name indices go backwards.
fn has_negative_segment(map: &DecodedMap) -> bool {
    map.lines
        .iter()
        .flatten()
        .any(|s| s.iter().take(4).any(|v| *v < 0))
}

/// How rsvelte's map compares to the official one for identical generated code.
#[derive(Default, Clone, Copy)]
struct Parity {
    /// Official segments with no rsvelte segment at the same generated position
    /// — resolution the official compiler has and rsvelte lost.
    missing: usize,
    /// Present at the same generated position, but pointing somewhere else.
    wrong: usize,
    /// Present and pointing at the same original position.
    exact: usize,
}

impl Parity {
    fn total(&self) -> usize {
        self.missing + self.wrong + self.exact
    }
    fn bad(&self) -> usize {
        self.missing + self.wrong
    }
}

fn parity(theirs: &DecodedMap, ours: &DecodedMap) -> Parity {
    let mut p = Parity::default();
    for (line_no, line) in theirs.lines.iter().enumerate() {
        for segment in line {
            if segment.len() < 4 {
                continue;
            }
            let mine = ours
                .lines
                .get(line_no)
                .and_then(|l| l.iter().find(|s| s[0] == segment[0] && s.len() >= 4));
            match mine {
                None => p.missing += 1,
                Some(m) if m[1..4] == segment[1..4] => p.exact += 1,
                Some(_) => p.wrong += 1,
            }
        }
    }
    p
}

// ============================================================================
// Ratchet
// ============================================================================

fn compatibility_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../compatibility")
}

fn load_ratchet(file: &str) -> Vec<String> {
    let path = compatibility_dir().join(file);
    let text = fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("failed to read {}: {e}", path.display()));
    serde_json::from_str(&text)
        .unwrap_or_else(|e| panic!("failed to parse {}: {e}", path.display()))
}

fn anchor_id(sample: &str, target: Target, index: usize, entry: &Anchor) -> String {
    format!(
        "anchor\t{sample}\t{}\t{index}\t{}",
        target.as_str(),
        entry.str
    )
}

// ============================================================================
// Fixture loading
// ============================================================================

fn sample_names() -> Vec<String> {
    let dir = svelte_path().join("packages/svelte/tests/sourcemaps/samples");
    let mut names: Vec<String> = fs::read_dir(&dir)
        .unwrap_or_else(|e| panic!("failed to read {}: {e}", dir.display()))
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .filter_map(|e| e.file_name().to_str().map(str::to_string))
        .collect();
    names.sort();
    names
}

fn load_input(sample: &str) -> Option<String> {
    let path = svelte_path()
        .join("packages/svelte/tests/sourcemaps/samples")
        .join(sample)
        .join("input.svelte");
    fs::read_to_string(path)
        .ok()
        .map(|s| s.replace("\r\n", "\n"))
}

struct Compiled {
    code: String,
    map: Option<String>,
}

fn compile_sample(input: &str, sample: &str, target: Target) -> Option<Compiled> {
    let generate = match target {
        Target::Client | Target::Css => GenerateMode::Client,
        Target::Server => GenerateMode::Server,
    };
    let options = CompileOptions {
        generate,
        filename: Some("input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    match compile(input, options) {
        Ok(result) => match target {
            Target::Css => {
                let css = result.css?;
                Some(Compiled {
                    code: css.code,
                    map: css.map,
                })
            }
            _ => Some(Compiled {
                code: result.js.code,
                map: result.js.map,
            }),
        },
        Err(e) => {
            eprintln!("  [{sample}/{}] compile error: {e}", target.as_str());
            None
        }
    }
}

/// The oracle is only an oracle if it was compiled the way `compile_sample`
/// compiles. Panics if a sample's recorded `compileOptions` drift away from
/// [`EXPECTED_FIXTURE_COMPILE_OPTIONS`].
fn check_fixture_options(sample: &str) {
    let Some(metadata) = load_fixture_output("sourcemaps", sample, "metadata.json") else {
        panic!("sourcemaps fixture {sample:?} has no metadata.json — regenerate fixtures");
    };
    let parsed: serde_json::Value = serde_json::from_str(&metadata)
        .unwrap_or_else(|e| panic!("sourcemaps fixture {sample:?} metadata.json is not JSON: {e}"));
    let options = parsed
        .get("compileOptions")
        .unwrap_or(&serde_json::Value::Null);
    assert_eq!(
        serde_json::to_string(options).unwrap_or_default(),
        EXPECTED_FIXTURE_COMPILE_OPTIONS,
        "sourcemaps fixture {sample:?} was generated with different compileOptions than this \
         test compiles with — the comparison would be meaningless"
    );
}

/// The official compiler's output for the same input and options, as recorded
/// by `scripts/fixtures/generate-fixtures.mjs`. `None` for `Target::Css` — the
/// fixture generator does not emit CSS output for this category, so CSS anchors
/// are checked against the official `_config.js` expectation alone.
fn official(sample: &str, target: Target) -> Option<Compiled> {
    let (code_file, map_file) = match target {
        Target::Client => ("client.js", "client.js.map"),
        Target::Server => ("server.js", "server.js.map"),
        Target::Css => return None,
    };
    let code = load_fixture_output("sourcemaps", sample, code_file)?;
    let map = load_fixture_output("sourcemaps", sample, map_file);
    Some(Compiled { code, map })
}

// ============================================================================
// Tests
// ============================================================================

/// Everything the gate measures, for one run of the whole category.
#[derive(Default)]
struct Report {
    /// Failing non-numeric ids — `anchor`, plus the hard structural checks
    /// (`compile`, `missing-map`, `undecodable-map`, `negative`, `no-oracle-map`),
    /// none of which currently has a ratchet entry.
    failures: Vec<String>,
    /// `<sample>/<target>` → out-of-range segment count.
    out_of_range: BTreeMap<String, usize>,
    /// `<sample>/<target>` → total segment count, for the printed summary.
    totals: BTreeMap<String, usize>,
    /// `<sample>/<target>` → parity against the official map, for the pairs
    /// whose generated code is byte-identical.
    parity: BTreeMap<String, Parity>,
    /// Anchor ids whose assertion already fails against the *official* map.
    oracle_failures: Vec<String>,
    /// `<sample>/<target>` pairs whose generated code is byte-identical.
    identical_code: Vec<String>,
    /// Samples whose `input.svelte` was read and compiled.
    samples_measured: usize,
    /// Anchors evaluated, across every sample and target.
    anchors_measured: usize,
    /// Diagnostics printed on failure.
    notes: Vec<String>,
}

fn measure() -> Report {
    let mut report = Report::default();

    for sample in sample_names() {
        // Not `continue`: a sample directory without a readable `input.svelte`
        // means the upstream layout moved, and silently measuring less is the
        // failure mode this whole file exists to prevent.
        let input = load_input(&sample).unwrap_or_else(|| {
            panic!(
                "sourcemaps sample {sample:?} has no readable input.svelte — \
                 upstream layout changed?"
            )
        });
        check_fixture_options(&sample);
        report.samples_measured += 1;

        for target in [Target::Client, Target::Server] {
            let key = format!("{sample}/{}", target.as_str());
            let Some(ours) = compile_sample(&input, &sample, target) else {
                report
                    .failures
                    .push(format!("compile\t{sample}\t{}", target.as_str()));
                continue;
            };
            let Some(map_json) = ours.map.as_deref() else {
                report
                    .failures
                    .push(format!("missing-map\t{sample}\t{}", target.as_str()));
                continue;
            };
            let Some(map) = decode_map(map_json) else {
                report
                    .failures
                    .push(format!("undecodable-map\t{sample}\t{}", target.as_str()));
                continue;
            };

            if has_negative_segment(&map) {
                report
                    .failures
                    .push(format!("negative\t{sample}\t{}", target.as_str()));
            }

            let (bad, total) = out_of_range(&map, &input);
            report.out_of_range.insert(key.clone(), bad);
            report.totals.insert(key.clone(), total);

            // Identical generated code ⇒ the official map's segments must all
            // be reproduced.
            if let Some(theirs) = official(&sample, target)
                && theirs.code == ours.code
            {
                report.identical_code.push(key.clone());
                match theirs.map.as_deref().and_then(decode_map) {
                    Some(their_map) => {
                        report.parity.insert(key.clone(), parity(&their_map, &map));
                    }
                    None => report
                        .failures
                        .push(format!("no-oracle-map\t{sample}\t{}", target.as_str())),
                }
            }
        }
    }

    // Anchors — checked against rsvelte's map, and separately against the
    // official map so a setup difference is not blamed on rsvelte.
    for (sample, target, entries) in ANCHORS {
        let input = load_input(sample)
            .unwrap_or_else(|| panic!("anchor sample {sample:?} has no readable input.svelte"));
        let ours = compile_sample(&input, sample, *target);
        let theirs = official(sample, *target);

        for (i, entry) in entries.iter().enumerate() {
            let id = anchor_id(sample, *target, i, entry);
            report.anchors_measured += 1;

            if let Some(theirs) = &theirs
                && let Some(map) = theirs.map.as_deref().and_then(decode_map)
                && let AnchorOutcome::Failed(why) = check_anchor(&input, &theirs.code, &map, entry)
            {
                report.oracle_failures.push(id.clone());
                report.notes.push(format!("  [oracle] {id}: {why}"));
            }

            let outcome = match &ours {
                Some(c) => match c.map.as_deref().and_then(decode_map) {
                    Some(map) => check_anchor(&input, &c.code, &map, entry),
                    None => AnchorOutcome::Failed("no source map produced".to_string()),
                },
                None => AnchorOutcome::Failed("compile failed".to_string()),
            };
            if let AnchorOutcome::Failed(why) = outcome {
                report.failures.push(id.clone());
                report.notes.push(format!("  {id}: {why}"));
            }
        }
    }

    report.failures.sort();
    report.failures.dedup();
    report.oracle_failures.sort();
    report.oracle_failures.dedup();
    report
}

/// Print the full measurement without asserting. Used to (re)derive the
/// ratchet; set `UPDATE_SOURCEMAP_RATCHET=1` to write the two JSON files
/// instead of only printing them.
#[test]
#[ignore = "measurement helper — run explicitly to regenerate the ratchet"]
fn sourcemap_gate_measure() {
    ensure_fixtures_exist();
    let report = measure();

    let mut ratchet: Vec<String> = report
        .failures
        .iter()
        .filter(|id| !report.oracle_failures.contains(id))
        .cloned()
        .collect();
    for (key, count) in &report.out_of_range {
        if *count > 0 {
            let (sample, target) = key.split_once('/').unwrap();
            ratchet.push(format!("out-of-range\t{sample}\t{target}\t{count}"));
        }
    }
    for (key, p) in &report.parity {
        if p.bad() > 0 {
            let (sample, target) = key.split_once('/').unwrap();
            ratchet.push(format!("map-parity\t{sample}\t{target}\t{}", p.bad()));
        }
    }
    ratchet.sort();

    let known_json = serde_json::to_string_pretty(&ratchet).unwrap() + "\n";
    let excluded_json = serde_json::to_string_pretty(&report.oracle_failures).unwrap() + "\n";
    println!("\n=== sourcemap-known-failures.json ===");
    println!("{known_json}");
    println!("=== sourcemap-oracle-excluded.json ===");
    println!("{excluded_json}");

    if std::env::var_os("UPDATE_SOURCEMAP_RATCHET").is_some() {
        let dir = compatibility_dir();
        fs::write(dir.join("sourcemap-known-failures.json"), &known_json).unwrap();
        fs::write(dir.join("sourcemap-oracle-excluded.json"), &excluded_json).unwrap();
        println!("ratchet files written to {}", dir.display());
    }

    println!("\n{}", summary(&report));
    for note in &report.notes {
        println!("{note}");
    }
    for (key, p) in &report.parity {
        println!(
            "  parity {key}: {} exact, {} missing, {} wrong (of {})",
            p.exact,
            p.missing,
            p.wrong,
            p.total()
        );
    }
}

fn summary(report: &Report) -> String {
    let bad: usize = report.out_of_range.values().sum();
    let total: usize = report.totals.values().sum();
    let missing: usize = report.parity.values().map(|p| p.missing).sum();
    let wrong: usize = report.parity.values().map(|p| p.wrong).sum();
    let exact: usize = report.parity.values().map(|p| p.exact).sum();
    let official_total = missing + wrong + exact;
    format!(
        "  out-of-range segments: {bad}/{total} ({:.1}%)\n  \
         byte-identical generated outputs: {}/{}\n  \
         official segments reproduced: {exact}/{official_total} ({:.1}%) \
         — {missing} missing, {wrong} wrong",
        100.0 * bad as f64 / total.max(1) as f64,
        report.identical_code.len(),
        report.totals.len(),
        100.0 * exact as f64 / official_total.max(1) as f64,
    )
}

#[test]
fn sourcemap_gate() {
    ensure_fixtures_exist();

    let known: Vec<String> = load_ratchet("sourcemap-known-failures.json");
    let oracle_excluded: Vec<String> = load_ratchet("sourcemap-oracle-excluded.json");
    let report = measure();

    // Numeric budgets: `<kind>\t<sample>\t<target>\t<count>`.
    let mut oor_budget: BTreeMap<String, usize> = BTreeMap::new();
    let mut parity_budget: BTreeMap<String, usize> = BTreeMap::new();
    let mut plain_known: BTreeSet<&str> = BTreeSet::new();
    for id in &known {
        let parts: Vec<&str> = id.split('\t').collect();
        let numeric = match parts.first() {
            Some(&"out-of-range") => Some(&mut oor_budget),
            Some(&"map-parity") => Some(&mut parity_budget),
            _ => None,
        };
        match numeric {
            Some(target) if parts.len() == 4 => {
                target.insert(
                    format!("{}/{}", parts[1], parts[2]),
                    parts[3]
                        .parse()
                        .unwrap_or_else(|_| panic!("bad count in ratchet id {id:?}")),
                );
            }
            Some(_) => panic!("malformed numeric ratchet id {id:?}"),
            None => {
                plain_known.insert(id.as_str());
            }
        }
    }

    let mut regressions: Vec<String> = Vec::new();
    let mut fixed: Vec<String> = Vec::new();

    let measured: BTreeSet<&str> = report.failures.iter().map(String::as_str).collect();
    let excluded: BTreeSet<&str> = oracle_excluded.iter().map(String::as_str).collect();
    for id in measured.difference(&plain_known) {
        if !excluded.contains(id) {
            regressions.push((*id).to_string());
        }
    }
    for id in plain_known.difference(&measured) {
        fixed.push((*id).to_string());
    }

    let mut check_budget =
        |kind: &str, measured: &BTreeMap<String, usize>, budget: &BTreeMap<String, usize>| {
            for (key, count) in measured {
                let allowed = budget.get(key).copied().unwrap_or(0);
                if *count > allowed {
                    regressions.push(format!(
                        "{kind}\t{}\t{count} (budget {allowed})",
                        key.replace('/', "\t")
                    ));
                } else if *count < allowed {
                    fixed.push(format!(
                        "{kind}\t{}\t{count} < budget {allowed}",
                        key.replace('/', "\t")
                    ));
                }
            }
            // A budgeted pair that vanished is a *regression*, not a win: it
            // means the gate stopped looking, which is exactly how the
            // compatibility report reported 0/0 as success.
            for key in budget.keys() {
                if !measured.contains_key(key) {
                    regressions.push(format!(
                        "{kind}\t{}\tNO LONGER MEASURED (budget {})",
                        key.replace('/', "\t"),
                        budget[key]
                    ));
                }
            }
        };
    check_budget("out-of-range", &report.out_of_range, &oor_budget);
    let parity_bad: BTreeMap<String, usize> = report
        .parity
        .iter()
        .map(|(k, p)| (k.clone(), p.bad()))
        .collect();
    check_budget("map-parity", &parity_bad, &parity_budget);

    // An `anchor` ratchet entry for a sample no longer in `ANCHORS` would
    // otherwise be silently forgiven by the `plain_known.difference` branch
    // above, so deleting an anchor from the table would turn the gate green.
    let anchor_ids: BTreeSet<String> = ANCHORS
        .iter()
        .flat_map(|(sample, target, entries)| {
            entries
                .iter()
                .enumerate()
                .map(move |(i, e)| anchor_id(sample, *target, i, e))
        })
        .collect();
    for id in plain_known.iter().filter(|id| id.starts_with("anchor\t")) {
        if !anchor_ids.contains(*id) {
            regressions.push(format!("{id}\tNO LONGER CHECKED (removed from ANCHORS?)"));
        }
    }
    for id in &oracle_excluded {
        if !report.oracle_failures.contains(id) {
            println!(
                "\nnote: oracle-excluded anchor now passes on the official map, \
                 remove it from sourcemap-oracle-excluded.json:\n  {id}"
            );
        }
    }

    println!("\n=== Sourcemap gate ===");
    println!("{}", summary(&report));
    println!("  known failures: {}", known.len());
    println!("  oracle-excluded anchors: {}", oracle_excluded.len());

    // Floors. These come last so the printed summary above is still visible when
    // one trips, and they are plain asserts rather than ratchet entries because
    // "measured nothing" must never be expressible as a known failure.
    assert!(
        report.samples_measured >= EXPECTED_SAMPLES,
        "only {} sourcemaps samples measured, expected at least {EXPECTED_SAMPLES} — \
         upstream layout changed or the submodule is missing",
        report.samples_measured
    );
    assert!(
        report.anchors_measured >= EXPECTED_ANCHOR_COUNT,
        "only {} anchors evaluated, expected at least {EXPECTED_ANCHOR_COUNT} — \
         were entries removed from ANCHORS?",
        report.anchors_measured
    );
    assert!(
        report.identical_code.len() >= EXPECTED_IDENTICAL_OUTPUTS,
        "only {} byte-identical outputs, expected at least {EXPECTED_IDENTICAL_OUTPUTS} — \
         generated-code parity regressed, so map-parity is now watching less than it was",
        report.identical_code.len()
    );

    if !fixed.is_empty() {
        println!(
            "\n🎉 {} ratchet entries now pass — shrink \
             compatibility/sourcemap-known-failures.json:",
            fixed.len()
        );
        for id in &fixed {
            println!("  {id}");
        }
        println!(
            "  regenerate with: cargo test -p rsvelte_core --test sourcemaps_gate -- \
             --ignored --nocapture sourcemap_gate_measure"
        );
    }

    if !regressions.is_empty() {
        println!("\n❌ {} NEW source-map failures:", regressions.len());
        for id in &regressions {
            println!("  {id}");
        }
        for note in &report.notes {
            println!("{note}");
        }
    }

    assert!(
        regressions.is_empty(),
        "{} source-map regressions (not in compatibility/sourcemap-known-failures.json)",
        regressions.len()
    );
}
