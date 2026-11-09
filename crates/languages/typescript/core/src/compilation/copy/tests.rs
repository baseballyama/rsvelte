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

/// The program's only statement, parsed on a large stack: only copying is measured.
fn parse_one_statement(source: &str) -> (SyntaxTree, NodeIdentifier) {
    let mut from = SyntaxTree::new();
    let program = std::thread::scope(|scope| {
        std::thread::Builder::new()
            .stack_size(1 << 30)
            .spawn_scoped(scope, || {
                let range = Span::new(0, u32::try_from(source.len()).expect("small source"));
                parse_program(&mut from, source, range, false).expect("parses")
            })
            .expect("spawns")
            .join()
            .expect("parses on a large stack")
    });
    let Kind::Program(&[statement]) = from.kind(program) else {
        unreachable!("one statement")
    };
    (from, statement)
}

/// Records the order in which nodes reach the rewriter, rewriting none.
struct Order(Vec<NodeIdentifier>);

impl Rewrite for Order {
    fn rewrite(
        &mut self,
        _: &SyntaxTree,
        _: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        self.0.push(identifier);
        None
    }
}

/// Whether two trees have the same tags, spans and child order, compared from a stack.
fn same_shape(a: &SyntaxTree, a_root: NodeIdentifier, b: &SyntaxTree, b_root: NodeIdentifier) {
    let mut pending = vec![(a_root, b_root)];
    while let Some((x, y)) = pending.pop() {
        assert_eq!(a.tag(x), b.tag(y));
        assert_eq!(a.source_location(x), b.source_location(y));
        let (mut xs, mut ys) = (Vec::new(), Vec::new());
        a.for_each_child(x, |c| xs.push(c));
        b.for_each_child(y, |c| ys.push(c));
        assert_eq!(xs.len(), ys.len());
        pending.extend(xs.into_iter().zip(ys));
    }
}

#[test]
fn deep_chains_copy_on_a_small_stack_in_the_order_recursion_offers_them() {
    const LINKS: usize = 100_000;
    for source in [
        format!("a{};", ".b".repeat(LINKS)),
        format!("f{};", "(x)".repeat(LINKS)),
        format!("a{};", " + b".repeat(LINKS)),
        format!("a{};", " || b".repeat(LINKS)),
        "(a.b)(c)[d] + (e || f).g(h);".to_owned(),
    ] {
        let (from, statement) = parse_one_statement(&source);
        let (copied, to, order) = std::thread::scope(|scope| {
            std::thread::Builder::new()
                .stack_size(1 << 20)
                .spawn_scoped(scope, || {
                    let mut to = SyntaxTree::new();
                    let mut order = Order(Vec::new());
                    let copied = copy(&from, &mut to, &mut order, statement);
                    (copied, to, order.0)
                })
                .expect("spawns")
                .join()
                .expect("copies within a 1 MiB stack")
        });
        same_shape(&from, statement, &to, copied);
        // Recursion offers a node, then its inner expression, then the rest of the link.
        let mut expected = Vec::new();
        let mut pending = vec![statement];
        while let Some(node) = pending.pop() {
            expected.push(node);
            let mut children = Vec::new();
            from.for_each_child(node, |c| children.push(c));
            if let Kind::Member {
                property,
                computed: false,
                ..
            } = from.kind(node)
            {
                children.retain(|&c| c != property);
            }
            pending.extend(children.into_iter().rev());
        }
        assert!(order == expected, "{}", &source[..source.len().min(40)]);
    }
}

#[test]
fn deep_blocks_copy_on_a_small_stack_and_each_reaches_the_rewriter_first() {
    const DEPTH: usize = 100_000;
    let source = format!("{}x;{}", "{".repeat(DEPTH), "}".repeat(DEPTH));
    let (from, outer) = parse_one_statement(&source);
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
