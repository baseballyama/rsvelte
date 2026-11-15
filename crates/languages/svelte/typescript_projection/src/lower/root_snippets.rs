//! svelte2tsx's root snippets beside a module script: a snippet that reads no instance value moves
//! before the render function, the rest to its start.

use oxc_ast::AstKind;
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use super::{Builder, Node, NodeIdentifier, Result};

impl Builder<'_> {
    /// The root snippets that stay in the render function, and puts the others, which svelte2tsx
    /// moves before it, in `module_snippets`.
    pub(super) fn root_snippets(&mut self) -> Result<Option<NodeIdentifier>> {
        let root = self.component.root;
        let moved = self.moved_snippets();
        let (mut stay, mut leave) = (Vec::new(), Vec::new());
        for &identifier in self.component.children(root) {
            if !matches!(
                self.component.node(identifier),
                TemplateNode::Snippet { .. }
            ) {
                continue;
            }
            let Some(node) = self.node(identifier)? else {
                continue;
            };
            if moved.contains(&identifier) {
                leave.push(node);
            } else {
                stay.push(node);
            }
        }
        if !leave.is_empty() {
            let list = self.tree.list(&leave);
            self.module_snippets = Some(self.tree.push(Node::Statements(list)));
        }
        Ok((!stay.is_empty()).then(|| {
            let list = self.tree.list(&stay);
            self.tree.push(Node::Statements(list))
        }))
    }

    /// `analyzeSnippets` and `hoist_to_module`: with a module script, each root snippet that reads
    /// no instance value, no `$$props`, `$$restProps` or `$$slots`, and no snippet that stays.
    fn moved_snippets(&self) -> Vec<u32> {
        let (Some(_), Some(resolution)) = (&self.component.module, (self.resolution)()) else {
            return Vec::new();
        };
        let scoping = resolution.scoping();
        let snippets: Vec<(u32, rsvelte_kernel::source::positions::Span, oxc_span::Span)> = self
            .component
            .children(self.component.root)
            .iter()
            .filter_map(|&identifier| match *self.component.node(identifier) {
                TemplateNode::Snippet { name, span, .. } => {
                    Some((identifier, span, self.expression(name).span()))
                }
                _ => None,
            })
            .collect();
        // Each snippet's binding is its name, wherever the template declares it.
        let names: std::collections::HashMap<oxc_span::Span, usize> = snippets
            .iter()
            .enumerate()
            .map(|(index, &(_, _, name))| (name, index))
            .collect();
        let mut symbols = vec![None; snippets.len()];
        for symbol in scoping.symbol_ids() {
            if let Some(&index) = names.get(&scoping.symbol_span(symbol)) {
                symbols[index] = Some(symbol);
            }
        }
        let snippets: Vec<_> = snippets
            .into_iter()
            .zip(symbols)
            .map(|((identifier, span, _), symbol)| (identifier, span, symbol))
            .collect();
        if snippets.is_empty() {
            return Vec::new();
        }
        let is_snippet = |symbol| snippets.iter().any(|&(_, _, s)| s == Some(symbol));
        // Where the template reads a value svelte2tsx disallows, in source order.
        let mut reads: Vec<u32> = Vec::new();
        let mut disallowed: Vec<&str> = Vec::new();
        for symbol in scoping
            .get_bindings(resolution.instance_scope())
            .values()
            .copied()
        {
            let import = matches!(
                resolution.declaration(symbol),
                AstKind::ImportSpecifier(_)
                    | AstKind::ImportDefaultSpecifier(_)
                    | AstKind::ImportNamespaceSpecifier(_)
            );
            if import || is_snippet(symbol) {
                continue;
            }
            disallowed.push(scoping.symbol_name(symbol));
            for &reference in scoping.get_resolved_reference_ids(symbol) {
                reads.push(resolution.reference_span(reference).start);
            }
        }
        for (name, references) in scoping.root_unresolved_references() {
            let name = name.as_str();
            let store = name
                .strip_prefix('$')
                .is_some_and(|store| !store.starts_with('$') && disallowed.contains(&store));
            if store || matches!(name, "$$props" | "$$restProps" | "$$slots") {
                reads.extend(
                    references
                        .iter()
                        .map(|&reference| resolution.reference_span(reference).start),
                );
            }
        }
        reads.sort_unstable();
        let reads_in = |reads: &[u32], span: rsvelte_kernel::source::positions::Span| {
            let first = reads.partition_point(|&at| at < span.start_offset);
            reads.get(first).is_some_and(|&at| at < span.end_offset)
        };
        let mut staying: Vec<bool> = vec![false; snippets.len()];
        // A snippet that reads a staying snippet stays too, until nothing changes.
        loop {
            let mut changed = false;
            for (index, &(_, span, _)) in snippets.iter().enumerate() {
                if !staying[index] && reads_in(&reads, span) {
                    staying[index] = true;
                    changed = true;
                    if let Some(symbol) = snippets[index].2 {
                        for &reference in scoping.get_resolved_reference_ids(symbol) {
                            reads.push(resolution.reference_span(reference).start);
                        }
                        reads.sort_unstable();
                    }
                }
            }
            if !changed {
                break;
            }
        }
        snippets
            .iter()
            .zip(&staying)
            .filter(|&(_, &stays)| !stays)
            .map(|(&(identifier, ..), _)| identifier)
            .collect()
    }
}
