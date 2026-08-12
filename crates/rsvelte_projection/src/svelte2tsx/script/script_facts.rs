use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::ast_utils::collect_binding_names;
use super::stores::{
    StoreScanContext, binding_pattern_mentions_props, collect_self_named_rune_call_positions,
};

pub(super) struct ScriptFacts {
    pub(super) type_assertions: Vec<TypeAssertionFacts>,
    pub(super) arrow_generic_commas: Vec<u32>,
    #[cfg(test)]
    pub(super) visitor_dispatches: VisitorDispatches,
}

impl ScriptFacts {
    pub(super) fn collect(
        program: &oxc::Program,
        offset: u32,
        raw_content: &str,
        is_instance_script: bool,
        store_scan: &mut StoreScanContext<'_>,
    ) -> Self {
        store_scan.begin_script_facts();
        let collect_store_facts = store_scan.has_dollar();
        if collect_store_facts {
            collect_self_named_rune_call_positions(store_scan, program, offset);
        }
        let mut collector = ScriptFactsCollector {
            offset,
            raw_content,
            // Official resolves stores over the INSTANCE script only, so the
            // module pass collects no store facts at all.
            collect_store_facts: collect_store_facts && is_instance_script,
            store_scan,
            props_id_calls: Vec::new(),
            has_props_rune_declaration: false,
            facts: Self {
                type_assertions: Vec::new(),
                arrow_generic_commas: Vec::new(),
                #[cfg(test)]
                visitor_dispatches: VisitorDispatches::default(),
            },
        };
        collector.visit_program(program);
        collector.commit_props_id_calls();
        collector.store_scan.finish_script_facts();
        collector.facts
    }
}

pub(super) struct TypeAssertionFacts {
    pub(super) assertion_start: u32,
    pub(super) type_start: u32,
    pub(super) type_end: u32,
    pub(super) expr_start: u32,
    pub(super) expr_end: u32,
}

#[cfg(test)]
#[derive(Debug, Default, PartialEq, Eq)]
pub(super) struct VisitorDispatches {
    pub(super) functions: usize,
    pub(super) arrows: usize,
    pub(super) type_assertions: usize,
}

struct ScriptFactsCollector<'r, 'c, 's> {
    offset: u32,
    raw_content: &'r str,
    collect_store_facts: bool,
    store_scan: &'c mut StoreScanContext<'s>,
    /// `$props` positions of `$props.id()` calls, kept aside until the whole
    /// script is walked because the declaration that validates them may come
    /// after (upstream filters the collected list at the end for the same reason).
    props_id_calls: Vec<u32>,
    has_props_rune_declaration: bool,
    facts: ScriptFacts,
}

impl ScriptFactsCollector<'_, '_, '_> {
    fn add_params(&mut self, params: &oxc::FormalParameters, span: oxc_span::Span) {
        if !self.collect_store_facts {
            return;
        }
        let src_span = (span.start + self.offset, span.end + self.offset);
        for item in &params.items {
            let mut names = Vec::new();
            collect_binding_names(&item.pattern, &mut names);
            for name in names {
                self.store_scan.add_dollar_param_shadow(&name, src_span);
            }
        }
    }

    /// Source text of `span`, mirroring upstream's `node.getText()` comparisons.
    fn text(&self, span: oxc_span::Span) -> &str {
        self.raw_content
            .get(span.start as usize..span.end as usize)
            .unwrap_or_default()
    }

    /// Upstream's `isPropsDeclarationRune`: a binding named `props` whose
    /// initializer is literally `$props()`.
    fn note_props_rune_declaration(&mut self, declarator: &oxc::VariableDeclarator<'_>) {
        if !self.collect_store_facts || self.has_props_rune_declaration {
            return;
        }
        if let Some(init) = declarator.init.as_ref()
            && self.text(init.span()) == "$props()"
            && binding_pattern_mentions_props(&declarator.id)
        {
            self.has_props_rune_declaration = true;
        }
    }

    /// Upstream's `isPropsId`: the `$props` of a `$props.id()` call.
    fn note_props_id_call(&mut self, call: &oxc::CallExpression<'_>) {
        if !self.collect_store_facts || !call.arguments.is_empty() {
            return;
        }
        if let oxc::Expression::StaticMemberExpression(member) = &call.callee
            && self.text(member.span) == "$props.id"
            && let oxc::Expression::Identifier(object) = &member.object
        {
            self.props_id_calls.push(object.span.start + self.offset);
        }
    }

    /// `$props.id()` is the component-id rune, never a `props` store
    /// auto-subscription — but only when `props` really came from `$props()`,
    /// which is exactly when upstream drops these from store resolution.
    fn commit_props_id_calls(&mut self) {
        if !self.has_props_rune_declaration {
            return;
        }
        for pos in std::mem::take(&mut self.props_id_calls) {
            self.store_scan.add_self_named_rune_call(pos);
        }
    }

    fn add_arrow_generic_comma(&mut self, arrow: &oxc::ArrowFunctionExpression<'_>) {
        let Some(type_parameters) = arrow.type_parameters.as_deref() else {
            return;
        };
        if type_parameters.params.len() != 1 {
            return;
        }
        let param = &type_parameters.params[0];
        if param.constraint.is_some() || param.default.is_some() {
            return;
        }
        let bytes = self.raw_content.as_bytes();
        let mut index = param.span.end as usize;
        while index < bytes.len() && bytes[index].is_ascii_whitespace() {
            index += 1;
        }
        if index >= bytes.len() || bytes[index] != b',' {
            self.facts
                .arrow_generic_commas
                .push(param.span.end + self.offset);
        }
    }
}

impl<'a> Visit<'a> for ScriptFactsCollector<'_, '_, '_> {
    fn visit_function(&mut self, it: &oxc::Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        #[cfg(test)]
        {
            self.facts.visitor_dispatches.functions += 1;
        }
        self.add_params(&it.params, it.span);
        oxc_ast_visit::walk::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        #[cfg(test)]
        {
            self.facts.visitor_dispatches.arrows += 1;
        }
        self.add_params(&it.params, it.span);
        self.add_arrow_generic_comma(it);
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &oxc::VariableDeclarator<'a>) {
        self.note_props_rune_declaration(it);
        oxc_ast_visit::walk::walk_variable_declarator(self, it);
    }

    fn visit_call_expression(&mut self, it: &oxc::CallExpression<'a>) {
        self.note_props_id_call(it);
        oxc_ast_visit::walk::walk_call_expression(self, it);
    }

    fn visit_ts_type_assertion(&mut self, it: &oxc::TSTypeAssertion<'a>) {
        #[cfg(test)]
        {
            self.facts.visitor_dispatches.type_assertions += 1;
        }
        let (type_start, type_end) = oxc_ast_span(&it.type_annotation);
        let expression = it.expression.span();
        self.facts.type_assertions.push(TypeAssertionFacts {
            assertion_start: it.span.start + self.offset,
            type_start: type_start + self.offset,
            type_end: type_end + self.offset,
            expr_start: expression.start + self.offset,
            expr_end: expression.end + self.offset,
        });
        oxc_ast_visit::walk::walk_ts_type_assertion(self, it);
    }
}

fn oxc_ast_span(ty: &oxc::TSType) -> (u32, u32) {
    use oxc::TSType::{
        TSAnyKeyword, TSArrayType, TSBigIntKeyword, TSBooleanKeyword, TSConditionalType,
        TSConstructorType, TSFunctionType, TSImportType, TSIndexedAccessType, TSInferType,
        TSIntersectionType, TSIntrinsicKeyword, TSLiteralType, TSMappedType, TSNamedTupleMember,
        TSNeverKeyword, TSNullKeyword, TSNumberKeyword, TSObjectKeyword, TSStringKeyword,
        TSSymbolKeyword, TSTemplateLiteralType, TSThisType, TSTupleType, TSTypeLiteral,
        TSTypeOperatorType, TSTypePredicate, TSTypeQuery, TSTypeReference, TSUndefinedKeyword,
        TSUnionType, TSUnknownKeyword, TSVoidKeyword,
    };
    let span = match ty {
        TSAnyKeyword(t) => t.span,
        TSBigIntKeyword(t) => t.span,
        TSBooleanKeyword(t) => t.span,
        TSIntrinsicKeyword(t) => t.span,
        TSNeverKeyword(t) => t.span,
        TSNullKeyword(t) => t.span,
        TSNumberKeyword(t) => t.span,
        TSObjectKeyword(t) => t.span,
        TSStringKeyword(t) => t.span,
        TSSymbolKeyword(t) => t.span,
        TSUndefinedKeyword(t) => t.span,
        TSUnknownKeyword(t) => t.span,
        TSVoidKeyword(t) => t.span,
        TSThisType(t) => t.span,
        TSTypeReference(t) => t.span,
        TSArrayType(t) => t.span,
        TSConditionalType(t) => t.span,
        TSConstructorType(t) => t.span,
        TSFunctionType(t) => t.span,
        TSImportType(t) => t.span,
        TSIndexedAccessType(t) => t.span,
        TSInferType(t) => t.span,
        TSIntersectionType(t) => t.span,
        TSLiteralType(t) => t.span,
        TSMappedType(t) => t.span,
        TSNamedTupleMember(t) => t.span,
        TSTemplateLiteralType(t) => t.span,
        TSTupleType(t) => t.span,
        TSTypeLiteral(t) => t.span,
        TSTypeOperatorType(t) => t.span,
        TSTypePredicate(t) => t.span,
        TSTypeQuery(t) => t.span,
        TSUnionType(t) => t.span,
        _ => return (0, 0),
    };
    (span.start, span.end)
}

#[cfg(test)]
mod tests {
    use crate::ast::oxc_program::RetainedProgram;

    use super::*;

    #[test]
    fn nested_cross_product_is_dispatched_once_with_absolute_offsets() {
        let source = "\
function outer($outer) {
    return <Outer>(() => {
        const inner = <T>($arrow: T) =>
            <Inner>(function nested($nested) { return <Leaf>$nested; });
        return inner;
    })();
}";
        let retained = RetainedProgram::parse(source, true);
        assert!(retained.diagnostics().is_empty());

        let offset = 41;
        let mut store_scan = StoreScanContext::new(source, false, None, None);
        let facts = ScriptFacts::collect(retained.program(), offset, source, true, &mut store_scan);

        assert_eq!(
            facts.visitor_dispatches,
            VisitorDispatches {
                functions: 2,
                arrows: 2,
                type_assertions: 3,
            }
        );
        assert_eq!(
            facts.arrow_generic_commas,
            vec![source.find("<T>").unwrap() as u32 + 2 + offset]
        );

        let outer_start = source.find("function outer").unwrap() as u32 + offset;
        let nested_start = source.find("function nested").unwrap() as u32 + offset;
        let arrow_start = source.find("<T>").unwrap() as u32 + offset;
        assert_eq!(
            store_scan.dollar_param_shadow["outer"],
            vec![(outer_start, source.len() as u32 + offset)]
        );
        assert_eq!(
            store_scan.dollar_param_shadow["arrow"],
            vec![(
                arrow_start,
                source.find(";\n        return inner").unwrap() as u32 + offset
            )]
        );
        assert_eq!(
            store_scan.dollar_param_shadow["nested"],
            vec![(
                nested_start,
                source.find("; });").unwrap() as u32 + 3 + offset
            )]
        );

        let assertion_starts: Vec<u32> = facts
            .type_assertions
            .iter()
            .map(|assertion| assertion.assertion_start)
            .collect();
        assert_eq!(
            assertion_starts,
            ["<Outer>", "<Inner>", "<Leaf>"]
                .map(|needle| source.find(needle).unwrap() as u32 + offset)
        );
    }
}
