use crate::{
    GroupDecision, LayoutInstructionIdentifier, LayoutInstructions, PrintOptions, Refused,
    TraceEvent, TraceMode,
};

fn call(d: &mut LayoutInstructions, arguments: &[&str]) -> LayoutInstructionIdentifier {
    let open = d.lit("f(");
    let mut inner = Vec::new();
    for (i, a) in arguments.iter().enumerate() {
        if i > 0 {
            inner.push(d.lit(","));
            inner.push(d.line());
        }
        inner.push(d.text(a));
    }
    let inner = d.concat(&inner);
    let soft = d.softline();
    let body = d.concat(&[soft, inner]);
    let body = d.indent(body);
    let soft2 = d.softline();
    let close = d.lit(")");
    d.group(&[open, body, soft2, close])
}

fn print(
    d: &LayoutInstructions,
    root: LayoutInstructionIdentifier,
    options: &PrintOptions,
) -> String {
    d.print(root, options).expect("no flat-only layouts")
}

/// Prettier's `propagateBreaks` breaks a group around a group built broken, not only around
/// hard lines: Prettier prints this `x\ny`.
#[test]
fn a_group_built_broken_breaks_its_parent() {
    let mut d = LayoutInstructions::new();
    let (x, y) = (d.lit("x"), d.lit("y"));
    let inner = d.group_broken(&[y]);
    let line = d.line();
    let outer = d.group(&[x, line, inner]);
    assert!(d.will_break(outer));
    assert_eq!(print(&d, outer, &PrintOptions::default()), "x\ny");
}

/// Prettier propagates breaks at print time, after a trim: a hard line trimmed away breaks
/// nothing, here or in the groups around it.
#[test]
fn a_trimmed_hard_line_no_longer_breaks() {
    let mut d = LayoutInstructions::new();
    let (a, x) = (d.lit("a"), d.lit("x"));
    let hard = d.hardline();
    let inner = d.concat(&[x, hard]);
    let line = d.line();
    let outer = d.group(&[a, line, inner]);
    let mut docs = vec![outer];
    d.trim_right(&mut docs, LayoutInstructions::is_line);
    assert!(!d.will_break(inner) && !d.will_break(outer));
    assert_eq!(print(&d, outer, &PrintOptions::default()), "a x");
}

#[test]
fn group_prints_flat_when_it_fits_and_breaks_otherwise() {
    let mut d = LayoutInstructions::new();
    let g = call(&mut d, &["a", "b"]);
    assert_eq!(print(&d, g, &PrintOptions::default()), "f(a, b)");
    let mut d = LayoutInstructions::new();
    let long = "x".repeat(50);
    let g = call(&mut d, &[&long, &long]);
    assert_eq!(
        print(&d, g, &PrintOptions::default()),
        format!("f(\n  {long},\n  {long}\n)")
    );
}

#[test]
fn traced_print_uses_the_production_printer() {
    let mut d = LayoutInstructions::new();
    let long = "x".repeat(50);
    let g = call(&mut d, &[&long, &long]);
    let mut trace = Vec::new();
    let out = d
        .print_with_trace(g, &PrintOptions::default(), &mut trace)
        .expect("no flat-only layouts");
    assert_eq!(out, format!("f(\n  {long},\n  {long}\n)"));
    assert_eq!(
        trace,
        vec![TraceEvent::Group {
            document: g,
            position: 0,
            remaining: 80,
            mode: TraceMode::Break,
            decision: GroupDecision::DoesNotFit,
        }]
    );
}

#[test]
fn hardline_breaks_enclosing_groups_and_trims_trailing_space() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a ");
    let hard = d.hardline();
    let b = d.lit("b");
    let inner = d.concat(&[a, hard, b]);
    let indentation = d.indent(inner);
    let line = d.line();
    let group = d.group(&[indentation, line]);
    let options = PrintOptions {
        indent_spaces: None,
        ..Default::default()
    };
    assert_eq!(print(&d, group, &options), "a\n\tb\n");
}

#[test]
fn text_parts_is_the_text_of_its_parts_joined() {
    let mut d = LayoutInstructions::new();
    let a = d.text_parts(&["</", "div", ">"]);
    let b = d.text_parts(&[]);
    assert_eq!((d.as_str(a), d.as_str(b)), (Some("</div>"), Some("")));
    let root = d.concat(&[a, b]);
    assert_eq!(print(&d, root, &PrintOptions::default()), "</div>");
}

#[test]
fn literal_line_keeps_trailing_space_and_skips_indentation() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a ");
    let l = d.literalline();
    let b = d.lit("b");
    let inner = d.concat(&[a, l, b]);
    let indentation = d.indent(inner);
    assert_eq!(print(&d, indentation, &PrintOptions::default()), "a \nb");
}

#[test]
fn fill_packs_words() {
    let mut d = LayoutInstructions::new();
    let mut items = Vec::new();
    for i in 0..30 {
        if i > 0 {
            items.push(d.line());
        }
        items.push(d.lit("word"));
    }
    let f = d.fill(&items);
    let options = PrintOptions {
        width: 20,
        ..Default::default()
    };
    let out = print(&d, f, &options);
    assert!(out.lines().all(|l| l.len() <= 20), "{out}");
    assert_eq!(out.lines().next().unwrap(), "word word word word");
}

#[test]
fn fill_breaks_the_separator_after_content_holding_a_broken_group() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a");
    let line = d.line();
    let b = d.lit("b");
    let content = d.group_broken(&[a, line, b]);
    let sep = d.line();
    let c = d.lit("c");
    let filled = d.fill(&[content, sep, c]);
    assert_eq!(print(&d, filled, &PrintOptions::default()), "a\nb\nc");
}

#[test]
fn if_break_follows_a_named_group() {
    let mut d = LayoutInstructions::new();
    let identifier = d.new_group_identifier();
    let long = d.text(&"x".repeat(90));
    let l = d.line();
    let g = d.group_with_identifier(&[long, l], identifier);
    let yes = d.lit("broken");
    let no = d.lit("flat");
    let ib = d.if_break_of(yes, no, identifier);
    let root = d.concat(&[g, ib]);
    assert!(print(&d, root, &PrintOptions::default()).ends_with("\nbroken"));
}

#[test]
fn flat_only_refuses_when_it_does_not_fit() {
    let mut d = LayoutInstructions::new();
    let short = d.lit("short");
    let ok = d.flat_only(short);
    assert_eq!(d.print(ok, &PrintOptions::default()), Ok("short".into()));
    let mut d = LayoutInstructions::new();
    let long = d.text(&"x".repeat(90));
    let bad = d.flat_only(long);
    assert_eq!(d.print(bad, &PrintOptions::default()), Err(Refused));
}

#[test]
fn trim_descends_into_the_last_part() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a");
    let h = d.hardline();
    let inner = d.concat(&[a, h]);
    let mut docs = vec![inner];
    d.trim_right(&mut docs, LayoutInstructions::is_line);
    let root = d.concat(&docs);
    assert_eq!(print(&d, root, &PrintOptions::default()), "a");
}

#[test]
fn deeply_nested_documents_trim_on_a_small_stack() {
    const DEPTH: usize = 100_000;
    for left in [false, true] {
        let mut d = LayoutInstructions::new();
        let (a, line) = (d.lit("a"), d.line());
        // Each level is `a`, then the level inside it, then a line: mirrored when trimming left.
        let level = |d: &mut LayoutInstructions, inner: Option<LayoutInstructionIdentifier>| {
            let mut items: Vec<_> = std::iter::once(a).chain(inner).chain([line]).collect();
            if left {
                items.reverse();
            }
            d.concat(&items)
        };
        let mut inner = level(&mut d, None);
        for _ in 1..DEPTH {
            inner = level(&mut d, Some(inner));
        }
        let mut docs = if left {
            vec![line, inner]
        } else {
            vec![inner, line]
        };
        let (d, root) = std::thread::scope(|scope| {
            std::thread::Builder::new()
                .stack_size(1 << 20)
                .spawn_scoped(scope, move || {
                    // Lines are empty docs, so no whitespace test is needed to trim them.
                    if left {
                        d.trim_left(&mut docs, |_, _| false);
                    } else {
                        d.trim_right(&mut docs, |_, _| false);
                    }
                    let root = d.concat(&docs);
                    (d, root)
                })
                .expect("spawns")
                .join()
                .expect("trims within a 1 MiB stack")
        });
        assert_eq!(print(&d, root, &PrintOptions::default()), "a".repeat(DEPTH));
    }
}

#[test]
fn deeply_nested_lines_are_judged_on_a_small_stack() {
    const DEPTH: usize = 100_000;
    let mut d = LayoutInstructions::new();
    let line = d.line();
    let mut lines = d.concat(&[line]);
    for _ in 1..DEPTH {
        lines = d.concat(&[lines, line]);
    }
    let a = d.lit("a");
    let not_lines = d.concat(&[lines, a]);
    let mut wrapped = line;
    for _ in 1..DEPTH {
        wrapped = d.indent(wrapped);
    }
    let verdicts = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 20)
            .spawn_scoped(scope, || {
                (d.is_line(lines), d.is_line(not_lines), d.is_empty(wrapped))
            })
            .expect("spawns")
            .join()
            .expect("judges within a 1 MiB stack")
    });
    assert_eq!(verdicts, (true, false, true));
}

/// Prettier's `fits` charges a line's space only when a string follows it. A fill whose words sit
/// in the separator slots (`[line, "aa", line, "bb", …]`) therefore lets one word run past the
/// width, and two lines in a row cost one space. Expected outputs from Prettier 3.9.10's
/// `printDocToString` at `printWidth: 10`.
#[test]
fn a_line_costs_its_space_only_when_text_follows() {
    let options = PrintOptions {
        width: 10,
        indent_spaces: Some(2),
        tab_width: 2,
    };
    let mut docs = LayoutInstructions::new();
    let lead = docs.lit("xxxxxxx");
    let mut parts = Vec::new();
    for word in ["aa", "bb", "cc"] {
        parts.push(docs.line());
        parts.push(docs.text(word));
    }
    let fill = docs.fill(&parts);
    let root = docs.concat(&[lead, fill]);
    assert_eq!(print(&docs, root, &options), "xxxxxxx aa bb\ncc");

    let mut docs = LayoutInstructions::new();
    let (lead, tail) = (docs.lit("xxxxxxx"), docs.lit("a"));
    let (first, second) = (docs.line(), docs.line());
    let root = docs.group(&[lead, first, second, tail]);
    assert_eq!(print(&docs, root, &options), "xxxxxxx  a");

    let mut docs = LayoutInstructions::new();
    let (lead, tail) = (docs.lit("xxxxxxxxx"), docs.lit("z"));
    let line = docs.line();
    let group = docs.group(&[lead, line]);
    let root = docs.concat(&[group, tail]);
    assert_eq!(print(&docs, root, &options), "xxxxxxxxx\nz");
}

/// A flat-only layout promises to print flat up to its first forced break; a group inside it
/// that would have to break there is refused, not broken.
#[test]
fn a_flat_only_layout_refuses_a_group_that_does_not_fit() {
    let options = PrintOptions {
        width: 8,
        indent_spaces: Some(2),
        tab_width: 2,
    };
    let build = |flat_only: bool| {
        let mut docs = LayoutInstructions::new();
        let (open, word, close) = (docs.lit("("), docs.text("aaaaaaaaaa"), docs.lit(")"));
        let soft = docs.softline();
        let inner = docs.group(&[open, soft, word, close]);
        let hard = docs.hardline();
        let body = docs.concat(&[hard, inner]);
        let root = if flat_only {
            docs.flat_only(body)
        } else {
            body
        };
        (docs, root)
    };
    let (docs, root) = build(true);
    docs.print(root, &options).unwrap_err();
    let (docs, root) = build(false);
    assert_eq!(print(&docs, root, &options), "\n(\naaaaaaaaaa)");
}
