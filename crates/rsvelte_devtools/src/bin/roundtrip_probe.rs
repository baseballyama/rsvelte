//! Development probe: measure how often esrap re-printing a `<script>` body reproduces
//! the source text verbatim (the formatting the current text pipeline preserves).
//!
//! Not production code — measurement only. Run:
//!   cargo run --release -p `rsvelte_devtools` --bin `roundtrip_probe` -- [out.jsonl]

use std::fs;
use std::path::PathBuf;

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};

#[derive(Default)]
struct Counts {
    files: usize,
    scripts: usize,
    ts_skipped: usize,
    empty_skipped: usize,
    parse_fail: usize,
    exact: usize,
    // mismatch categories
    ws_indent_blank: usize,
    ws_linebreak: usize,
    content_comment: usize,
    content_other: usize,
}

fn main() {
    // `roundtrip_probe <file.svelte>`: print that file's client output.
    if let Some(p) = std::env::args().nth(1)
        && p.ends_with(".svelte")
    {
        let content = fs::read_to_string(&p).unwrap();
        let out = rsvelte_core::compile(
            &content,
            rsvelte_core::CompileOptions {
                generate: rsvelte_core::GenerateMode::Client,
                filename: Some(p),
                ..Default::default()
            },
        )
        .unwrap();
        print!("{}", out.js.code);
        return;
    }
    let out_path = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "/tmp/roundtrip.jsonl".to_string());
    let files = collect_files();
    let mut c = Counts::default();
    let mut records: Vec<String> = Vec::new();

    let parse_opts = ParseOptions {
        modern: true,
        skip_expression_loc: true,
        defer_script_parse: true,
        ..Default::default()
    };

    for (path, content) in &files {
        let alloc = oxc_allocator::Allocator::default();
        let Ok(ast) = parse(content, &alloc, parse_opts) else {
            continue;
        };
        c.files += 1;
        let mut scripts: Vec<(&str, &rsvelte_core::ast::template::Script)> = Vec::new();
        if let Some(s) = ast.instance.as_ref() {
            scripts.push(("instance", s));
        }
        if let Some(s) = ast.module.as_ref() {
            scripts.push(("module", s));
        }
        for (kind, script) in scripts {
            c.scripts += 1;
            if script.is_typescript {
                c.ts_skipped += 1;
                continue;
            }
            let trimmed = script.raw_content.trim();
            if trimmed.is_empty() {
                c.empty_skipped += 1;
                continue;
            }
            let verbatim = dedent(trimmed);

            let a = oxc_allocator::Allocator::default();
            let ret = oxc_parser::Parser::new(&a, &verbatim, oxc_span::SourceType::mjs()).parse();
            if !ret.diagnostics.is_empty() {
                c.parse_fail += 1;
                continue;
            }
            let printed = rsvelte_esrap::print(&ret.program, &verbatim);
            let printed = printed.trim_end().to_string();
            let verbatim_cmp = verbatim.trim_end().to_string();

            if printed == verbatim_cmp {
                c.exact += 1;
                continue;
            }
            let cat = classify(&verbatim_cmp, &printed, !ret.program.comments.is_empty());
            match cat {
                Cat::WsIndentBlank => c.ws_indent_blank += 1,
                Cat::WsLineBreak => c.ws_linebreak += 1,
                Cat::ContentComment => c.content_comment += 1,
                Cat::ContentOther => c.content_other += 1,
            }
            let (ctx_a, ctx_b) = first_diff_context(&verbatim_cmp, &printed);
            records.push(format!(
                "{{\"file\":{},\"kind\":\"{}\",\"cat\":\"{}\",\"before\":{},\"after\":{}}}",
                json_str(path),
                kind,
                cat.name(),
                json_str(&ctx_a),
                json_str(&ctx_b)
            ));
        }
    }

    let _ = fs::write(out_path.clone(), records.join("\n"));

    let compared =
        c.exact + c.ws_indent_blank + c.ws_linebreak + c.content_comment + c.content_other;
    println!("files parsed:        {}", c.files);
    println!("scripts total:       {}", c.scripts);
    println!("  typescript skipped:{}", c.ts_skipped);
    println!("  empty skipped:     {}", c.empty_skipped);
    println!("  oxc parse fail:    {}", c.parse_fail);
    println!("scripts compared:    {compared}");
    println!(
        "EXACT:               {} ({:.2}%)",
        c.exact,
        c.exact as f64 / compared as f64 * 100.0
    );
    println!(
        "  ws indent/blank:   {} ({:.2}%)",
        c.ws_indent_blank,
        c.ws_indent_blank as f64 / compared as f64 * 100.0
    );
    println!(
        "  ws line-breaking:  {} ({:.2}%)",
        c.ws_linebreak,
        c.ws_linebreak as f64 / compared as f64 * 100.0
    );
    println!(
        "  content (comment): {} ({:.2}%)",
        c.content_comment,
        c.content_comment as f64 / compared as f64 * 100.0
    );
    println!(
        "  content (other):   {} ({:.2}%)",
        c.content_other,
        c.content_other as f64 / compared as f64 * 100.0
    );
    println!("jsonl: {out_path}");

    // === Pass 2: what does the CURRENT client pipeline actually emit? ===
    // The default client codegen converts the whole IR (including the instance
    // script `Raw` blob) to an oxc AST and prints it with esrap. Run with
    // RSVELTE_CLIENT_TO_OXC_DEBUG=1 and count the fallbacks on stderr.
    let mut ok = 0usize;
    let mut err = 0usize;
    // Output digest per file, so a before/after run can prove byte-equality.
    let mut digests: Vec<String> = Vec::new();
    for (path, content) in &files {
        let r = rsvelte_core::compile(
            content,
            rsvelte_core::CompileOptions {
                generate: rsvelte_core::GenerateMode::Client,
                filename: Some(path.clone()),
                ..Default::default()
            },
        );
        match r {
            Ok(out) => {
                ok += 1;
                digests.push(format!("{}\t{:016x}", short(path), fnv1a(&out.js.code)));
            }
            Err(_) => err += 1,
        }
    }
    println!("\n=== client compile ===");
    println!("compiled ok: {ok}, compile error: {err}");
    if let Some(p) = std::env::args().nth(2) {
        let _ = fs::write(p, digests.join("\n"));
    }
}

fn short(path: &str) -> &str {
    match path.find("packages/svelte/tests/") {
        Some(i) => &path[i..],
        None => path,
    }
}

fn fnv1a(s: &str) -> u64 {
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for b in s.as_bytes() {
        h ^= u64::from(*b);
        h = h.wrapping_mul(0x1000_0000_01b3);
    }
    h
}

enum Cat {
    WsIndentBlank,
    WsLineBreak,
    ContentComment,
    ContentOther,
}

impl Cat {
    const fn name(&self) -> &'static str {
        match self {
            Self::WsIndentBlank => "ws_indent_blank",
            Self::WsLineBreak => "ws_linebreak",
            Self::ContentComment => "content_comment",
            Self::ContentOther => "content_other",
        }
    }
}

fn classify(a: &str, b: &str, has_comments: bool) -> Cat {
    let strip_ws = |s: &str| -> String { s.chars().filter(|ch| !ch.is_whitespace()).collect() };
    if strip_ws(a) == strip_ws(b) {
        // Whitespace-only. Distinguish "same line structure, different indent /
        // blank lines" from "different line breaking".
        let lines = |s: &str| -> Vec<String> {
            s.lines()
                .map(|l| l.trim().to_string())
                .filter(|l| !l.is_empty())
                .collect()
        };
        if lines(a) == lines(b) {
            Cat::WsIndentBlank
        } else {
            Cat::WsLineBreak
        }
    } else if has_comments {
        Cat::ContentComment
    } else {
        Cat::ContentOther
    }
}

fn first_diff_context(a: &str, b: &str) -> (String, String) {
    let ab = a.as_bytes();
    let bb = b.as_bytes();
    let mut i = 0;
    while i < ab.len() && i < bb.len() && ab[i] == bb[i] {
        i += 1;
    }
    let start = a[..i].rfind('\n').map_or(0, |p| p + 1);
    let clip = |s: &str, from: usize| -> String {
        let from = from.min(s.len());
        let s = &s[from..];
        let end = s.char_indices().nth(160).map_or(s.len(), |(p, _)| p);
        s[..end].to_string()
    };
    let start_b = if start <= b.len() { start } else { 0 };
    (clip(a, start), clip(b, start_b))
}

/// Replicate `formatting::detect_base_indent` + `strip_indent` (`indent_level` 1
/// minus the added tab), i.e. what the current fast path preserves.
fn dedent(code: &str) -> String {
    let mut min_indent: Option<usize> = None;
    for (i, line) in code.lines().enumerate() {
        if i == 0 || line.trim().is_empty() {
            continue;
        }
        let indent = line.len() - line.trim_start().len();
        min_indent = Some(min_indent.map_or(indent, |m: usize| m.min(indent)));
    }
    let base = min_indent.unwrap_or(0);
    let mut out = String::with_capacity(code.len());
    for (i, line) in code.lines().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        if base == 0 || line.len() <= base {
            out.push_str(line);
            continue;
        }
        let leading = line.len() - line.trim_start().len();
        if leading >= base {
            out.push_str(&line[base..]);
        } else {
            out.push_str(line.trim_start());
        }
    }
    out
}

fn json_str(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for ch in s.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                use std::fmt::Write as _;
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn collect_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let dir = base.join("submodules/svelte/packages/svelte/tests");
    let mut files = Vec::new();
    collect_svelte_files(&dir, &mut files);
    files
}

fn collect_svelte_files(dir: &std::path::Path, files: &mut Vec<(String, String)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect_svelte_files(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push((path.display().to_string(), content));
            }
        }
    }
}
