use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::compilation::copy::{Rewrite, copy};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_typescript_compile::codegen::print_program;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
struct Key {
    file: u32,
    artifact: u32,
    node: NodeIdentifier,
}
#[derive(Clone, Copy, Debug)]
struct Proof {
    revision: u32,
    absent: bool,
    pure: bool,
}
struct Conditional<'a> {
    file: u32,
    revision: u32,
    artifact: u32,
    facts: &'a HashMap<Key, Proof>,
}
impl Rewrite for Conditional<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        node: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let proof = self.facts.get(&Key {
            file: self.file,
            artifact: self.artifact,
            node,
        })?;
        if proof.revision != self.revision || !proof.absent || !proof.pure {
            return None;
        }
        if let Kind::If {
            alternate: Some(other),
            ..
        } = from.kind(node)
        {
            Some(copy(from, to, self, other))
        } else {
            None
        }
    }
}
const SOURCE: &str = "if (false) 'danger'; else 'primary';";

fn tree() -> (Arc<SyntaxTree>, NodeIdentifier, NodeIdentifier) {
    let mut tree = SyntaxTree::new();
    let root = rsvelte_typescript::parser::parse_program(
        &mut tree,
        SOURCE,
        Span::new(0, u32::try_from(SOURCE.len()).expect("small source")),
        false,
    )
    .expect("valid source");
    let Kind::Program(body) = tree.kind(root) else {
        panic!("program expected")
    };
    let branch = body[0];
    (Arc::new(tree), root, branch)
}
fn main() {
    fn sync<T: Send + Sync>() {}
    sync::<SyntaxTree>();
    let (first, root, branch) = tree();
    let (second, second_root, second_branch) = tree();
    assert_eq!(branch, second_branch);
    let Kind::If {
        alternate: Some(alternate),
        ..
    } = first.kind(branch)
    else {
        panic!("if expected")
    };
    let alternate_span = first.source_location(alternate).span();
    let before = print_program(&first, SOURCE, root).out;
    let len = first.len();
    let facts = HashMap::from([(
        Key {
            file: 1,
            artifact: 1,
            node: branch,
        },
        Proof {
            revision: 7,
            absent: true,
            pure: true,
        },
    )]);
    let scenarios = [
        (1, vec![(7, 1, true), (8, 1, false), (7, 2, false)]),
        (2, vec![(7, 1, false)]),
    ];
    std::thread::scope(|scope| {
        let jobs: Vec<_> = scenarios
            .into_iter()
            .map(|(file, stages)| {
                let facts = &facts;
                let input = if file == 1 { &first } else { &second };
                let input_root = if file == 1 { root } else { second_root };
                scope.spawn(move || {
                    let mut emitted = Vec::new();
                    for (revision, artifact, removed) in stages {
                        let mut output = SyntaxTree::new();
                        let mut rewrite = Conditional {
                            file,
                            revision,
                            artifact,
                            facts,
                        };
                        let root = copy(input, &mut output, &mut rewrite, input_root);
                        let Kind::Program(body) = output.kind(root) else {
                            panic!("program expected")
                        };
                        assert_eq!(matches!(output.kind(body[0]), Kind::If { .. }), !removed);
                        if removed {
                            assert_eq!(output.source_location(body[0]).span(), alternate_span);
                        }
                        emitted.push(print_program(&output, SOURCE, root).out);
                    }
                    emitted.join("\n")
                })
            })
            .collect();
        for job in jobs {
            println!("{}", job.join().expect("file worker failed"));
        }
    });
    assert_eq!(first.len(), len);
    assert_eq!(print_program(&first, SOURCE, root).out, before);
    assert!(matches!(first.kind(branch), Kind::If { .. }));
    println!(
        "Passed: immutable input, tree rewrite, source span, file namespace, stale proof, Sync."
    );
}
