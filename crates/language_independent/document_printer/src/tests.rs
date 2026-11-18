use oxc_allocator::Allocator;
use oxc_formatter_core::{CoreFormatOptions, IndentStyle, LineWidth};

use crate::{Embedding, LayoutInstructionIdentifier, LayoutInstructions};

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

/// Prints `root` the way the formatters do, with oxc's printer.
fn print(
    d: &LayoutInstructions,
    root: LayoutInstructionIdentifier,
    options: CoreFormatOptions,
) -> String {
    let allocator = Allocator::default();
    Embedding::new(&allocator, options)
        .print(d, root, 0)
        .expect("oxc's printer takes the document")
}

fn width(columns: u16) -> CoreFormatOptions {
    CoreFormatOptions {
        line_width: LineWidth::try_from(columns).expect("a valid width"),
        ..CoreFormatOptions::default()
    }
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
    assert_eq!(print(&d, outer, width(80)), "a x");
}

#[test]
fn group_prints_flat_when_it_fits_and_breaks_otherwise() {
    let mut d = LayoutInstructions::new();
    let g = call(&mut d, &["a", "b"]);
    assert_eq!(print(&d, g, width(80)), "f(a, b)");
    let mut d = LayoutInstructions::new();
    let long = "x".repeat(50);
    let g = call(&mut d, &[&long, &long]);
    assert_eq!(
        print(&d, g, width(80)),
        format!("f(\n  {long},\n  {long}\n)")
    );
}

#[test]
fn hardline_breaks_enclosing_groups() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a");
    let hard = d.hardline();
    let b = d.lit("b");
    let inner = d.concat(&[a, hard, b]);
    let indentation = d.indent(inner);
    let line = d.line();
    let group = d.group(&[indentation, line]);
    let options = CoreFormatOptions {
        indent_style: IndentStyle::Tab,
        ..width(80)
    };
    assert_eq!(print(&d, group, options), "a\n\tb\n");
}

#[test]
fn text_parts_is_the_text_of_its_parts_joined() {
    let mut d = LayoutInstructions::new();
    let a = d.text_parts(&["</", "div", ">"]);
    let b = d.text_parts(&[]);
    assert_eq!((d.as_str(a), d.as_str(b)), (Some("</div>"), Some("")));
    let root = d.concat(&[a, b]);
    assert_eq!(print(&d, root, width(80)), "</div>");
}

#[test]
fn literal_line_keeps_trailing_space_and_skips_indentation() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a ");
    let l = d.literalline();
    let b = d.lit("b");
    let inner = d.concat(&[a, l, b]);
    let indentation = d.indent(inner);
    assert_eq!(print(&d, indentation, width(80)), "a \nb");
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
    let options = width(20);
    let out = print(&d, f, options);
    assert!(out.lines().all(|l| l.len() <= 20), "{out}");
    assert_eq!(out.lines().next().unwrap(), "word word word word");
}

#[test]
fn fill_breaks_the_separator_after_content_holding_a_broken_group() {
    let mut d = LayoutInstructions::new();
    let a = d.lit("a");
    let line = d.line();
    let b = d.lit("b");
    let broken = d.break_parent();
    let content = d.group(&[a, line, b, broken]);
    let sep = d.line();
    let c = d.lit("c");
    let filled = d.fill(&[content, sep, c]);
    assert_eq!(print(&d, filled, width(80)), "a\nb\nc");
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
    assert!(print(&d, root, width(80)).ends_with("\nbroken"));
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
    assert_eq!(print(&d, root, width(80)), "a");
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
        assert_eq!(print(&d, root, width(80)), "a".repeat(DEPTH));
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
