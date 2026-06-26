//! `<style>` body formatting via the embedded-formatter callback.

use std::sync::{Arc, Mutex};

use rsvelte_formatter::{FormatOptions, StyleFormatter, format};

fn fmt(src: &str, opts: &FormatOptions) -> String {
    let out = format(src, opts).expect("format ok");
    out.strip_suffix('\n').map(str::to_string).unwrap_or(out)
}

#[test]
fn style_verbatim_when_no_callback() {
    let src = "<style>  p { color :red }  </style>";
    let out = fmt(src, &FormatOptions::default());
    assert_eq!(out, src);
}

#[test]
fn callback_receives_body_and_lang_default_css() {
    let captured: Arc<Mutex<Option<(String, String)>>> = Arc::new(Mutex::new(None));
    let captured_clone = captured.clone();
    let cb: StyleFormatter = Arc::new(move |body, lang, _width| {
        *captured_clone.lock().unwrap() = Some((body.to_string(), lang.to_string()));
        Ok(format!("/* normalized */\n{body}"))
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    let out = fmt("<style>p {color: red;}</style>", &opts);

    let captured = captured.lock().unwrap().clone();
    let (body, lang) = captured.expect("callback ran");
    assert_eq!(body, "p {color: red;}");
    assert_eq!(lang, "css");
    // The callback returns base-0 CSS; inside <style> it is re-indented one
    // level under the tag and placed on its own lines (no longer glued to the
    // open tag as `<style>/* normalized */`).
    assert!(
        out.contains("<style>\n  /* normalized */\n  p {color: red;}\n</style>"),
        "expected callback output re-indented and spliced:\n{out}"
    );
    assert!(out.starts_with("<style>"), "open tag preserved:\n{out}");
    assert!(out.ends_with("</style>"), "close tag preserved:\n{out}");
}

#[test]
fn callback_receives_scss_lang_attribute() {
    let captured: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let captured_clone = captured.clone();
    let cb: StyleFormatter = Arc::new(move |body, lang, _width| {
        *captured_clone.lock().unwrap() = Some(lang.to_string());
        Ok(body.to_string())
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    // CSS-valid body declared `lang="scss"`. The body is no longer CSS-parsed
    // (it's opaque preprocessor input), but it is still handed to the embedded
    // formatter callback with the declared lang so an scss-capable engine can
    // format it — matching the oxfmt-based oracle.
    let _out = fmt("<style lang=\"scss\">p { color: red; }</style>", &opts);

    assert_eq!(captured.lock().unwrap().as_deref(), Some("scss"));
}

#[test]
fn scss_syntax_body_does_not_abort_parse() {
    // SCSS-only syntax (`//` line comments, `$variables`, maps) would make the
    // CSS parser raise `css_expected_identifier` and abort the whole-file format
    // (#1233). The body must no longer be CSS-parsed: the file formats, the
    // callback receives the raw scss body verbatim, and lang is "scss".
    let captured: Arc<Mutex<Option<(String, String)>>> = Arc::new(Mutex::new(None));
    let captured_clone = captured.clone();
    // Identity formatter (an scss-aware engine would reformat; here we only assert
    // the body reaches the callback untouched and the file no longer errors).
    let cb: StyleFormatter = Arc::new(move |body, lang, _width| {
        *captured_clone.lock().unwrap() = Some((body.to_string(), lang.to_string()));
        Ok(body.to_string())
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    let src = "<script>let x=1+2</script>\n<style lang=\"scss\">\n  // Disable default zoom\n  $light_root: (a: 1, b: 2);\n  .foo {\n    color: $light_root;\n  }\n</style>";
    let out = fmt(src, &opts);

    assert!(
        out.contains("let x = 1 + 2;"),
        "rest of file formatted:\n{out}"
    );
    let (body, lang) = captured.lock().unwrap().clone().expect("callback ran");
    assert_eq!(lang, "scss");
    assert!(
        body.contains("// Disable default zoom") && body.contains("$light_root: (a: 1, b: 2)"),
        "scss body reached the callback verbatim:\n{body}"
    );
}

#[test]
fn empty_style_block_skips_callback() {
    let calls: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
    let calls_clone = calls.clone();
    let cb: StyleFormatter = Arc::new(move |body, _lang, _width| {
        *calls_clone.lock().unwrap() += 1;
        Ok(body.to_string())
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    let _out = fmt("<style>   </style>", &opts);

    assert_eq!(
        *calls.lock().unwrap(),
        0,
        "expected no callback for empty style"
    );
}

#[test]
fn no_style_block_at_all() {
    let calls: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
    let calls_clone = calls.clone();
    let cb: StyleFormatter = Arc::new(move |body, _lang, _width| {
        *calls_clone.lock().unwrap() += 1;
        Ok(body.to_string())
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    let _out = fmt("<p>no style here</p>", &opts);

    assert_eq!(*calls.lock().unwrap(), 0);
}

#[test]
fn style_alongside_script_both_format() {
    let cb: StyleFormatter = Arc::new(|body, _lang, _width| Ok(format!("FORMATTED_CSS:{}", body)));
    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    let out = fmt(
        "<script>let x=1+2</script>\n<p>{x}</p>\n<style>p{color:red}</style>",
        &opts,
    );
    assert!(out.contains("let x = 1 + 2;"), "{out}");
    assert!(out.contains("FORMATTED_CSS:p{color:red}"), "{out}");
}
