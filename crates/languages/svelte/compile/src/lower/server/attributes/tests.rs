use crate::{CompileOptions, Target, compile};

fn server(source: &str) -> String {
    let options = CompileOptions {
        generate: Target::Server,
        ..CompileOptions::default()
    };
    compile(source, &options).expect("compiles").js.code
}

#[test]
fn a_style_directive_text_is_escaped_for_a_quoted_attribute() {
    let code = server(
        "<div style:--label=\"Tom &amp; Jerry\" style:font-family='a \"b\" <c>' \
         style:--mixed=\"a &amp; {1 + x} &lt; b\"></div><div {...rest} \
         style:--label=\"Tom &amp; Jerry\"></div>",
    );
    for expected in [
        r#""--label": "Tom &amp; Jerry""#,
        r#""font-family": "a &quot;b&quot; &lt;c>""#,
        "`a & ${$.stringify(1 + x)} < b`",
    ] {
        assert!(code.contains(expected), "{expected} in {code}");
    }
    assert_eq!(
        code.matches(r#""--label": "Tom &amp; Jerry""#).count(),
        2,
        "{code}"
    );
}
