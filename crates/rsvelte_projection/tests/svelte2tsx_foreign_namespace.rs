//! `namespace: 'foreign'` must suppress the attribute-name case fold, mirroring
//! `htmlxtojsx_v2/index.ts` (`const preserveAttributeCase = options.namespace ===
//! 'foreign'`). Every assertion below is paired: the same input is projected
//! under `Html` and under `Foreign` so a change that made the option inert again
//! would fail, not just a change that made it unreachable.

use rsvelte_projection::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn opts(namespace: Svelte2TsxNamespace) -> Svelte2TsxOptions {
    Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: false,
        mode: Svelte2TsxMode::Ts,
        accessors: false,
        namespace,
        version: SvelteVersion::V5,
        runes: None,
        emit_jsdoc: false,
        rewrite_external_imports: None,
    }
}

fn project(input: &str, namespace: Svelte2TsxNamespace) -> String {
    svelte2tsx(input, opts(namespace)).expect("svelte2tsx").code
}

/// The upstream `attributes-foreign-ns` sample.
const FOREIGN_NS_SAMPLE: &str = "<element someAttr=\"hi\" someOtherAttribute=\"there\">hello</element>\n\
     <Component someAttr=\"5\" otherAttr={6} />";

#[test]
fn foreign_namespace_preserves_element_attribute_case() {
    let foreign = project(FOREIGN_NS_SAMPLE, Svelte2TsxNamespace::Foreign);
    assert!(
        foreign.contains("\"someAttr\":") && foreign.contains("\"someOtherAttribute\":"),
        "foreign namespace must keep element attribute casing, got:\n{foreign}"
    );
    assert!(
        !foreign.contains("\"someattr\":") && !foreign.contains("\"someotherattribute\":"),
        "foreign namespace must not lowercase element attributes, got:\n{foreign}"
    );
}

#[test]
fn html_namespace_lowercases_element_attribute_case() {
    let html = project(FOREIGN_NS_SAMPLE, Svelte2TsxNamespace::Html);
    assert!(
        html.contains("\"someattr\":") && html.contains("\"someotherattribute\":"),
        "html namespace must fold element attributes to lower case, got:\n{html}"
    );
}

/// The discriminating property: the two namespaces must not agree on this input.
/// Without it the two tests above could both pass on an implementation that
/// simply never folds anything.
#[test]
fn foreign_and_html_namespaces_disagree() {
    let foreign = project(FOREIGN_NS_SAMPLE, Svelte2TsxNamespace::Foreign);
    let html = project(FOREIGN_NS_SAMPLE, Svelte2TsxNamespace::Html);
    assert_ne!(
        foreign, html,
        "`namespace: 'foreign'` must change the projected output"
    );
}

/// Component props keep their casing regardless of namespace, so a test that
/// used only a component would be non-discriminating. Pin that here so the
/// element-vs-component asymmetry stays visible.
#[test]
fn component_props_keep_case_under_both_namespaces() {
    let input = "<Component someAttr=\"5\" />";
    assert!(project(input, Svelte2TsxNamespace::Html).contains("\"someAttr\":"));
    assert!(project(input, Svelte2TsxNamespace::Foreign).contains("\"someAttr\":"));
}

/// `svelte:element` and `svelte:component`-style dynamic elements go through a
/// different attribute builder than plain elements; both must honour the flag.
#[test]
fn foreign_namespace_applies_to_dynamic_elements() {
    let input = "<svelte:element this={\"div\"} someAttr=\"hi\" />";
    let foreign = project(input, Svelte2TsxNamespace::Foreign);
    let html = project(input, Svelte2TsxNamespace::Html);
    assert!(
        foreign.contains("\"someAttr\":"),
        "foreign namespace must reach <svelte:element>, got:\n{foreign}"
    );
    assert!(
        html.contains("\"someattr\":"),
        "html namespace must fold <svelte:element> attributes, got:\n{html}"
    );
}
