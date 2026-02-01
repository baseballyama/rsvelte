use oxc_allocator::Allocator;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

fn main() {
    let code = "(() => count++)";
    let allocator = Allocator::default();
    let ret = OxcParser::new(&allocator, code, SourceType::default()).parse();

    println!("Errors: {:?}", ret.errors);
    println!("Body length: {}", ret.program.body.len());

    if let Some(stmt) = ret.program.body.first() {
        println!("First statement type: {:?}", stmt);
        if let oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) = stmt
            && let oxc_ast::ast::Expression::ParenthesizedExpression(paren) = &expr_stmt.expression
            && let oxc_ast::ast::Expression::ArrowFunctionExpression(arrow) = &paren.expression
        {
            println!(
                "Arrow function body statements: {:?}",
                arrow.body.statements.len()
            );
            for stmt in &arrow.body.statements {
                println!("  Statement: {:?}", stmt);
            }
            println!("expression: {}", arrow.expression);
        }
    }
}
