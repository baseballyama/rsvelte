//! Issue #460: a preprocessor that returns changed `attributes` must have them
//! applied even when the code is unchanged (H-139), and `Some({})` must clear
//! the tag's attributes rather than fall back to the originals (H-140).

use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessError, PreprocessorFn, PreprocessorGroup, PreprocessorOptions,
    PreprocessorResult, Processed,
};
use rustc_hash::FxHashMap;
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
        vec![group],
        Some("T.svelte".to_string()),
    ))
    .unwrap()
    .code
}

const SRC: &str = "<script lang=\"ts\">let x = 1;</script>";

/// H-139: changed attributes are applied even though the code is unchanged.
#[test]
fn attribute_only_change_is_applied() {
    let group = PreprocessorGroup {
        script: Some(Box::new(|opts: PreprocessorOptions| {
            ok(async move {
                let mut attrs = FxHashMap::default();
                attrs.insert("foo".to_string(), AttributeValue::String("bar".to_string()));
                Ok(Some(Processed {
                    code: opts.content,
                    attributes: Some(attrs),
                    ..Default::default()
                }))
            })
        }) as PreprocessorFn),
        ..Default::default()
    };
    let out = run(SRC, group);
    assert!(
        out.contains("foo=\"bar\""),
        "attribute change discarded: {out}"
    );
}

/// H-140: `Some({})` clears the tag's attributes.
#[test]
fn empty_attributes_map_clears() {
    let group = PreprocessorGroup {
        script: Some(Box::new(|opts: PreprocessorOptions| {
            ok(async move {
                Ok(Some(Processed {
                    code: opts.content,
                    attributes: Some(FxHashMap::default()),
                    ..Default::default()
                }))
            })
        }) as PreprocessorFn),
        ..Default::default()
    };
    let out = run(SRC, group);
    assert!(!out.contains("lang"), "attributes not cleared: {out}");
}
