//! The surface layer loses nothing: over every component of the fixture corpus that parses, the
//! token table is the source byte for byte, and each trivia token holds only what its kind says.

use std::path::{Path, PathBuf};

use rsvelte_svelte_syntax::syntax_tree::TokenType;

/// A corpus unit is a directory with one `input.*`; its `expected/` and `actual/` are not searched.
fn inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    let mut directories = Vec::new();
    for e in entries.flatten() {
        let name = e.file_name();
        if e.file_type().is_ok_and(|t| t.is_dir()) {
            directories.push(e.path());
        } else if name == "input.svelte" {
            out.push(e.path());
            return;
        } else if name.to_str().is_some_and(|n| n.starts_with("input.")) {
            return;
        }
    }
    for d in directories {
        inputs(&d, out);
    }
}

enum Verdict {
    Unreadable,
    Rejected,
    Parsed {
        bytes: usize,
        tokens: usize,
        wrong: Option<String>,
    },
}

fn check(f: &Path) -> Verdict {
    // Some corpus files are not UTF-8; the pipeline reports them as unreadable too.
    let Ok(source_text) = std::fs::read_to_string(f) else {
        return Verdict::Unreadable;
    };
    let Ok(c) = rsvelte_svelte_syntax::parse::parse(&source_text) else {
        return Verdict::Rejected;
    };
    let wrong = match c.tokens.check_lossless(&source_text) {
        Err(gap) => Some(format!(
            "{}: untokenized {gap:?} {:?}",
            f.display(),
            gap.text(&source_text)
        )),
        Ok(()) => c.tokens.iter().find_map(|t| {
            let text = t.span.text(&source_text);
            let ok = match t.kind {
                TokenType::Whitespace => text.bytes().all(|b| b.is_ascii_whitespace()),
                TokenType::JavaScriptComment => text.starts_with("//") || text.starts_with("/*"),
                TokenType::MarkupComment => text.starts_with("<!--") && text.ends_with("-->"),
                _ => true,
            };
            (!ok).then(|| format!("{}: {:?} at {:?} is {text:?}", f.display(), t.kind, t.span))
        }),
    };
    Verdict::Parsed {
        bytes: source_text.len(),
        tokens: c.tokens.len(),
        wrong,
    }
}

#[test]
fn every_parsed_component_is_its_tokens() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../../corpus/svelte");
    let mut files = Vec::new();
    inputs(&root, &mut files);
    files.sort_unstable();
    let threads = std::thread::available_parallelism().map_or(1, std::num::NonZero::get);
    let verdicts: Vec<Verdict> = std::thread::scope(|scope| {
        #[expect(
            clippy::needless_collect,
            reason = "spawn every worker before joining any, or they run one after another"
        )]
        let workers: Vec<_> = files
            .chunks(files.len().div_ceil(threads).max(1))
            .map(|chunk| scope.spawn(move || chunk.iter().map(|f| check(f)).collect::<Vec<_>>()))
            .collect();
        workers
            .into_iter()
            .flat_map(|w| w.join().expect("a worker panicked"))
            .collect()
    });
    let (mut parsed, mut rejected, mut unreadable) = (0, 0, 0);
    let (mut bytes, mut tokens) = (0usize, 0usize);
    let mut wrong = Vec::new();
    for v in verdicts {
        match v {
            Verdict::Unreadable => unreadable += 1,
            Verdict::Rejected => rejected += 1,
            Verdict::Parsed {
                bytes: b,
                tokens: t,
                wrong: w,
            } => {
                parsed += 1;
                bytes += b;
                tokens += t;
                wrong.extend(w);
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
