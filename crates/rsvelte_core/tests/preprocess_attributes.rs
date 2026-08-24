//! What a `script` / `style` preprocessor's returned `attributes` do, per cell
//! of (code changed?, map returned?, attributes shape).
//!
//! Upstream applies them only on the path *after* its no-change guard
//! (`if (!processed.map && processed.code === content) return no_change()`), so
//! an attribute-only result is discarded whole. rsvelte used to except
//! `attributes.is_some()` from that guard (#460), which re-emitted the tag and
//! replaced its attribute list wholesale — dropping `module` and `lang`, so a
//! module script silently became an instance script and the component compiled
//! to different code (#3293).
//!
//! The map cell is what separates the two rules: attributes returned *with* a
//! map are applied even though the code is unchanged. A grid without it is
//! satisfied by "attributes never apply", which is not the rule either.
//!
//! Every expectation here was read off the official compiler, not derived.

use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap as FxHashMap, PreprocessError, PreprocessorFn,
    PreprocessorGroup, PreprocessorOptions, PreprocessorResult, Processed, SourceMapInput,
};
use std::future::Future;

fn ok<F>(f: F) -> PreprocessorResult
where
    F: Future<Output = Result<Option<Processed>, PreprocessError>> + Send + 'static,
{
    Box::pin(f)
}

fn run(source: &str, group: PreprocessorGroup) -> String {
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    rt.block_on(preprocess(
        source.to_string(),
        &[group],
        Some("T.svelte".to_string()),
    ))
    .unwrap()
    .code
}

const SRC: &str = "<script lang=\"ts\">let x = 1;</script>";

fn attrs(pairs: &[(&str, &str)]) -> FxHashMap<String, AttributeValue> {
    let mut map = FxHashMap::default();
    for (key, value) in pairs {
        map.insert(
            (*key).to_string(),
            AttributeValue::String((*value).to_string()),
        );
    }
    map
}

fn script_returning(
    change_code: bool,
    map: bool,
    attributes: Option<FxHashMap<String, AttributeValue>>,
) -> PreprocessorGroup {
    PreprocessorGroup {
        script: Some(Box::new(move |opts: PreprocessorOptions| {
            let attributes = attributes.clone();
            ok(async move {
                Ok(Some(Processed {
                    code: if change_code {
                        format!("{} ", opts.content)
                    } else {
                        opts.content
                    },
                    map: map.then(|| {
                        SourceMapInput::Json(
                            r#"{"version":3,"sources":["T.svelte"],"names":[],"mappings":""}"#
                                .to_string(),
                        )
                    }),
                    attributes,
                    ..Default::default()
                }))
            })
        }) as PreprocessorFn),
        ..Default::default()
    }
}

#[test]
fn unchanged_code_and_no_map_discards_the_attributes() {
    let out = run(
        SRC,
        script_returning(false, false, Some(attrs(&[("foo", "bar")]))),
    );
    assert_eq!(out, "<script lang=\"ts\">let x = 1;</script>", "{out}");
}

#[test]
fn unchanged_code_and_no_map_discards_an_empty_attribute_map() {
    let out = run(
        SRC,
        script_returning(false, false, Some(FxHashMap::default())),
    );
    assert_eq!(out, "<script lang=\"ts\">let x = 1;</script>", "{out}");
}

#[test]
fn changed_code_applies_the_attributes() {
    let out = run(
        SRC,
        script_returning(true, false, Some(attrs(&[("foo", "bar")]))),
    );
    assert_eq!(out, "<script foo=\"bar\">let x = 1; </script>", "{out}");
}

/// `Some({})` clears the tag's attributes rather than falling back to the
/// originals — the reachable half of #460's H-140.
#[test]
fn changed_code_with_an_empty_attribute_map_clears_them() {
    let out = run(
        SRC,
        script_returning(true, false, Some(FxHashMap::default())),
    );
    assert_eq!(out, "<script>let x = 1; </script>", "{out}");
}

/// The discriminating cell: a returned map defeats the no-change guard, so the
/// attributes apply even though the code is untouched.
#[test]
fn a_returned_map_applies_the_attributes_without_a_code_change() {
    let out = run(
        SRC,
        script_returning(false, true, Some(attrs(&[("foo", "bar")]))),
    );
    assert_eq!(out, "<script foo=\"bar\">let x = 1;</script>", "{out}");
}

/// `module` survives an attribute-only result — the shape that made a module
/// script compile as an instance script.
#[test]
fn a_module_script_keeps_its_module_attribute() {
    let source = "<script module>\nexport const q = 1;\n</script>\n<p>x</p>\n";
    let out = run(
        source,
        script_returning(false, false, Some(attrs(&[("data-x", "y")]))),
    );
    assert_eq!(out, source, "{out}");
}
