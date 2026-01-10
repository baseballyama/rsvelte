//! Example demonstrating CSS printing functionality.
//!
//! This example parses a Svelte component with CSS and prints it back.

use svelte_compiler_rust::compiler::print::print;
use svelte_compiler_rust::{ParseOptions, parse};

fn main() {
    let source = r#"
<script>
  let count = 0;
</script>

<h1 class="title">Counter: {count}</h1>
<button on:click={() => count++}>Increment</button>

<style>
  .title {
    color: blue;
    font-size: 2rem;
    font-weight: bold;
  }

  button {
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #45a049;
  }

  @media screen and (max-width: 600px) {
    .title {
      font-size: 1.5rem;
    }

    button {
      padding: 8px 16px;
    }
  }
</style>
"#;

    println!("=== Original Source ===");
    println!("{}", source);
    println!();

    // Parse the component
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };

    match parse(source, parse_options) {
        Ok(ast) => {
            println!("=== Parsed AST ===");
            println!("Has CSS: {}", ast.css.is_some());
            if let Some(ref css) = ast.css {
                println!("CSS children count: {}", css.children.len());
            }
            println!();

            // Print the AST back to source
            match print(&ast, None) {
                Ok(result) => {
                    println!("=== Printed Output ===");
                    println!("{}", result.code);
                    println!();
                    println!("=== Success! ===");
                }
                Err(e) => {
                    eprintln!("Print error: {}", e);
                }
            }
        }
        Err(e) => {
            eprintln!("Parse error: {:?}", e);
        }
    }
}
