use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn main() {
    let allocator = Allocator::default();
    let source_type = SourceType::mjs();

    // Test parsing "(42 = nope)"
    let content = "(42 = nope)";
    let parser = Parser::new(&allocator, content, source_type);
    let result = parser.parse();

    println!("Content: {}", content);
    println!("Number of errors: {}", result.errors.len());

    for err in &result.errors {
        println!("Error message: {}", err.message);
    }

    if result.errors.is_empty() {
        println!("AST body count: {}", result.program.body.len());
        if let Some(stmt) = result.program.body.first() {
            println!("First statement type: {:?}", stmt);
        }
    }
}
