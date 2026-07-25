//! Guards for the inlined `aria-query` / `axobject-query` tables in `constants.rs`.
//!
//! The tables are stored in a condensed encoding (shared prop-sets factored behind
//! `aria_props!`, one row per entry), so these tests pin down both the entry counts and
//! the structural invariants that encoding relies on.

use super::*;

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
