use std::fs;
use std::sync::Arc;
use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::compile;

fn main() {
    let input = fs::read_to_string("/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/css/samples/host/input.svelte").unwrap();

    let mut options = CompileOptions::default();
    options.css_hash = Some(Arc::new(|_| "svelte-xyz".to_string()));

    match compile(&input, options) {
        Ok(result) => {
            println!("=== ACTUAL CSS ===");
            if let Some(css) = result.css {
                println!("{}", css.code);
            } else {
                println!("No CSS output");
            }

            // Debug: print DOM structure elements
            if let Some(analysis) = result.analysis {
                println!("\n=== DOM Structure ===");
                for (i, el) in analysis.css.dom_structure.elements.iter().enumerate() {
                    println!(
                        "[{}] tag_name={}, is_root_child={}, classes={:?}",
                        i, el.tag_name, el.is_root_child, el.classes
                    );
                }
            }
        }
        Err(e) => {
            println!("Error: {:?}", e);
        }
    }
}
