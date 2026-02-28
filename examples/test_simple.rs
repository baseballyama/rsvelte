use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // reactive-value-coerce-precedence
    let input1 = "<h1>{1 === 1}</h1>";

    // spread-width-height-attributes
    let input2 = r#"<img height="100%" width="100%" alt="" {...$$restProps} />"#;

    let opts = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    println!("=== reactive-value-coerce-precedence ===");
    match compile(input1, opts.clone()) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }

    println!("\n=== spread-width-height-attributes ===");
    match compile(input2, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
