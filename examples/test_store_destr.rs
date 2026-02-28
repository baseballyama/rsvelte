use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    let src = r#"<script>
	import { writable } from "svelte/store";
	let userName1 = writable("init1");
	let userName2 = writable("init2");
	let obj = { userName1: "user1", $userName2: "user2" };
	({userName1: $userName1, $userName2 } = obj);
</script>
<div>{$userName1}</div>
<div>{$userName2}</div>"#;
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
