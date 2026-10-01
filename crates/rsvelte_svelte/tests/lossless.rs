//! The surface layer loses nothing: over every component of the fixture corpus that parses, the
//! token table is the source byte for byte, and each trivia token holds only what its kind says.

use std::path::{Path, PathBuf};

use rsvelte_svelte::syntax::syntax_tree::TokenType;

fn inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for e in entries.flatten() {
        let p = e.path();
        if p.is_dir() {
            inputs(&p, out);
        } else if p.file_name().is_some_and(|n| n == "input.svelte") {
            out.push(p);
        }
    }
}

#[test]
fn every_parsed_component_is_its_tokens() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/svelte");
    let mut files = Vec::new();
    inputs(&root, &mut files);
    let (mut parsed, mut rejected, mut unreadable) = (0, 0, 0);
    let (mut bytes, mut tokens) = (0usize, 0usize);
    let mut wrong = Vec::new();
    for f in &files {
        // Some corpus files are not UTF-8; the pipeline reports them as unreadable too.
        let Ok(source_text) = std::fs::read_to_string(f) else {
            unreadable += 1;
            continue;
        };
        let Ok(c) = rsvelte_svelte::syntax::parse::parse(&source_text) else {
            rejected += 1;
            continue;
        };
        parsed += 1;
        bytes += source_text.len();
        tokens += c.tokens.len();
        if let Err(gap) = c.tokens.check_lossless(&source_text) {
            wrong.push(format!(
                "{}: untokenized {gap:?} {:?}",
                f.display(),
                gap.text(&source_text)
            ));
            continue;
        }
        for t in c.tokens.iter() {
            let text = t.span.text(&source_text);
            let ok = match t.kind {
                TokenType::Whitespace => text.bytes().all(|b| b.is_ascii_whitespace()),
                TokenType::JavaScriptComment => text.starts_with("//") || text.starts_with("/*"),
                TokenType::MarkupComment => text.starts_with("<!--") && text.ends_with("-->"),
                _ => true,
            };
            if !ok {
                wrong.push(format!(
                    "{}: {:?} at {:?} is {text:?}",
                    f.display(),
                    t.kind,
                    t.span
                ));
                break;
            }
        }
    }
    eprintln!(
        "{} files: {parsed} parsed, {rejected} rejected by the parser, {unreadable} unreadable; \
         {tokens} tokens over {bytes} bytes",
        files.len()
    );
    // Most of the corpus uses syntax the parser rejects; this only catches an absent corpus.
    assert!(
        parsed > 1_000,
        "only {parsed} components parsed; is the fixture corpus generated?"
    );
    assert!(
        wrong.is_empty(),
        "{} of {parsed}:\n{}",
        wrong.len(),
        wrong[..wrong.len().min(20)].join("\n")
    );
}
