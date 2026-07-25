//! Guards for the inlined `aria-query` / `axobject-query` tables in `constants.rs`.
//!
//! The tables are stored in a condensed encoding (shared prop-sets factored behind
//! `aria_props!`, one row per entry), so these tests pin down the exact contents, the
//! entry counts, and the structural invariants that encoding relies on.

use super::*;
use crate::compiler::phases::phase1_parse::utils::fuzzymatch::fuzzymatch;

/// The 17 `roletype` props that `aria_props!` splices into every set.
const ROLETYPE_GLOBALS: &[&str] = &[
    "aria-atomic",
    "aria-busy",
    "aria-controls",
    "aria-current",
    "aria-describedby",
    "aria-details",
    "aria-dropeffect",
    "aria-flowto",
    "aria-grabbed",
    "aria-hidden",
    "aria-keyshortcuts",
    "aria-label",
    "aria-labelledby",
    "aria-live",
    "aria-owns",
    "aria-relevant",
    "aria-roledescription",
];

/// The only two roles whose allowed-prop set is empty.
const ROLES_WITHOUT_ALLOWED_PROPS: &[&str] = &["doc-pullquote", "none"];

/// Number of allowed ARIA props per role, from aria-query@5.3.1.
#[rustfmt::skip]
const ROLE_ALLOWED_PROP_COUNTS: &[(&str, usize)] = &[
    ("alert", 17), ("alertdialog", 18), ("application", 23), ("article", 19), ("banner", 17),
    ("blockquote", 17), ("button", 21), ("caption", 17), ("cell", 21), ("checkbox", 24),
    ("code", 17), ("columnheader", 30), ("combobox", 26), ("command", 17), ("complementary", 17),
    ("composite", 19), ("contentinfo", 17), ("definition", 17), ("deletion", 17), ("dialog", 18),
    ("directory", 17), ("doc-abstract", 22), ("doc-acknowledgments", 22), ("doc-afterword", 22),
    ("doc-appendix", 22), ("doc-backlink", 22), ("doc-biblioentry", 25), ("doc-bibliography", 22),
    ("doc-biblioref", 22), ("doc-chapter", 22), ("doc-colophon", 22), ("doc-conclusion", 22),
    ("doc-cover", 22), ("doc-credit", 22), ("doc-credits", 22), ("doc-dedication", 22),
    ("doc-endnote", 25), ("doc-endnotes", 22), ("doc-epigraph", 22), ("doc-epilogue", 22),
    ("doc-errata", 22), ("doc-example", 22), ("doc-footnote", 22), ("doc-foreword", 22),
    ("doc-glossary", 22), ("doc-glossref", 22), ("doc-index", 22), ("doc-introduction", 22),
    ("doc-noteref", 22), ("doc-notice", 22), ("doc-pagebreak", 27), ("doc-pagefooter", 24),
    ("doc-pageheader", 24), ("doc-pagelist", 22), ("doc-part", 22), ("doc-preface", 22),
    ("doc-prologue", 22), ("doc-pullquote", 0), ("doc-qna", 22), ("doc-subtitle", 22),
    ("doc-tip", 22), ("doc-toc", 22), ("document", 17), ("emphasis", 17), ("feed", 17),
    ("figure", 17), ("form", 17), ("generic", 17), ("graphics-document", 22),
    ("graphics-object", 23), ("graphics-symbol", 22), ("grid", 23), ("gridcell", 29), ("group", 19),
    ("heading", 18), ("img", 17), ("input", 18), ("insertion", 17), ("landmark", 17), ("link", 20),
    ("list", 17), ("listbox", 26), ("listitem", 20), ("log", 17), ("main", 17), ("mark", 20),
    ("marquee", 17), ("math", 17), ("menu", 20), ("menubar", 20), ("menuitem", 22),
    ("menuitemcheckbox", 27), ("menuitemradio", 27), ("meter", 21), ("navigation", 17), ("none", 0),
    ("note", 17), ("option", 22), ("paragraph", 17), ("presentation", 17), ("progressbar", 21),
    ("radio", 21), ("radiogroup", 24), ("range", 20), ("region", 17), ("roletype", 17), ("row", 26),
    ("rowgroup", 17), ("rowheader", 30), ("scrollbar", 23), ("search", 17), ("searchbox", 27),
    ("section", 17), ("sectionhead", 17), ("select", 20), ("separator", 23), ("slider", 27),
    ("spinbutton", 27), ("status", 17), ("strong", 17), ("structure", 17), ("subscript", 17),
    ("superscript", 17), ("switch", 24), ("tab", 23), ("table", 19), ("tablist", 22),
    ("tabpanel", 17), ("term", 17), ("textbox", 27), ("time", 17), ("timer", 17), ("toolbar", 20),
    ("tooltip", 17), ("tree", 24), ("treegrid", 27), ("treeitem", 25), ("widget", 17),
    ("window", 18),
];

/// FNV-1a 64 of `"<role>=<comma-joined sorted props>\n"` for every role, roles sorted.
/// Pinned from `main`'s table before the encoding change, so any substituted, dropped or
/// added prop fails here even when the per-role counts still line up.
const ROLE_ALLOWED_ARIA_PROPS_DIGEST: u64 = 0x3b86_c5a3_fcbb_a149;

fn fnv1a64(bytes: &[u8]) -> u64 {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in bytes {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }
    hash
}

/// Canonical, order-independent rendering of `ROLE_ALLOWED_ARIA_PROPS`.
fn role_allowed_aria_props_canonical() -> String {
    let mut roles: Vec<&str> = ROLE_ALLOWED_ARIA_PROPS.keys().copied().collect();
    roles.sort_unstable();
    let mut out = String::new();
    for role in roles {
        let mut props = ROLE_ALLOWED_ARIA_PROPS[role].to_vec();
        props.sort_unstable();
        out.push_str(role);
        out.push('=');
        out.push_str(&props.join(","));
        out.push('\n');
    }
    out
}

#[test]
fn role_allowed_aria_props_content_is_pinned() {
    assert_eq!(
        fnv1a64(role_allowed_aria_props_canonical().as_bytes()),
        ROLE_ALLOWED_ARIA_PROPS_DIGEST,
        "ROLE_ALLOWED_ARIA_PROPS changed; see the per-role counts test for which role"
    );
}

#[test]
fn every_role_allows_exactly_the_expected_number_of_props() {
    assert_eq!(
        ROLE_ALLOWED_PROP_COUNTS.len(),
        ROLE_ALLOWED_ARIA_PROPS.len()
    );
    let mut total = 0;
    for (role, expected) in ROLE_ALLOWED_PROP_COUNTS {
        let props = ROLE_ALLOWED_ARIA_PROPS
            .get(role)
            .unwrap_or_else(|| panic!("{role} missing from ROLE_ALLOWED_ARIA_PROPS"));
        assert_eq!(
            props.len(),
            *expected,
            "{role}: wrong number of allowed props"
        );
        total += props.len();
    }
    assert_eq!(total, 2833);
}

#[test]
fn table_sizes_are_intact() {
    assert_eq!(ARIA_ATTRIBUTES.len(), 51);
    assert_eq!(AUTOFILL_FIELD_NAME_TOKENS.len(), 47);
    assert_eq!(ARIA_ROLES.len(), 139);
    assert_eq!(ABSTRACT_ROLES.len(), 12);
    assert_eq!(NON_INTERACTIVE_ROLES.len(), 88);
    assert_eq!(INTERACTIVE_ROLES.len(), 38);
    assert_eq!(ARIA_PROPERTY_DEFINITIONS.len(), 51);
    assert_eq!(ROLE_REQUIRED_PROPS.len(), 12);
    assert_eq!(ROLE_ALLOWED_ARIA_PROPS.len(), 139);
    assert_eq!(SEMANTIC_ROLE_ELEMENTS.len(), 15);
    assert_eq!(NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS.len(), 56);
    assert_eq!(INTERACTIVE_ELEMENT_ROLE_SCHEMAS.len(), 37);
    assert_eq!(INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS.len(), 26);
    assert_eq!(NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS.len(), 41);
}

#[test]
fn aria_role_names_lead_with_the_abstract_roles_in_aria_query_order() {
    assert_eq!(ARIA_ROLE_NAMES.len(), 139);
    assert_eq!(
        &ARIA_ROLE_NAMES[..ABSTRACT_ROLE_NAMES.len()],
        ABSTRACT_ROLE_NAMES
    );
    assert_eq!(
        ARIA_ROLE_NAMES.iter().collect::<FxHashSet<_>>().len(),
        ARIA_ROLE_NAMES.len(),
        "ARIA_ROLE_NAMES must not repeat a role"
    );
    // aria-query's key order, not alphabetical: `fuzzymatch` resolves ties by first
    // occurrence, so `none` (idx 59) must still beat `note` (idx 60).
    assert_eq!(ARIA_ROLE_NAMES.iter().position(|r| *r == "none"), Some(59));
    assert_eq!(ARIA_ROLE_NAMES.iter().position(|r| *r == "note"), Some(60));
}

#[test]
fn unknown_role_suggestions_follow_aria_query_order() {
    assert_eq!(fuzzymatch("noe", ARIA_ROLE_NAMES).as_deref(), Some("none"));
}

#[test]
fn abstract_roles_are_a_subset_of_aria_roles() {
    for role in ABSTRACT_ROLES.iter() {
        assert!(ARIA_ROLES.contains(role), "{role} missing from ARIA_ROLES");
    }
}

#[test]
fn every_aria_role_has_an_allowed_prop_set() {
    for role in ARIA_ROLES.iter() {
        assert!(
            ROLE_ALLOWED_ARIA_PROPS.contains_key(role),
            "{role} missing from ROLE_ALLOWED_ARIA_PROPS"
        );
    }
}

#[test]
fn allowed_prop_sets_are_unique_and_valid() {
    for (role, props) in ROLE_ALLOWED_ARIA_PROPS.iter() {
        let mut deduped = props.to_vec();
        deduped.sort_unstable();
        deduped.dedup();
        assert_eq!(
            deduped.len(),
            props.len(),
            "{role}: an extra prop duplicates a roletype global"
        );

        for prop in *props {
            let suffix = prop
                .strip_prefix("aria-")
                .unwrap_or_else(|| panic!("{role}: {prop} is not an aria-* attribute"));
            assert!(
                ARIA_ATTRIBUTES.contains(&suffix),
                "{role}: {prop} is not in ARIA_ATTRIBUTES"
            );
        }
    }
}

#[test]
fn roletype_globals_are_allowed_on_every_role_but_two() {
    for (role, props) in ROLE_ALLOWED_ARIA_PROPS.iter() {
        if ROLES_WITHOUT_ALLOWED_PROPS.contains(role) {
            assert!(props.is_empty(), "{role} should allow no props");
            continue;
        }
        for global in ROLETYPE_GLOBALS {
            assert!(props.contains(global), "{role} should allow {global}");
        }
    }
}

#[test]
fn required_props_are_allowed_props() {
    for (role, required) in ROLE_REQUIRED_PROPS.iter() {
        let allowed = ROLE_ALLOWED_ARIA_PROPS[role];
        for prop in *required {
            assert!(
                allowed.contains(prop),
                "{role}: {prop} required but not allowed"
            );
        }
    }
}

#[test]
fn schema_indices_cover_every_schema() {
    let cases: [(&[RoleRelationConcept], &FxHashMap<&'static str, Vec<usize>>); 4] = [
        (
            NON_INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
            &NON_INTERACTIVE_ELEMENT_ROLE_INDEX,
        ),
        (
            INTERACTIVE_ELEMENT_ROLE_SCHEMAS,
            &INTERACTIVE_ELEMENT_ROLE_INDEX,
        ),
        (
            INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
            &INTERACTIVE_ELEMENT_AX_OBJECT_INDEX,
        ),
        (
            NON_INTERACTIVE_ELEMENT_AX_OBJECT_SCHEMAS,
            &NON_INTERACTIVE_ELEMENT_AX_OBJECT_INDEX,
        ),
    ];
    for (schemas, index) in cases {
        let indexed: usize = index.values().map(Vec::len).sum();
        assert_eq!(indexed, schemas.len());
        for (i, schema) in schemas.iter().enumerate() {
            assert!(
                index[schema.name].contains(&i),
                "{} #{i} missing from its index bucket",
                schema.name
            );
        }
    }
}

#[test]
fn aria_property_definitions_cover_every_aria_attribute() {
    for attr in ARIA_ATTRIBUTES {
        let name = format!("aria-{attr}");
        assert!(
            ARIA_PROPERTY_DEFINITIONS.contains_key(name.as_str()),
            "{name} has no property definition"
        );
    }
}
