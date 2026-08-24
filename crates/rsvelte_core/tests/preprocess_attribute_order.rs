//! #3397: the `attributes` handed to a `script` / `style` hook must be in
//! source order. Key order is observable in JavaScript (`Object.keys`,
//! `JSON.stringify`, and any tag the hook rebuilds), and upstream's is a plain
//! object filled by the attribute regex, so insertion order is the contract.
//!
//! Expectations were measured against `svelte.preprocess` from
//! `submodules/svelte` on the same sources.

use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap, PreprocessError, PreprocessorGroup,
    PreprocessorOptions, PreprocessorResult, Processed,
};
use std::future::Future;
use std::sync::{Arc, Mutex};

fn ok<F>(f: F) -> PreprocessorResult
where
    F: Future<Output = Result<Option<Processed>, PreprocessError>> + Send + 'static,
{
    Box::pin(f)
}

/// Run `preprocess` with a hook that records the key order it was handed.
fn observed_keys(source: &str) -> Vec<String> {
    let log: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));
    let record = |log: Arc<Mutex<Vec<String>>>| {
        Box::new(move |opts: PreprocessorOptions| {
            let keys = opts
                .attributes
                .keys()
                .cloned()
                .collect::<Vec<_>>()
                .join(",");
            log.lock().unwrap().push(keys);
            ok(async { Ok(None) })
        })
    };
    let group = PreprocessorGroup {
        script: Some(record(Arc::clone(&log))),
        style: Some(record(Arc::clone(&log))),
        ..Default::default()
    };
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    rt.block_on(preprocess(
        source.to_string(),
        &[group],
        Some("Probe.svelte".to_string()),
    ))
    .unwrap();
    log.lock().unwrap().clone()
}

#[test]
fn hook_attributes_are_in_source_order() {
    for (source, expected) in [
        (
            "<script context=\"module\" foo=\"bar\">let a = 1;</script>",
            "context,foo",
        ),
        (
            "<script foo=\"bar\" context=\"module\">let a = 1;</script>",
            "foo,context",
        ),
        (
            "<script c=\"3\" a=\"1\" b=\"2\">let a = 1;</script>",
            "c,a,b",
        ),
        (
            "<script c=\"3\" a=\"1\" b=\"2\" d=\"4\" e=\"5\">let a = 1;</script>",
            "c,a,b,d,e",
        ),
        (
            "<script lang=\"ts\" zz=\"1\" aa=\"2\">let a = 1;</script>",
            "lang,zz,aa",
        ),
        (
            "<script async defer lang=\"ts\">let a = 1;</script>",
            "async,defer,lang",
        ),
        (
            "<style lang=\"scss\" zz=\"1\" global>a{color:red}</style>",
            "lang,zz,global",
        ),
        (
            "<style z=\"1\" y=\"2\" x=\"3\" w=\"4\">a{color:red}</style>",
            "z,y,x,w",
        ),
        (
            "<script m=\"1\" l=\"2\" k=\"3\" j=\"4\" i=\"5\" h=\"6\">let a = 1;</script>",
            "m,l,k,j,i,h",
        ),
    ] {
        assert_eq!(
            observed_keys(source),
            vec![expected.to_string()],
            "{source}"
        );
    }
}

/// A hook that returns `attributes` has them written back in the order it built
/// them — upstream stringifies `Object.entries`, i.e. insertion order.
#[test]
fn returned_attributes_are_written_back_in_insertion_order() {
    let group = PreprocessorGroup {
        script: Some(Box::new(|_opts: PreprocessorOptions| {
            ok(async {
                let mut attrs = PreprocessAttributeMap::<String, AttributeValue>::default();
                attrs.insert("zz".to_string(), AttributeValue::String("1".to_string()));
                attrs.insert("aa".to_string(), AttributeValue::String("2".to_string()));
                attrs.insert("mm".to_string(), AttributeValue::Boolean(true));
                Ok(Some(Processed {
                    // Change the code so upstream's no-change guard does not
                    // discard the complete result, including `attributes`.
                    code: "let a = 2;".to_string(),
                    attributes: Some(attrs),
                    ..Default::default()
                }))
            })
        })),
        ..Default::default()
    };
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    let code = rt
        .block_on(preprocess(
            "<script q=\"0\">let a = 1;</script>".to_string(),
            &[group],
            Some("Probe.svelte".to_string()),
        ))
        .unwrap()
        .code;
    assert_eq!(code, "<script zz=\"1\" aa=\"2\" mm>let a = 2;</script>");
}
