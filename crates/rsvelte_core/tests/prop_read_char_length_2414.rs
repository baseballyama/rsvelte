//! The client prop-read scan walks a `Vec<char>` but measured the prop name
//! with `prop_name.len()` — a *byte* length. For a non-ASCII prop name the
//! cursor advanced past the end of the name, dropping source text and
//! mis-answering every guard that takes the name's length.
//!
//! Each test below is written so that a fix which repairs only one of the two
//! causes (the cursor length, or `is_shadowed_by_function_param`'s `var_len`)
//! still fails the other.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// A legacy `export let` prop plus a `$:` statement — the only route that
/// reaches the text-based prop-read scan.
fn legacy(name: &str, reactive_body: &str) -> String {
    let body = reactive_body.replace("NAME", name);
    let src = format!(
        "<script>\n\texport let {name} = 0;\n\tlet out;\n\t{body}\n</script>\n<p>{{out}}</p>"
    );
    compile(
        &src,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The reactive assignment as it appears in the emitted `$.set(out, …)` call.
fn emitted(name: &str, reactive_body: &str) -> String {
    let out = legacy(name, reactive_body);
    out.lines()
        .find(|l| l.contains("$.set(out,"))
        .unwrap_or_else(|| panic!("no `$.set(out, …)` in output:\n{out}"))
        .trim()
        .to_string()
}

/// `名前` is 3 bytes per character and `אב` is 2 — different byte/char deltas,
/// so a fix that happens to work for one width still has to work for the other.
/// `אב` also leads with `0xD7`, the single UTF-8 lead byte that `u8 as char`
/// decodes to a *non*-alphabetic Latin-1 character, so this fixture stays
/// discriminating if these sites are ever revisited for the decode class.
const NON_ASCII: [&str; 2] = ["名前", "אב"];

/// The loudest failure: `{ NAME }` used to emit `{ 名前()` — an unbalanced
/// brace, output that does not parse.
#[test]
fn a_shorthand_property_stays_balanced() {
    for name in NON_ASCII {
        let line = emitted(name, "$: out = { NAME };");
        assert_eq!(
            line.matches('{').count(),
            line.matches('}').count(),
            "unbalanced braces for prop `{name}`: {line}"
        );
        assert!(
            line.contains(&format!("{{ {name}: {name}() }}")),
            "shorthand not expanded for prop `{name}`: {line}"
        );
    }
}

/// Source text after the name used to be swallowed: `名前 + 1` emitted
/// `名前()`, silently dropping the ` + 1`.
#[test]
fn text_following_the_name_is_not_dropped() {
    for name in NON_ASCII {
        let line = emitted(name, "$: out = NAME + 1;");
        assert!(
            line.contains(&format!("{name}() + 1")),
            "trailing ` + 1` dropped for prop `{name}`: {line}"
        );
    }

    // A second occurrence used to disappear with the characters between them.
    for name in NON_ASCII {
        let line = emitted(name, "$: out = [NAME, NAME];");
        assert_eq!(
            line.matches(&format!("{name}()")).count(),
            2,
            "one array element lost for prop `{name}`: {line}"
        );
    }
}

/// Separate cause, separate test: an arrow parameter of the same name shadows
/// the prop and must not be wrapped. This is decided by
/// `is_shadowed_by_function_param`, whose own `var_len` was a byte length — so
/// a fix that only repairs the scan cursor still fails here.
#[test]
fn an_arrow_parameter_of_the_same_name_shadows_the_prop() {
    for name in NON_ASCII {
        let line = emitted(name, "$: out = (NAME) => NAME;");
        assert!(
            !line.contains(&format!("{name}()")),
            "shadowing arrow parameter treated as a prop read for `{name}`: {line}"
        );
    }
}

/// The control: the ASCII path must be untouched, and every non-ASCII name must
/// produce the same shape the ASCII one does. Without this, a fix that broke
/// ASCII while fixing CJK would pass every assertion above.
#[test]
fn a_non_ascii_prop_compiles_like_an_ascii_one() {
    for body in [
        "$: out = NAME + 1;",
        "$: out = (x) => x + NAME;",
        "$: out = (NAME) => NAME;",
        "$: out = [NAME, NAME];",
        "$: out = { NAME };",
    ] {
        let ascii = emitted("ab", body);
        for name in NON_ASCII {
            let other = emitted(name, body);
            assert_eq!(
                ascii.replace("ab", "\u{0}"),
                other.replace(name, "\u{0}"),
                "prop `{name}` diverges from the ascii control for `{body}`"
            );
        }
    }
}
