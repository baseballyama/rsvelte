use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_typescript::scope::{Binding, DeclarationKind};
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::{ConditionType, TypeFacts};

impl TypeFacts {
    pub(crate) fn infer(component: &Component, resolution: &Resolution, source: &str) -> Self {
        let tree = &component.javascript;
        let mut facts = Self::new(
            (0..tree.len())
                .map(|index| literal_type(tree, source, NodeIdentifier(index as u32)))
                .collect(),
        );
        let mut asserted = vec![false; tree.len()];
        let mut declared = vec![None; resolution.sem.bindings.len()];
        for annotation in &tree.typescript {
            match annotation.kind {
                TypeScriptKind::Annotation => {
                    if let Some(binding) = resolution.sem.binding_of(annotation.node) {
                        declared[binding.index()]
                            .get_or_insert_with(|| annotation_type(tree, source, annotation.span));
                    }
                }
                TypeScriptKind::Optional => {
                    if let Some(binding) = resolution.sem.binding_of(annotation.node) {
                        declared[binding.index()] = Some(ConditionType::Unknown);
                    }
                }
                TypeScriptKind::As | TypeScriptKind::Assertion => {
                    asserted[annotation.node.index()] = true;
                    facts.nodes[annotation.node.index()] =
                        annotation_type(tree, source, annotation.span);
                }
                _ => {}
            }
        }
        facts.resolve_bindings(tree, resolution, &declared, &asserted);
        for reference in &resolution.sem.references {
            if asserted[reference.node.index()] {
                continue;
            }
            let Some(binding) = reference.binding else {
                continue;
            };
            let info = &resolution.sem.bindings[binding];
            let span = tree
                .source_location(reference.node)
                .span()
                .expect("a source reference has a span");
            let in_script = [component.instance.as_ref(), component.module.as_ref()]
                .into_iter()
                .flatten()
                .any(|script| {
                    script.content.start_offset <= span.start_offset
                        && span.end_offset <= script.content.end_offset
                });
            facts.nodes[reference.node.index()] = if !in_script
                && matches!(info.kind, DeclarationKind::Let | DeclarationKind::Variable)
            {
                ConditionType::Unknown
            } else {
                facts.get(info.node)
            };
        }
        facts
    }

    fn resolve_bindings(
        &mut self,
        tree: &SyntaxTree,
        resolution: &Resolution,
        declared: &[Option<ConditionType>],
        asserted: &[bool],
    ) {
        let mut completed = vec![false; resolution.sem.bindings.len()];
        let mut chain = Vec::new();
        for (binding, _) in resolution.sem.bindings.iter_enumerated() {
            let mut current = binding;
            while !completed[current.index()] {
                completed[current.index()] = true;
                let info = &resolution.sem.bindings[current];
                chain.push(current);
                if declared[current.index()].is_some()
                    || info.kind != DeclarationKind::Const
                    || info.writes != 0
                {
                    break;
                }
                let Some(initializer) = info.initializer(tree) else {
                    break;
                };
                if asserted[initializer.index()] || !tree.is_identifier(initializer) {
                    break;
                }
                let Some(dependency) = resolution.sem.binding_of(initializer) else {
                    break;
                };
                current = dependency;
            }
            while let Some(current) = chain.pop() {
                let info = &resolution.sem.bindings[current];
                self.nodes[info.node.index()] = declared[current.index()]
                    .unwrap_or_else(|| self.initializer_type(tree, resolution, info, asserted));
            }
        }
    }

    fn initializer_type(
        &self,
        tree: &SyntaxTree,
        resolution: &Resolution,
        binding: &Binding,
        asserted: &[bool],
    ) -> ConditionType {
        if binding.kind != DeclarationKind::Const || binding.writes != 0 {
            return ConditionType::Unknown;
        }
        let Some(initializer) = binding.initializer(tree) else {
            return ConditionType::Unknown;
        };
        if !asserted[initializer.index()]
            && tree.is_identifier(initializer)
            && let Some(dependency) = resolution.sem.binding_of(initializer)
        {
            return self.get(resolution.sem.bindings[dependency].node);
        }
        self.get(initializer)
    }
}

fn annotation_type(tree: &SyntaxTree, source: &str, span: Span) -> ConditionType {
    let start = tree
        .tokens
        .after(span.start_offset)
        .expect("an annotation contains a token");
    let mut tokens = tree
        .tokens
        .since(start.index())
        .iter()
        .take_while(|token| token.span.end_offset <= span.end_offset);
    match (tokens.next(), tokens.next()) {
        (Some(token), None) => match token.span.text(source) {
            "true" => ConditionType::Truthy,
            "false" => ConditionType::Falsy,
            "null" | "undefined" => ConditionType::Nullish,
            "boolean" | "number" | "string" | "bigint" | "symbol" => ConditionType::NonNullish,
            _ => ConditionType::Unknown,
        },
        _ => ConditionType::Unknown,
    }
}

fn literal_type(tree: &SyntaxTree, source: &str, node: NodeIdentifier) -> ConditionType {
    match tree.kind(node) {
        Kind::Boolean(true)
        | Kind::Object(_)
        | Kind::Array(_)
        | Kind::Arrow { .. }
        | Kind::Function { .. }
        | Kind::Class(_)
        | Kind::Regex { .. } => ConditionType::Truthy,
        Kind::Boolean(false) => ConditionType::Falsy,
        Kind::Null => ConditionType::Nullish,
        Kind::Number(value) => {
            if value == 0.0 || value.is_nan() {
                ConditionType::Falsy
            } else {
                ConditionType::Truthy
            }
        }
        Kind::String => {
            if tree.str_value(node, source).is_empty() {
                ConditionType::Falsy
            } else {
                ConditionType::Truthy
            }
        }
        _ => ConditionType::Unknown,
    }
}
