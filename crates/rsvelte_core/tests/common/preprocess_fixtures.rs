//! Shared per-fixture preprocessor closures for the Svelte preprocess test
//! suite. Both `tests/preprocess.rs` (the standalone runner) and
//! `tests/compatibility_report.rs` (the dashboard) hand-port each fixture's
//! `_config.js` JS preprocessor into Rust closures here.

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, MarkupPreprocessorFn, MarkupPreprocessorOptions,
    PreprocessAttributeMap as FxHashMap, PreprocessorFn, PreprocessorGroup, PreprocessorOptions,
    PreprocessorResult, Processed,
};

/// Read a string attribute value, panicking if it isn't a `String`.
pub fn attr_str<'a>(attrs: &'a FxHashMap<String, AttributeValue>, name: &str) -> Option<&'a str> {
    match attrs.get(name)? {
        AttributeValue::String(s) => Some(s.as_str()),
        AttributeValue::Boolean(_) => None,
    }
}

fn ok<F>(f: F) -> PreprocessorResult
where
    F: std::future::Future<
            Output = Result<
                Option<Processed>,
                rsvelte_core::compiler::preprocess::types::PreprocessError,
            >,
        > + Send
        + 'static,
{
    Box::pin(f)
}

fn processed_code(code: impl Into<String>) -> Processed {
    Processed {
        code: code.into(),
        ..Default::default()
    }
}

/// Returns `Some(...)` if `name` matches a hand-ported fixture, otherwise
/// `None` (caller treats unknown fixtures as failures).
pub fn build_preprocessors(name: &str) -> Option<Vec<PreprocessorGroup>> {
    let groups = match name {
        "attributes-with-closing-tag" => vec![PreprocessorGroup {
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    let generics_has_gt =
                        attr_str(&opts.attributes, "generics").is_some_and(|v| v.contains('>'));
                    if generics_has_gt {
                        Ok(Some(processed_code("")))
                    } else {
                        Ok(None)
                    }
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "attributes-with-equals" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    if attr_str(&opts.attributes, "foo").is_some_and(|v| v.contains('=')) {
                        Ok(Some(processed_code("")))
                    } else {
                        Ok(None)
                    }
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "comments" => vec![PreprocessorGroup {
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move { Ok(Some(processed_code(opts.content.replace("one", "two")))) })
            }) as PreprocessorFn),
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move { Ok(Some(processed_code(opts.content.replace("one", "three")))) })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "dependencies" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    use regex::Regex;
                    let re = Regex::new(r"@import '(.+)';").unwrap();
                    let mut deps = Vec::new();
                    let mut last = 0;
                    let mut out = String::new();
                    for cap in re.captures_iter(&opts.content) {
                        let m = cap.get(0).unwrap();
                        out.push_str(&opts.content[last..m.start()]);
                        out.push_str("/* removed */");
                        deps.push(cap[1].to_string());
                        last = m.end();
                    }
                    out.push_str(&opts.content[last..]);
                    Ok(Some(Processed {
                        code: out,
                        dependencies: deps,
                        ..Default::default()
                    }))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "empty-sourcemap" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    use rsvelte_core::compiler::preprocess::types::{
                        SimpleDecodedMap, SourceMapInput,
                    };
                    Ok(Some(Processed {
                        code: opts.content,
                        map: Some(SourceMapInput::Decoded(SimpleDecodedMap {
                            mappings: vec![],
                            ..SimpleDecodedMap::default()
                        })),
                        ..Default::default()
                    }))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "filename" => vec![PreprocessorGroup {
            markup: Some(Box::new(|opts: MarkupPreprocessorOptions| {
                ok(async move {
                    let filename = opts.filename.unwrap_or_default();
                    Ok(Some(processed_code(
                        opts.content.replace("__MARKUP_FILENAME__", &filename),
                    )))
                })
            }) as MarkupPreprocessorFn),
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    let filename = opts.filename.unwrap_or_default();
                    Ok(Some(processed_code(
                        opts.content.replace("__STYLE_FILENAME__", &filename),
                    )))
                })
            }) as PreprocessorFn),
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    let filename = opts.filename.unwrap_or_default();
                    Ok(Some(processed_code(
                        opts.content.replace("__SCRIPT_FILENAME__", &filename),
                    )))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "ignores-null" => vec![PreprocessorGroup {
            // `() => {}` returns `undefined`, which the Rust `Ok(None)` path
            // already handles as a no-op.
            script: Some(
                Box::new(|_opts: PreprocessorOptions| ok(async move { Ok(None) }))
                    as PreprocessorFn,
            ),
            ..Default::default()
        }],

        "markup" => vec![PreprocessorGroup {
            markup: Some(Box::new(|opts: MarkupPreprocessorOptions| {
                ok(async move {
                    Ok(Some(processed_code(
                        opts.content.replace("__NAME__", "world"),
                    )))
                })
            }) as MarkupPreprocessorFn),
            ..Default::default()
        }],

        "multiple-preprocessors" => vec![
            PreprocessorGroup {
                markup: Some(Box::new(|opts: MarkupPreprocessorOptions| {
                    ok(async move { Ok(Some(processed_code(opts.content.replace("one", "two")))) })
                }) as MarkupPreprocessorFn),
                script: Some(Box::new(|opts: PreprocessorOptions| {
                    ok(
                        async move { Ok(Some(processed_code(opts.content.replace("two", "three")))) },
                    )
                }) as PreprocessorFn),
                style: Some(Box::new(|opts: PreprocessorOptions| {
                    ok(
                        async move { Ok(Some(processed_code(opts.content.replace("three", "style")))) },
                    )
                }) as PreprocessorFn),
                ..Default::default()
            },
            PreprocessorGroup {
                markup: Some(Box::new(|opts: MarkupPreprocessorOptions| {
                    ok(
                        async move { Ok(Some(processed_code(opts.content.replace("two", "three")))) },
                    )
                }) as MarkupPreprocessorFn),
                script: Some(Box::new(|opts: PreprocessorOptions| {
                    ok(async move {
                        Ok(Some(processed_code(
                            opts.content.replace("three", "script"),
                        )))
                    })
                }) as PreprocessorFn),
                style: Some(Box::new(|opts: PreprocessorOptions| {
                    ok(
                        async move { Ok(Some(processed_code(opts.content.replace("three", "style")))) },
                    )
                }) as PreprocessorFn),
                ..Default::default()
            },
        ],

        "partial-names" => vec![PreprocessorGroup {
            script: Some(Box::new(|_opts: PreprocessorOptions| {
                ok(async move { Ok(Some(processed_code(""))) })
            }) as PreprocessorFn),
            style: Some(Box::new(|_opts: PreprocessorOptions| {
                ok(async move { Ok(Some(processed_code(""))) })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "script" => vec![PreprocessorGroup {
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    // The official fixture uses MagicString to splice `42`
                    // into the position of `__THE_ANSWER__`. The textual
                    // result is identical to a plain replace.
                    Ok(Some(processed_code(
                        opts.content.replace("__THE_ANSWER__", "42"),
                    )))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "script-multiple" => vec![PreprocessorGroup {
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move { Ok(Some(processed_code(opts.content.to_lowercase()))) })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "script-self-closing" => vec![PreprocessorGroup {
            script: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    assert_eq!(opts.content, "");
                    let answer = attr_str(&opts.attributes, "the-answer").unwrap_or("");
                    Ok(Some(processed_code(format!(
                        "console.log(\"{}\");",
                        answer
                    ))))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    Ok(Some(processed_code(
                        opts.content.replace("$brand", "purple"),
                    )))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style-async" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    Ok(Some(processed_code(
                        opts.content.replace("$brand", "purple"),
                    )))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style-attributes" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    assert_eq!(attr_str(&opts.attributes, "type"), Some("text/scss"));
                    assert_eq!(attr_str(&opts.attributes, "data-foo"), Some("bar"));
                    assert!(matches!(
                        opts.attributes.get("bool"),
                        Some(AttributeValue::Boolean(true))
                    ));
                    Ok(Some(processed_code("PROCESSED")))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style-attributes-modified" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    assert_eq!(attr_str(&opts.attributes, "lang"), Some("scss"));
                    assert_eq!(attr_str(&opts.attributes, "data-foo"), Some("bar"));
                    assert!(matches!(
                        opts.attributes.get("bool"),
                        Some(AttributeValue::Boolean(true))
                    ));
                    let mut new_attrs = FxHashMap::default();
                    new_attrs.insert(
                        "sth".to_string(),
                        AttributeValue::String("else".to_string()),
                    );
                    Ok(Some(Processed {
                        code: "PROCESSED".to_string(),
                        attributes: Some(new_attrs),
                        ..Default::default()
                    }))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style-attributes-modified-longer" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    assert_eq!(attr_str(&opts.attributes, "lang"), Some("scss"));
                    let mut new_attrs = FxHashMap::default();
                    new_attrs.insert(
                        "sth".to_string(),
                        AttributeValue::String("wayyyyyyyyyyyyy looooooonger".to_string()),
                    );
                    Ok(Some(Processed {
                        code: "PROCESSED".to_string(),
                        attributes: Some(new_attrs),
                        ..Default::default()
                    }))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        "style-self-closing" => vec![PreprocessorGroup {
            style: Some(Box::new(|opts: PreprocessorOptions| {
                ok(async move {
                    assert_eq!(opts.content, "");
                    let color = attr_str(&opts.attributes, "color").unwrap_or("");
                    Ok(Some(processed_code(format!("div {{ color: {}; }}", color))))
                })
            }) as PreprocessorFn),
            ..Default::default()
        }],

        _ => return None,
    };
    Some(groups)
}

/// Filename override expected by certain fixtures (currently only `filename`).
pub fn filename_for(name: &str) -> Option<String> {
    if name == "filename" {
        Some("file.svelte".to_string())
    } else {
        None
    }
}
