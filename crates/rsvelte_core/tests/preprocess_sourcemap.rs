//! Source-map behaviour of `preprocess()`, checked against the maps the
//! official compiler produces for the same inputs.
//!
//! Regenerate the expectations with
//! `node scripts/dev/preprocess-sourcemap-oracle.mjs`.

use rsvelte_core::compiler::preprocess::encode_sourcemap::encode_mappings;
use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_core::compiler::preprocess::types::{
    MarkupPreprocessorFn, PreprocessorFn, PreprocessorGroup, Processed, SimpleDecodedMap,
    SourceMapInput,
};

fn run(source: &str, preprocessors: &[PreprocessorGroup]) -> Processed {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(preprocess(
            source.to_string(),
            preprocessors,
            Some("input.svelte".to_string()),
        ))
        .expect("preprocess should succeed")
}

fn mappings_of(processed: &Processed) -> String {
    match processed.map.as_ref().expect("a map should be produced") {
        SourceMapInput::Decoded(map) => encode_mappings(&map.mappings),
        SourceMapInput::Json(json) => panic!("expected a decoded map, got {json}"),
    }
}

fn decoded(mappings: Vec<Vec<Vec<i64>>>) -> SourceMapInput {
    SourceMapInput::Decoded(SimpleDecodedMap {
        sources: vec!["input.svelte".to_string()],
        mappings,
        ..SimpleDecodedMap::default()
    })
}

fn markup_group(name: &str, code: &'static str, mappings: Vec<Vec<Vec<i64>>>) -> PreprocessorGroup {
    let markup: MarkupPreprocessorFn = Box::new(move |_| {
        let mappings = mappings.clone();
        Box::pin(async move {
            Ok(Some(Processed {
                code: code.to_string(),
                map: Some(decoded(mappings)),
                dependencies: vec![],
                attributes: None,
            }))
        })
    });
    PreprocessorGroup {
        name: Some(name.to_string()),
        markup: Some(markup),
        ..PreprocessorGroup::default()
    }
}

fn script_group(name: &str, processed: fn() -> Processed) -> PreprocessorGroup {
    let script: PreprocessorFn = Box::new(move |_| Box::pin(async move { Ok(Some(processed())) }));
    PreprocessorGroup {
        name: Some(name.to_string()),
        script: Some(script),
        ..PreprocessorGroup::default()
    }
}

/// Two map-producing preprocessors: the composed map must resolve to the
/// original source, not to the first stage's output. Before the chain was
/// composed this produced `AAAA` — a mapping to line 0 of an intermediate text
/// nobody has.
#[test]
fn two_preprocessor_maps_compose_back_to_the_original_source() {
    let result = run(
        "A\nB\nC\n",
        &[
            markup_group(
                "first",
                "X\nB\nC\n",
                vec![vec![vec![0, 0, 2, 0]], vec![], vec![], vec![]],
            ),
            markup_group(
                "second",
                "Y\nB\nC\n",
                vec![vec![vec![0, 0, 0, 0]], vec![], vec![], vec![]],
            ),
        ],
    );

    assert_eq!(result.code, "Y\nB\nC\n");
    assert_eq!(mappings_of(&result), "AAEA");
}

/// A multi-byte character before the tag: mapped columns are UTF-16 code units,
/// so the three-byte `ボ` advances the column by one, not by three.
#[test]
fn columns_are_counted_in_utf16_code_units() {
    fn processed() -> Processed {
        Processed {
            code: "let b=1;".to_string(),
            map: Some(decoded(vec![vec![vec![0, 0, 0, 0]]])),
            dependencies: vec![],
            attributes: None,
        }
    }

    let result = run(
        "<p>ボタン</p><script>let a=1;</script>",
        &[script_group("script", processed)],
    );

    assert_eq!(result.code, "<p>ボタン</p><script>let b=1;</script>");
    assert_eq!(
        mappings_of(&result),
        "AAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,QAAQ,CAAC,CAAC,MAAM"
    );
}

/// A preprocessor that attaches its map as a `sourceMappingURL` comment instead
/// of returning it: the comment is consumed, not left in the component code.
#[test]
fn an_attached_sourcemap_is_consumed_and_stripped() {
    fn processed() -> Processed {
        // Base64 of {"version":3,"sources":["input.svelte"],"names":[],"mappings":"AAAA"}
        let data = "eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LnN2ZWx0ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9";
        Processed {
            code: format!(
                "let b=1;\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,{data}"
            ),
            map: None,
            dependencies: vec![],
            attributes: None,
        }
    }

    let result = run(
        "<script>let a=1;</script>",
        &[script_group("attach", processed)],
    );

    assert_eq!(result.code, "<script>let b=1;\n</script>");
    assert_eq!(
        mappings_of(&result),
        "AAAA,CAAC,MAAM,CAAC;AAAQ,CAAC,CAAC,MAAM"
    );
}
