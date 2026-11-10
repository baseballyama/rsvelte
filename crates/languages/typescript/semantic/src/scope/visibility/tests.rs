use std::fmt::Write;

use rsvelte_kernel::source::positions::Span;

use super::super::{Atom, BindingIdentifier, ScopeIdentifier, Semantic, analyze_enclosed};
use rsvelte_typescript_syntax::parser::parse_program;
use rsvelte_typescript_syntax::syntax_tree::SyntaxTree;

/// The definition the index must agree with: the scope chain, walked.
fn walk(s: &Semantic, mut scope: ScopeIdentifier, name: Atom) -> Option<BindingIdentifier> {
    loop {
        if let Some(&b) = s.names.get(&(scope, name)) {
            return Some(b);
        }
        scope = s.scopes[scope].parent?;
    }
}

struct Random(u64);

impl Random {
    fn below(&mut self, n: u32) -> u32 {
        self.0 = self
            .0
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1);
        ((self.0 >> 33) % u64::from(n)) as u32
    }
}

const NAMES: [&str; 4] = ["a", "b", "c", "d"];

/// Statements that nest blocks and functions and declare a few names, some shadowing others.
fn statements(random: &mut Random, depth: u32, out: &mut String) {
    for _ in 0..=random.below(4) {
        let name = NAMES[random.below(4) as usize];
        match random.below(5) {
            0 => write!(out, "let {name} = 1;").expect("writes"),
            1 => write!(out, "var {name};").expect("writes"),
            2 if depth < 6 => {
                out.push('{');
                statements(random, depth + 1, out);
                out.push('}');
            }
            3 if depth < 6 => {
                write!(
                    out,
                    "function {name}({}) {{",
                    NAMES[random.below(4) as usize]
                )
                .expect("writes");
                statements(random, depth + 1, out);
                out.push('}');
            }
            _ => write!(out, "{name};").expect("writes"),
        }
    }
}

#[test]
fn lookup_finds_what_walking_the_scope_chain_finds() {
    let mut random = Random(7);
    let mut compared = 0;
    for _ in 0..200 {
        let (mut module, mut instance) = (String::new(), String::new());
        statements(&mut random, 0, &mut module);
        statements(&mut random, 0, &mut instance);
        let source_text = format!("{module}\n{instance}");
        let mut tree = SyntaxTree::new();
        let module_range = Span::new(0, module.len() as u32);
        let instance_range = Span::new(module.len() as u32 + 1, source_text.len() as u32);
        let module = parse_program(&mut tree, &source_text, module_range, false).expect("parses");
        let program =
            parse_program(&mut tree, &source_text, instance_range, false).expect("parses");
        let s = analyze_enclosed(&tree, Some(module), program, &[]);
        for (scope, _) in s.scopes.iter_enumerated() {
            for name in NAMES {
                let Some(name) = tree.atoms.lookup(name) else {
                    continue;
                };
                assert_eq!(
                    s.lookup(scope, name),
                    walk(&s, scope, name),
                    "{source_text}"
                );
                compared += 1;
            }
        }
    }
    assert!(compared > 1000, "{compared}");
}
