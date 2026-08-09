//! Word boundaries in the `svelte_scan` source-scan rules must be classified by
//! ECMA-262 `IdentifierPart`, not by "is this byte ASCII-alphanumeric".
//!
//! A byte test answers a different question in both directions: every byte of a
//! multi-byte character fails it, so an accented letter reads as a *boundary*
//! (`foo` inside `naïvefoo` becomes a standalone word, and an identifier scan
//! stops mid-name), while a non-ASCII space must stay a boundary. This file
//! pins both directions for each of the four callers — `no-unused-props`,
//! `require-event-prefix`, `require-event-dispatcher-types`, and
//! `svelte_scan::declares_type_in` (reached through
//! `experimental-require-strict-events`). All four are `EXCLUDE`d from the lint
//! output-parity universe, so its ratchet cannot see this class at all.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn findings(src: &str, code: &str) -> Vec<String> {
    let cfg = LintConfig::empty().with_override(code, Severity::Error);
    lint_source(
        src,
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        &cfg,
    )
    .into_iter()
    .filter(|d| d.code.as_deref() == Some(code))
    .map(|d| d.message)
    .collect()
}

// ---------------------------------------------------------------------------
// svelte/no-unused-props
// ---------------------------------------------------------------------------

const UNUSED_PROPS: &str = "svelte/no-unused-props";

/// The whole-object variable name is read by walking back over identifier
/// characters; a non-ASCII letter is part of the name, not the end of it.
#[test]
fn unused_props_whole_object_var_name_keeps_non_ascii_letters() {
    let src = "<script lang=\"ts\">\n\
        \tinterface Props { greeting: string }\n\
        \tconst pr\u{f4}ps: Props = $props();\n\
        </script>\n\
        <p>{pr\u{f4}ps.greeting}</p>";
    assert_eq!(findings(src, UNUSED_PROPS), Vec::<String>::new());
}

/// A member name is an identifier run, so it does not stop at a non-ASCII
/// letter — the report must name the whole property.
#[test]
fn unused_props_member_name_keeps_non_ascii_letters() {
    let src = "<script lang=\"ts\">\n\
        \tinterface Props { gr\u{eb}eting: string }\n\
        \tconst props: Props = $props();\n\
        </script>\n\
        <p>hi</p>";
    assert_eq!(
        findings(src, UNUSED_PROPS),
        vec!["'gr\u{eb}eting' is an unused Props property.".to_string()]
    );
}

/// The other direction: a non-ASCII space is a word boundary, so the use counts.
#[test]
fn unused_props_non_ascii_space_is_a_boundary() {
    let src = "<script lang=\"ts\">\n\
        \tinterface Props { greeting: string }\n\
        \tconst props: Props = $props();\n\
        </script>\n\
        <p>{\u{a0}props.greeting}</p>";
    assert_eq!(findings(src, UNUSED_PROPS), Vec::<String>::new());
}

// ---------------------------------------------------------------------------
// svelte/require-event-prefix
// ---------------------------------------------------------------------------

const EVENT_PREFIX: &str = "svelte/require-event-prefix";

/// A member whose name *starts* with a non-ASCII letter is still a member; a
/// byte scan reads its name as empty and drops the violation.
#[test]
fn event_prefix_member_name_starting_with_a_non_ascii_letter_is_reported() {
    let src = "<script lang=\"ts\">\n\
        \tinterface Props { \u{ef}nput: () => void }\n\
        \tconst props: Props = $props();\n\
        </script>";
    assert_eq!(
        findings(src, EVENT_PREFIX),
        vec!["Component event name must start with \"on\".".to_string()]
    );
}

/// The named-type lookup must not accept `Props\u{e9}` for `Props`: the trailing
/// letter is glue, so no type body resolves and nothing is reported.
#[test]
fn event_prefix_type_name_is_not_matched_by_a_non_ascii_suffixed_type() {
    let src = "<script lang=\"ts\">\n\
        \tinterface Props\u{e9} { click: () => void }\n\
        \tconst props: Props = $props();\n\
        </script>";
    assert_eq!(findings(src, EVENT_PREFIX), Vec::<String>::new());
}

/// A non-ASCII space between the keyword and the type name stays a boundary.
#[test]
fn event_prefix_non_ascii_space_is_a_boundary() {
    let src = "<script lang=\"ts\">\n\
        \tinterface\u{a0}Props { click: () => void }\n\
        \tconst props: Props = $props();\n\
        </script>";
    assert_eq!(
        findings(src, EVENT_PREFIX),
        vec!["Component event name must start with \"on\".".to_string()]
    );
}

// ---------------------------------------------------------------------------
// svelte/require-event-dispatcher-types
// ---------------------------------------------------------------------------

const DISPATCH: &str = "svelte/require-event-dispatcher-types";
const DISPATCH_MSG: &str = "Type parameters missing for the `createEventDispatcher` function call.";

/// `\u{e9}createEventDispatcher` is a different identifier; neither the import
/// nor the call is `createEventDispatcher`.
#[test]
fn dispatcher_non_ascii_prefixed_name_is_a_different_identifier() {
    let src = "<script lang=\"ts\">\n\
        \timport { \u{e9}createEventDispatcher } from 'svelte';\n\
        \tconst d = \u{e9}createEventDispatcher();\n\
        </script>";
    assert_eq!(findings(src, DISPATCH), Vec::<String>::new());
}

/// An `as` alias containing a non-ASCII letter is one name, so its call site is
/// found; a byte scan truncates the alias and the call goes unreported.
#[test]
fn dispatcher_alias_keeps_non_ascii_letters() {
    let src = "<script lang=\"ts\">\n\
        \timport { createEventDispatcher as cr\u{e9}er } from 'svelte';\n\
        \tconst d = cr\u{e9}er();\n\
        </script>";
    assert_eq!(findings(src, DISPATCH), vec![DISPATCH_MSG.to_string()]);
}

/// Non-ASCII spaces around the imported name and the call stay boundaries.
#[test]
fn dispatcher_non_ascii_space_is_a_boundary() {
    let src = "<script lang=\"ts\">\n\
        \timport {\u{a0}createEventDispatcher\u{a0}} from 'svelte';\n\
        \tconst d =\u{a0}createEventDispatcher();\n\
        </script>";
    assert_eq!(findings(src, DISPATCH), vec![DISPATCH_MSG.to_string()]);
}

// ---------------------------------------------------------------------------
// svelte_scan::declares_type_in (via experimental-require-strict-events)
// ---------------------------------------------------------------------------

const STRICT: &str = "svelte/experimental-require-strict-events";
const STRICT_MSG: &str = "The component must have the strictEvents attribute on its <script> tag or it must define the $$Events interface.";

/// `interface $$Events\u{e9}` declares a *different* type, so the component
/// still has no `$$Events`.
#[test]
fn declares_type_rejects_a_non_ascii_suffixed_name() {
    let src = "<script lang=\"ts\">\n\tinterface $$Events\u{e9} {}\n</script>";
    assert_eq!(findings(src, STRICT), vec![STRICT_MSG.to_string()]);
}

/// `\u{e9}interface` is an identifier, not the `interface` keyword.
#[test]
fn declares_type_rejects_a_non_ascii_prefixed_keyword() {
    let src =
        "<script lang=\"ts\">\n\tconst s = \"\u{e9}interface $$Events {}\";\n\tvoid s;\n</script>";
    assert_eq!(findings(src, STRICT), vec![STRICT_MSG.to_string()]);
}

/// The other direction: a non-ASCII space before the keyword is a boundary, so
/// the declaration is still found.
#[test]
fn declares_type_non_ascii_space_is_a_boundary() {
    let src = "<script lang=\"ts\">\n\u{a0}interface $$Events {}\n</script>";
    assert_eq!(findings(src, STRICT), Vec::<String>::new());
}
