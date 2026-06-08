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
    let cb: StyleFormatter = Arc::new(move |body, lang| {
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
    let cb: StyleFormatter = Arc::new(move |body, lang| {
        *captured_clone.lock().unwrap() = Some(lang.to_string());
        Ok(body.to_string())
    });

    let opts = FormatOptions {
        style_formatter: Some(cb),
        ..FormatOptions::default()
    };
    // Use CSS-valid body but declare lang="scss" — rsvelte's CSS
    // parser still walks the body, so syntactic CSS keeps the test
    // hermetic.
    let _out = fmt("<style lang=\"scss\">p { color: red; }</style>", &opts);

    assert_eq!(captured.lock().unwrap().as_deref(), Some("scss"));
}

#[test]
fn empty_style_block_skips_callback() {
    let calls: Arc<Mutex<u32>> = Arc::new(Mutex::new(0));
    let calls_clone = calls.clone();
    let cb: StyleFormatter = Arc::new(move |body, _lang| {
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
    let cb: StyleFormatter = Arc::new(move |body, _lang| {
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
    let cb: StyleFormatter = Arc::new(|body, _lang| Ok(format!("FORMATTED_CSS:{}", body)));
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
