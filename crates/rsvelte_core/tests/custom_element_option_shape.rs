//! `<svelte:options customElement={{…}}>` becomes a plain object, and the four
//! options are read in upstream's fixed order.
//!
//! `1-parse/read/options.js:62-146` walks the object expression twice: the first
//! loop checks every property's *shape* in source order, and then `properties
//! .find` reads `tag`, `props`, `shadow` and `extend` by name — so the option a
//! malformed object is reported on does not depend on where the source wrote it,
//! and a repeated key is read from its first occurrence. The same walk that
//! validates `props` builds the plain `{ [name]: { attribute?, reflect?, type? } }`
//! object, and a `ShadowRootInit` goes into `shadow` itself rather than a second
//! field.
//!
//! Every expected value below is the official compiler's own answer on the same
//! source (`submodules/svelte`, 5.57.0), not a restatement of this port.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};
use serde_json::Value;

fn custom_element(source: &str) -> Value {
    let ast = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse should succeed");
    let json: Value = serde_json::from_str(&with_serialize_arena(&ast.arena, || {
        serde_json::to_string(&ast).unwrap()
    }))
    .unwrap();
    json["options"]["customElement"].clone()
}

/// The error code the official compiler raises, or `None` when it accepts.
fn error_code(source: &str) -> Option<String> {
    match compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(err) => Some(err.diagnostic().code.unwrap_or_default()),
    }
}

#[test]
fn props_is_the_evaluated_object_in_source_order() {
    assert_eq!(
        custom_element(
            "<svelte:options customElement={{ tag: 'a-b', props: { a: { reflect: true, type: 'Number', attribute: 'a-b' } } }} />"
        ),
        serde_json::json!({
            "tag": "a-b",
            "props": { "a": { "reflect": true, "type": "Number", "attribute": "a-b" } }
        })
    );
}

#[test]
fn an_empty_props_option_is_an_empty_object_not_an_absent_one() {
    assert_eq!(
        custom_element("<svelte:options customElement={{ tag: 'a-b', props: {} }} />"),
        serde_json::json!({ "tag": "a-b", "props": {} })
    );
    assert_eq!(
        custom_element("<svelte:options customElement={{ tag: 'a-b', props: { a: {} } }} />"),
        serde_json::json!({ "tag": "a-b", "props": { "a": {} } })
    );
}

/// The negative half: an option nobody wrote must not appear. Without it an
/// implementation that always emits `props: {}` passes the two cells above.
#[test]
fn an_absent_option_is_absent() {
    assert_eq!(
        custom_element("<svelte:options customElement={{ tag: 'a-b' }} />"),
        serde_json::json!({ "tag": "a-b" })
    );
    assert_eq!(
        custom_element("<svelte:options customElement=\"a-b\" />"),
        serde_json::json!({ "tag": "a-b" })
    );
}

#[test]
fn a_shadow_root_init_lands_in_shadow_itself() {
    let ce = custom_element("<svelte:options customElement={{ shadow: { mode: 'open' } }} />");
    assert_eq!(ce["shadow"]["type"], "ObjectExpression");
    assert!(
        ce.get("shadow_object").is_none(),
        "upstream has one `shadow` field: {ce}"
    );
    // The string form keeps its own spelling, so "always an object" fails here.
    assert_eq!(
        custom_element("<svelte:options customElement={{ tag: 'a-b', shadow: 'none' }} />"),
        serde_json::json!({ "tag": "a-b", "shadow": "none" })
    );
}

/// `properties.find` reads `tag` before `props` before `shadow`, so the option
/// reported is not the one the source wrote first.
#[test]
fn the_options_are_validated_in_upstreams_order_not_the_sources() {
    assert_eq!(
        error_code("<svelte:options customElement={{ shadow: 'bogus', tag: 123 }} />").as_deref(),
        Some("svelte_options_invalid_tagname")
    );
    assert_eq!(
        error_code("<svelte:options customElement={{ props: { a: 1 }, tag: 123 }} />").as_deref(),
        Some("svelte_options_invalid_tagname")
    );
    assert_eq!(
        error_code("<svelte:options customElement={{ shadow: 'bogus', props: { a: 1 } }} />")
            .as_deref(),
        Some("svelte_options_invalid_customelement_props")
    );
    // Each of the three is still reported when it is the only thing wrong, so
    // the three above are about order rather than about one check winning always.
    assert_eq!(
        error_code("<svelte:options customElement={{ tag: 123 }} />").as_deref(),
        Some("svelte_options_invalid_tagname")
    );
    assert_eq!(
        error_code("<svelte:options customElement={{ tag: 'a-b', props: { a: 1 } }} />").as_deref(),
        Some("svelte_options_invalid_customelement_props")
    );
    assert_eq!(
        error_code("<svelte:options customElement={{ tag: 'a-b', shadow: 'bogus' }} />").as_deref(),
        Some("svelte_options_invalid_customelement_shadow")
    );
}

#[test]
fn a_repeated_key_is_read_from_its_first_occurrence() {
    assert_eq!(
        custom_element("<svelte:options customElement={{ tag: 'a-b', tag: 'c-d' }} />"),
        serde_json::json!({ "tag": "a-b" })
    );
}
