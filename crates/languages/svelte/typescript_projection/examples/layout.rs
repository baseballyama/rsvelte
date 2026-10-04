#![expect(clippy::print_stdout, reason = "reports measured memory layout")]

use rsvelte_svelte_typescript_projection::syntax_tree::{Node, NodeIdentifier, SyntaxTree};

fn main() {
    println!(
        "Node: {} bytes, alignment {}",
        size_of::<Node>(),
        align_of::<Node>()
    );
    println!("NodeIdentifier: {} bytes", size_of::<NodeIdentifier>());
    println!(
        "SyntaxTree: {} bytes, alignment {}",
        size_of::<SyntaxTree>(),
        align_of::<SyntaxTree>()
    );
}
