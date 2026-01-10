//! Example demonstrating the print module functionality.
//!
//! This example shows how to parse Svelte source code and print it back.

use svelte_compiler_rust::compiler::print::print;
use svelte_compiler_rust::{ParseOptions, parse};

fn main() {
    println!("=== Svelte Compiler Print Module Demo ===\n");

    // Example 1: Simple element
    example_1();

    // Example 2: Element with attributes
    example_2();

    // Example 3: Nested elements
    example_3();

    // Example 4: Self-closing element
    example_4();

    // Example 5: Comments
    example_5();
}

fn example_1() {
    println!("Example 1: Simple Element");
    println!("--------------------------");

    let source = "<h1>Hello World</h1>";
    print_example(source);
}

fn example_2() {
    println!("\nExample 2: Element with Attributes");
    println!("-----------------------------------");

    let source = r#"<div class="container" id="main">Content</div>"#;
    print_example(source);
}

fn example_3() {
    println!("\nExample 3: Nested Elements");
    println!("--------------------------");

    let source = r#"
<div>
    <h1>Title</h1>
    <p>Paragraph text</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
    </ul>
</div>
"#;
    print_example(source);
}

fn example_4() {
    println!("\nExample 4: Self-Closing Element");
    println!("--------------------------------");

    let source = r#"<input type="text" placeholder="Enter name" />"#;
    print_example(source);
}

fn example_5() {
    println!("\nExample 5: Comments");
    println!("-------------------");

    let source = r#"
<!-- Header section -->
<header>
    <h1>My App</h1>
</header>
<!-- Main content -->
<main>
    <p>Content goes here</p>
</main>
"#;
    print_example(source);
}

fn print_example(source: &str) {
    println!("Input:");
    println!("{}", source);
    println!();

    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };

    match parse(source, parse_options) {
        Ok(ast) => match print(&ast, None) {
            Ok(result) => {
                println!("Output:");
                println!("{}", result.code);
            }
            Err(e) => {
                println!("Print error: {:?}", e);
            }
        },
        Err(e) => {
            println!("Parse error: {:?}", e);
        }
    }
}
