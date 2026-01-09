// OXCのserializeフィーチャーをテストする一時的なファイル
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn main() {
    let source = "const x = 1 + 2;";
    let allocator = Allocator::default();
    let source_type = SourceType::default();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    // OXCのAST構造体がSerializeトレイトを実装しているかテスト
    let json = serde_json::to_string_pretty(&result.program).expect("Failed to serialize");
    println!("{}", json);
}
