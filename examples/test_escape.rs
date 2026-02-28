use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    let src = r#"<script>
	import Widget from "./Widget.svelte";
</script>

<code>`$&#123;foo}\n`</code>
{@html "`"}
<div title="`$&#123;foo}\n`">foo</div>
<Widget value="`$&#123;foo}\n`"/>
<div>
	/ $clicks: {0} `tim${"e"}s` \
</div>"#;
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    unsafe {
        std::env::set_var("DEBUG_CODEGEN", "1");
    }
    match compile(src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
