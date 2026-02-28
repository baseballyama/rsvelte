use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = "<script>\n\texport let x = 42\n\n\tlet a;\n\tlet b;\n\n\t$: a = b;\n\t$: b = (function(a) {\n\t\treturn a;\n\t}(x));\n</script>\n\n<p>{a} {b}</p>";

    let opts = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
