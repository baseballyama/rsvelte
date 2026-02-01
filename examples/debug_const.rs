use svelte_compiler_rust::{CompileOptions, GenerateMode, ParseOptions, compile, parse};

fn main() {
    // Test const tag parsing
    let input = r#"{#if true}
    {@const a = b}
    {@const b = a}
    <h1>hello {a}</h1>
{/if}
"#;
    println!("=== Input ===");
    println!("{}", input);

    // Parse the component
    println!("\n=== Parsed AST ===");
    let parse_options = ParseOptions {
        filename: Some("Main.svelte".to_string()),
        ..Default::default()
    };
    match parse(input, parse_options) {
        Ok(parsed) => {
            // Check if there are ConstTags in the IfBlock
            for node in &parsed.fragment.nodes {
                if let svelte_compiler_rust::ast::template::TemplateNode::IfBlock(if_block) = node {
                    println!(
                        "Found IfBlock with {} nodes in consequent",
                        if_block.consequent.nodes.len()
                    );
                    for (i, child) in if_block.consequent.nodes.iter().enumerate() {
                        match child {
                            svelte_compiler_rust::ast::template::TemplateNode::ConstTag(tag) => {
                                let svelte_compiler_rust::ast::js::Expression::Value(value) =
                                    &tag.declaration;
                                println!(
                                    "  Node {}: ConstTag with declaration type: {:?}",
                                    i,
                                    value.get("type")
                                );
                                println!(
                                    "    left: {:?}",
                                    value.get("left").and_then(|l| l.get("name"))
                                );
                                println!(
                                    "    right: {:?}",
                                    value.get("right").and_then(|r| r.get("name"))
                                );
                            }
                            svelte_compiler_rust::ast::template::TemplateNode::Text(t) => {
                                println!("  Node {}: Text '{}'", i, t.data.replace('\n', "\\n"));
                            }
                            _ => {
                                println!("  Node {}: {:?}", i, std::any::type_name_of_val(&child));
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            println!("Parse error: {:?}", e);
        }
    }

    // Try to compile
    println!("\n=== Compile Result ===");
    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("Main.svelte".to_string()),
        ..Default::default()
    };
    match compile(input, options) {
        Ok(_result) => println!("Compilation succeeded (expected error!)"),
        Err(e) => println!("Compilation failed with: {:?}", e),
    }
}
