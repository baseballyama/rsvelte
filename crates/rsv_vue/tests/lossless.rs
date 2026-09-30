//! The surface layer loses nothing: over every component of the Vue fixtures, the token table is
//! the source byte for byte, and each trivia token holds only what its kind says.

use std::path::{Path, PathBuf};

use rsv_vue::ast::Tk;

fn inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for e in entries.flatten() {
        let p = e.path();
        if p.is_dir() {
            inputs(&p, out);
        } else if p.file_name().is_some_and(|n| n == "input.vue") {
            out.push(p);
        }
    }
}

#[test]
fn every_component_is_its_tokens() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/vue");
    let mut files = Vec::new();
    inputs(&root, &mut files);
    let mut wrong = Vec::new();
    for f in &files {
        let src = std::fs::read_to_string(f).expect("fixture inputs are UTF-8");
        let c = match rsv_vue::parse::parse(&src) {
            Ok(c) => c,
            Err(e) => {
                wrong.push(format!("{}: {} at {:?}", f.display(), e.message, e.span));
                continue;
            }
        };
        if let Err(gap) = c.tokens.check_lossless(&src) {
            wrong.push(format!(
                "{}: untokenized {gap:?} {:?}",
                f.display(),
                gap.text(&src)
            ));
            continue;
        }
        for t in c.tokens.iter() {
            let text = t.span.text(&src);
            let ok = match t.kind {
                Tk::Whitespace => text.bytes().all(|b| b.is_ascii_whitespace()),
                Tk::JsComment => text.starts_with("//") || text.starts_with("/*"),
                Tk::HtmlComment => text.starts_with("<!--") && text.ends_with("-->"),
                Tk::InterpolationOpen => text == "{{",
                Tk::InterpolationClose => text == "}}",
                Tk::ForKeyword => matches!(text, "in" | "of"),
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
    // The hand-written units all parse; this only catches an absent fixture directory.
    assert!(files.len() >= 12, "only {} Vue fixtures found", files.len());
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
