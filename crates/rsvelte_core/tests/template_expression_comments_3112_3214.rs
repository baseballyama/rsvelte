//! Server: comments written inside a template expression's `{ … }`.
//!
//! Upstream keeps ONE esrap comment cursor over the whole file, so a comment
//! written inside `{ … }` is flushed before the next node the printer reaches
//! that carries a location — including when the expression it was written in
//! constant-folds away and the flush lands on the following one. Every expected
//! string here is the official compiler's output for the same source
//! (`generate: 'server'`, Svelte 5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("T.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SCRIPT: &str = "<script>\n\tlet s = 'a';\n\tlet n = 0;\n\tconst f = (x) => x + 1;\n\tconst h = () => {};\n</script>\n";

#[test]
fn a_leading_comment_in_an_attribute_expression_is_kept() {
    let out = server(&format!("{SCRIPT}\n<div title={{/* c */ s}}>x</div>\n"));
    assert!(
        out.contains("$.attr('title', /* c */ s)"),
        "expected the comment before the value:\n{out}"
    );
}

#[test]
fn a_trailing_comment_in_an_attribute_expression_is_kept() {
    let out = server(&format!("{SCRIPT}\n<div title={{s /* c */}}>x</div>\n"));
    assert!(
        out.contains("$.attr('title', s /* c */)"),
        "expected the comment after the value:\n{out}"
    );
}

/// Every attribute the reported grid carries lands the comment the same way.
#[test]
fn the_placement_does_not_depend_on_the_attribute() {
    for (markup, expected) in [
        (
            "<div class={/* c */ s}>x</div>",
            "$.attr_class($.clsx(/* c */ s))",
        ),
        ("<div style={/* c */ s}>x</div>", "$.attr_style(/* c */ s)"),
        (
            "<div data-x={/* c */ s}>x</div>",
            "$.attr('data-x', /* c */ s)",
        ),
        ("<a href={/* c */ s}>x</a>", "$.attr('href', /* c */ s)"),
        ("<input value={/* c */ s} />", "$.attr('value', /* c */ s)"),
    ] {
        let out = server(&format!("{SCRIPT}\n{markup}\n"));
        assert!(out.contains(expected), "{markup}\nwant {expected}\n{out}");
    }
}

/// A folded expression has no node left to flush against, so its comment goes
/// to the next one that survives — upstream's cursor never rewinds.
#[test]
fn a_folded_expression_hands_its_comment_to_the_next_one() {
    let out = server(&format!(
        "{SCRIPT}\n<p>{{n /* c */}}<span>{{f(n)}}</span></p>\n"
    ));
    assert!(
        out.contains("$.escape(/* c */ f(n))"),
        "expected the comment on the surviving expression:\n{out}"
    );
}

/// The reported shape puts the two tags on different lines, and the line
/// distance is what makes upstream break the call open.
#[test]
fn the_carried_comment_keeps_its_source_line_distance() {
    let out = server(&format!(
        "{SCRIPT}\n<div>\n\t{{n /* b */}}\n\t<span>{{f(n)}}</span>\n</div>\n"
    ));
    assert!(
        out.contains("$.escape(\n\t\t/* b */\n\t\tf(n)\n\t)"),
        "expected the multi-line flush:\n{out}"
    );
}

/// Nothing survives the fold, so both compilers drop the comment.
#[test]
fn a_folded_expression_with_no_successor_drops_its_comment() {
    let out = server(&format!("{SCRIPT}\n<p>{{n /* c */}}</p>\n"));
    assert!(!out.contains("/* c */"), "expected no comment:\n{out}");
}

/// Upstream copies the instance script's `loc` onto the component block to get
/// comments printed at all, so a component with no `<script>` has none to copy
/// and the whole list dies. A `<script module>` is not the one it copies.
#[test]
fn a_component_with_no_instance_script_drops_the_comment() {
    for src in [
        "<div title={/* c */ s}>x</div>\n",
        "<p>{q /* c */}</p>\n",
        "<script module>\n\tlet z = 1;\n</script>\n\n<p>{q /* c */}</p>\n",
    ] {
        let out = server(src);
        assert!(!out.contains("/* c */"), "{src}\n{out}");
    }
}

/// The expression is stamped at ONE address, so a comment written *inside* it
/// cannot be placed where upstream puts it. It is dropped rather than pushed
/// past the node it was written in — the pre-existing behaviour, recorded here
/// as the boundary of the fix.
#[test]
fn an_interior_comment_is_still_dropped() {
    let out = server(&format!("{SCRIPT}\n<p>{{f(n) /* c */ + 1}}</p>\n"));
    assert!(out.contains("$.escape(f(n) + 1)"), "{out}");
    let out = server(&format!("{SCRIPT}\n<p>{{f(/* c */ n)}}</p>\n"));
    assert!(out.contains("$.escape(f(n))"), "{out}");
}

/// A statement that owns no comment still has to hold its position, or the
/// location-less body of `const h = () => {}` kills the cursor before the
/// template is printed.
#[test]
fn a_location_less_body_before_the_template_does_not_kill_the_cursor() {
    let out = server(&format!("{SCRIPT}\n<div title={{/* c */ s}}>x</div>\n"));
    assert!(out.contains("const h = () => {};"), "{out}");
    assert!(out.contains("/* c */"), "the cursor was killed:\n{out}");
}
