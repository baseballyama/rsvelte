// OXCのserializeフィーチャーをテストする
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn main() {
    let source = "const x = 1 + 2;";
    let allocator = Allocator::default();
    let source_type = SourceType::default();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        eprintln!("Parse errors:");
        for error in &result.errors {
            eprintln!("  {}", error);
        }
        return;
    }

    // OXCのAST構造体がSerializeトレイトを実装しているかテスト
    match serde_json::to_string_pretty(&result.program) {
        Ok(json) => {
            println!("✓ OXC AST can be serialized to JSON!");
            println!("\n{}", json);
        }
        Err(e) => {
            eprintln!("✗ Failed to serialize: {}", e);
        }
    }
}
