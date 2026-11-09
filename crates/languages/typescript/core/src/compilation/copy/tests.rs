use rsvelte_kernel::source::positions::Span;

use super::{Rewrite, copy};
use crate::parser::parse_program;
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree};

/// Records the blocks it sees and replaces the one at `replace` with an empty block.
struct Blocks {
    seen: Vec<NodeIdentifier>,
    replace: usize,
}

impl Rewrite for Blocks {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if !matches!(from.kind(identifier), Kind::Block(_)) {
            return None;
        }
        self.seen.push(identifier);
        (self.seen.len() == self.replace).then(|| to.block(&[], from.source_location(identifier)))
    }
}

/// How many blocks nest from `node` down, and whether the innermost holds a statement.
fn depth(tree: &SyntaxTree, mut node: NodeIdentifier) -> (usize, bool) {
    let mut depth = 0;
    loop {
        let Kind::Block(body) = tree.kind(node) else {
            return (depth, true);
        };
        depth += 1;
        match body {
            [] => return (depth, false),
            [inner] => node = *inner,
            _ => unreachable!("one statement per level"),
        }
    }
}

#[test]
fn deep_blocks_copy_on_a_small_stack_and_each_reaches_the_rewriter_first() {
    const DEPTH: usize = 100_000;
    let source = format!("{}x;{}", "{".repeat(DEPTH), "}".repeat(DEPTH));
    let mut from = SyntaxTree::new();
    let program = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                let range = Span::new(0, u32::try_from(source.len()).expect("small source"));
                parse_program(&mut from, &source, range, false).expect("parses")
            })
            .expect("spawns")
            .join()
            .expect("parses on a large stack")
    });
    let Kind::Program(&[outer]) = from.kind(program) else {
        unreachable!("one statement")
    };
    for (replace, expected) in [(0, (DEPTH, true)), (7, (7, false))] {
        let (copied, to, seen) = std::thread::scope(|scope| {
            std::thread::Builder::new()
                .stack_size(1 << 20)
                .spawn_scoped(scope, || {
                    let mut to = SyntaxTree::new();
                    let mut blocks = Blocks {
                        seen: Vec::new(),
                        replace,
                    };
                    let copied = copy(&from, &mut to, &mut blocks, outer);
                    (copied, to, blocks.seen)
                })
                .expect("spawns")
                .join()
                .expect("copies within a 1 MiB stack")
        });
        assert_eq!(depth(&to, copied), expected);
        let walked = if replace == 0 { DEPTH } else { replace };
        assert_eq!(seen.len(), walked);
        let mut node = outer;
        for &block in &seen {
            assert_eq!(block, node);
            if let Kind::Block(&[inner]) = from.kind(node) {
                node = inner;
            }
        }
    }
}
