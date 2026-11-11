use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, IdentifierReference, PropertyKey, Statement,
    VariableDeclaration, VariableDeclarationKind,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::{Buffer, Builder, Node, NodeIdentifier, Range, Result, Span, Unsupported, span};

struct Edit {
    span: Span,
    replacement: Option<NodeIdentifier>,
}

/// Where svelte2tsx declares a store subscription.
#[derive(Clone, Copy)]
enum StoreAt {
    /// After the top-level statement that ends here.
    After(u32),
    /// First in the instance, or before the template without one.
    Start,
}

impl Builder<'_> {
    pub(super) fn scripts(&mut self) -> Result<NodeIdentifier> {
        let mut edits = self.module_and_store_edits();
        let mut bindings = Buffer::new(0);
        let mut exports = Buffer::new(0);
        let mut props = None;
        let generated_start = self.scratch.len();
        if let Some(script) = &self.component.instance {
            if let Some(&(name, _)) = script
                .attributes
                .iter()
                .find(|(name, _)| name.text(self.source) == "generics")
            {
                return Err(Unsupported::at("generic component contracts", name));
            }
            let program = self.component.javascript.get_program(script.program);
            for statement in &program.body {
                let Some(declaration) =
                    self.instance_export(statement, &mut exports, &mut edits)?
                else {
                    continue;
                };
                for declarator in &declaration.declarations {
                    let Some(initializer) = &declarator.init else {
                        continue;
                    };
                    if self.is_rune(initializer, "$props") {
                        if props.is_some() {
                            return Err(Unsupported::at(
                                "multiple props declarations",
                                span(declarator.id.span()),
                            ));
                        }
                        let annotation = declarator
                            .type_annotation
                            .as_ref()
                            .map(|a| span(a.type_annotation.span()));
                        props = Some(self.props(
                            &declarator.id,
                            annotation,
                            &mut bindings,
                            &mut edits,
                        )?);
                    }
                }
            }
            edits.sort_by_key(|edit| edit.span.start_offset);
            self.script_parts(script.content, &edits);
            self.scratch[generated_start..].rotate_right(1);
        }
        let props = props.unwrap_or_else(|| {
            let callee = self.tree.push(Node::Identifier("Record"));
            let key = self.tree.push(Node::Identifier("string"));
            let value = self.tree.push(Node::Identifier("never"));
            let arguments = self.tree.list(&[key, value]);
            self.tree.push(Node::TypeArguments { callee, arguments })
        });
        let exports = self.tree.list(&exports);
        let exports = self.tree.push(Node::TypeLiteral(exports));
        let bindings = if bindings.is_empty() {
            self.tree.push(Node::StringLiteral(""))
        } else {
            let parts = self.tree.list(&bindings);
            self.tree.push(Node::TypeUnion(parts))
        };
        let helper = self
            .tree
            .push(Node::Identifier("__rsvelte_export_component"));
        let arguments = self.tree.list(&[props, exports, bindings]);
        let callee = self.tree.push(Node::TypeArguments {
            callee: helper,
            arguments,
        });
        let value = self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        });
        Ok(self.tree.push(Node::ExportDefault(value)))
    }

    /// The variable declaration `statement` is or exports, after recording what it exports.
    fn instance_export<'s>(
        &mut self,
        statement: &'s Statement<'s>,
        exports: &mut Buffer<NodeIdentifier>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Option<&'s VariableDeclaration<'s>>> {
        let export = match statement {
            Statement::VariableDeclaration(declaration) => return Ok(Some(&**declaration)),
            Statement::ExportDeclaration(export) => export,
            Statement::ExportDefaultDeclaration(export) => {
                return Err(Unsupported::at(
                    "instance default exports",
                    span(export.span),
                ));
            }
            _ => return Ok(None),
        };
        let declaration = match &export.declaration {
            Declaration::FunctionDeclaration(function) if function.id.is_some() => {
                let name = function.id.as_ref().expect("checked above");
                self.export_property(name.span, exports);
                None
            }
            Declaration::VariableDeclaration(declaration)
                if declaration.kind == VariableDeclarationKind::Const =>
            {
                for declarator in &declaration.declarations {
                    self.export_pattern(&declarator.id, exports)?;
                }
                Some(&**declaration)
            }
            Declaration::TSTypeAliasDeclaration(_) | Declaration::TSInterfaceDeclaration(_) => {
                return Ok(None);
            }
            _ => {
                return Err(Unsupported::at(
                    "instance export contracts",
                    span(export.span),
                ));
            }
        };
        edits.push(Edit {
            span: Span::new(export.span.start, export.declaration.span().start),
            replacement: None,
        });
        Ok(declaration)
    }

    fn export_pattern(
        &mut self,
        pattern: &BindingPattern<'_>,
        exports: &mut Buffer<NodeIdentifier>,
    ) -> Result<()> {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                self.export_property(identifier.span, exports);
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    self.export_pattern(&property.value, exports)?;
                }
                if let Some(rest) = &object.rest {
                    self.export_pattern(&rest.argument, exports)?;
                }
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.export_pattern(&assignment.left, exports)?;
            }
            BindingPattern::ArrayPattern(array) => {
                for element in array.elements.iter().flatten() {
                    self.export_pattern(element, exports)?;
                }
                if let Some(rest) = &array.rest {
                    self.export_pattern(&rest.argument, exports)?;
                }
            }
        }
        Ok(())
    }

    fn export_property(&mut self, name: oxc_span::Span, exports: &mut Buffer<NodeIdentifier>) {
        let name = self.source(name, None);
        let value = self.tree.push(Node::TypeQuery(name));
        exports.push(self.tree.push(Node::TypeProperty { name, value }));
    }

    fn props(
        &mut self,
        pattern: &BindingPattern<'_>,
        annotation: Option<Span>,
        bindings: &mut Buffer<NodeIdentifier>,
        edits: &mut Buffer<Edit>,
    ) -> Result<NodeIdentifier> {
        let BindingPattern::ObjectPattern(object) = pattern else {
            if let Some(span) = annotation {
                return Ok(self.tree.push(Node::SourceCopy { span }));
            }
            return Err(Unsupported::at(
                "untyped props object contracts",
                span(pattern.span()),
            ));
        };
        let mut required = Buffer::new(0);
        let mut optional = Buffer::new(0);
        let rest = object.rest.is_some();
        let siblings = Siblings::new(pattern);
        for property in &object.properties {
            if property.computed {
                return Err(Unsupported::at(
                    "computed props contracts",
                    span(property.span),
                ));
            }
            let default = match &property.value {
                BindingPattern::AssignmentPattern(assignment) => Some(&assignment.right),
                _ => None,
            };
            if let Some(default) = default
                && self.is_rune(default, "$bindable")
            {
                bindings.push(self.property_string(&property.key));
            }
            if annotation.is_none() {
                let name = self.source(property.key.span(), None);
                let value = self.prop_default(default, &siblings);
                let property = self.tree.push(Node::NamedProperty { name, value });
                if default.is_some() {
                    optional.push(property);
                } else {
                    required.push(property);
                }
            }
        }
        if let Some(span) = annotation {
            return Ok(self.tree.push(Node::SourceCopy { span }));
        }
        let name = self.props_name();
        let required = self.tree.list(&required);
        let required = self.tree.push(Node::Object {
            properties: required,
        });
        let optional = self.tree.list(&optional);
        let optional = self.tree.push(Node::Object {
            properties: optional,
        });
        let rest = self
            .tree
            .push(Node::Identifier(if rest { "true" } else { "false" }));
        let arguments = self.tree.list(&[required, optional, rest]);
        let callee = self.tree.push(Node::Identifier("__rsvelte_props"));
        let value = self.tree.push(Node::Call { callee, arguments });
        self.scratch
            .push(self.tree.push(Node::Const { name, value }));
        let value = self.tree.push(Node::TypeQuery(name));
        let replacement = self.tree.push(Node::TypeAnnotation(value));
        let end = pattern.span().end;
        edits.push(Edit {
            span: Span::new(end, end),
            replacement: Some(replacement),
        });
        Ok(value)
    }

    fn prop_default<'e>(
        &mut self,
        default: Option<&'e Expression<'e>>,
        siblings: &Siblings<'e>,
    ) -> NodeIdentifier {
        let Some(mut default) = default else {
            return self.untyped_prop();
        };
        if self.is_rune(default, "$bindable") {
            let Expression::CallExpression(call) = default else {
                // A typed `$bindable(…) as T` is the prop's type as written.
                return self.source(default.span(), None);
            };
            if call.type_arguments.is_some() {
                return self.source(default.span(), None);
            }
            let Some(fallback) = call.arguments.first().and_then(|a| a.as_expression()) else {
                return self.untyped_prop();
            };
            default = fallback;
        }
        let Some(default) = siblings.independent(default) else {
            return self.untyped_prop();
        };
        let value = self.source(default.span(), None);
        if matches!(default, Expression::ArrayExpression(array) if array.elements.is_empty()) {
            let callee = self.tree.push(Node::Identifier("__rsvelte_empty_array"));
            let arguments = self.tree.list(&[value]);
            self.tree.push(Node::Call { callee, arguments })
        } else {
            value
        }
    }

    fn untyped_prop(&mut self) -> NodeIdentifier {
        let callee = self.tree.push(Node::Identifier("__rsvelte_untyped_prop"));
        self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        })
    }

    fn property_string(&mut self, key: &PropertyKey<'_>) -> NodeIdentifier {
        if let PropertyKey::StringLiteral(string) = key {
            self.source(string.span, None)
        } else {
            let text = self.tree.push(Node::Text(span(key.span())));
            let parts = self.tree.list(&[text]);
            self.tree.push(Node::String {
                parts,
                template: false,
            })
        }
    }

    fn props_name(&mut self) -> NodeIdentifier {
        let prefix = "__rsvelte_public_props";
        let taken = |name: &str| {
            (self.resolution)().is_some_and(|resolution| {
                let scoping = resolution.scoping();
                scoping.symbol_names().any(|n| n == name)
                    || resolution.unresolved_names().any(|n| n == name)
            })
        };
        let mut index = 0;
        while taken(&format!("{prefix}{index}")) {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
    }

    /// Whether `e`, without its TypeScript wrappers, calls the rune `name` in its scope.
    fn is_rune(&self, mut e: &Expression<'_>, name: &str) -> bool {
        while let Expression::TSAsExpression(_)
        | Expression::TSSatisfiesExpression(_)
        | Expression::TSNonNullExpression(_)
        | Expression::TSTypeAssertion(_) = e
        {
            e = e.get_inner_expression();
        }
        rsvelte_svelte_semantic::resolve::rune_call(e).is_some_and(|(rune, _)| rune == name)
            && (self.resolution)()
                .and_then(|resolution| resolution.rune(e))
                .is_some()
    }

    /// Pushes the module script with its store declarations, and returns the instance's.
    fn module_and_store_edits(&mut self) -> Buffer<Edit> {
        let stores = self.store_subscriptions();
        let after = |content: Span| {
            stores.iter().filter_map(move |&(at, store)| match at {
                StoreAt::After(end) if content.start_offset <= end && end <= content.end_offset => {
                    Some((end, store))
                }
                _ => None,
            })
        };
        if let Some(script) = &self.component.module {
            let edits: Vec<Edit> = after(script.content)
                .map(|(end, store)| self.store_edit(end, store))
                .collect();
            self.script_parts(script.content, &edits);
        }
        let mut edits = Buffer::new(0);
        let first = stores.iter().filter(|(at, _)| matches!(at, StoreAt::Start));
        if let Some(script) = &self.component.instance {
            let start = script.content.start_offset;
            for &(_, store) in first {
                edits.push(self.store_edit(start, store));
            }
            for (end, store) in after(script.content) {
                edits.push(self.store_edit(end, store));
            }
        } else {
            for &(_, store) in first {
                self.scratch
                    .push(self.tree.push(Node::StoreSubscription(store)));
            }
        }
        edits
    }

    /// svelte2tsx declares `$x` for each store subscription whose store `x` a variable or an import
    /// binds: after the variable's statement, or first in the instance.
    fn store_subscriptions(&self) -> Vec<(StoreAt, Span)> {
        let Some(resolution) = (self.resolution)() else {
            return Vec::new();
        };
        let scoping = resolution.scoping();
        let programs = [&self.component.module, &self.component.instance];
        let statement_end = |at: oxc_span::Span| {
            programs
                .iter()
                .filter_map(|script| script.as_ref())
                .flat_map(|script| &self.component.javascript.get_program(script.program).body)
                .find(|statement| {
                    let s = statement.span();
                    s.start <= at.start && at.end <= s.end
                })
                .map(|statement| statement.span().end)
        };
        let mut out: Vec<_> = resolution
            .unresolved_names()
            .filter(|name| resolution.is_store_subscription(name))
            .filter_map(|name| scoping.find_binding(resolution.instance_scope(), name[1..].into()))
            .filter_map(|symbol| {
                let store = scoping.symbol_span(symbol);
                let at = match resolution.declaration(symbol) {
                    AstKind::VariableDeclarator(_) => StoreAt::After(statement_end(store)?),
                    AstKind::ImportSpecifier(_)
                    | AstKind::ImportDefaultSpecifier(_)
                    | AstKind::ImportNamespaceSpecifier(_) => StoreAt::Start,
                    _ => return None,
                };
                Some((at, span(store)))
            })
            .collect();
        out.sort_unstable_by_key(|&(_, store)| store.start_offset);
        out
    }

    fn store_edit(&mut self, at: u32, store: Span) -> Edit {
        Edit {
            span: Span::new(at, at),
            replacement: Some(self.tree.push(Node::StoreSubscription(store))),
        }
    }

    fn script_parts(&mut self, span: Span, edits: &[Edit]) {
        if edits.is_empty() {
            self.scratch.push(self.tree.push(Node::Program { span }));
            return;
        }
        let start = self.scratch.len();
        let mut cursor = span.start_offset;
        for edit in edits {
            if cursor < edit.span.start_offset {
                self.scratch.push(self.tree.push(Node::SourceCopy {
                    span: Span::new(cursor, edit.span.start_offset),
                }));
            }
            if let Some(replacement) = edit.replacement {
                self.scratch.push(replacement);
            }
            cursor = edit.span.end_offset;
        }
        if cursor < span.end_offset {
            self.scratch.push(self.tree.push(Node::SourceCopy {
                span: Span::new(cursor, span.end_offset),
            }));
        }
        let parts = self.finish_list(start);
        self.scratch
            .push(self.tree.push(Node::ProgramParts { parts }));
    }
}

/// The bindings of one `$props()` pattern. The props object is inferred from the defaults, so a
/// default that reads a sibling would infer the object from itself (TS7022).
struct Siblings<'e> {
    names: Vec<&'e str>,
    defaults: Vec<(&'e str, Option<&'e Expression<'e>>)>,
}

impl<'e> Siblings<'e> {
    fn new(pattern: &'e BindingPattern<'e>) -> Self {
        let BindingPattern::ObjectPattern(object) = pattern else {
            return Self {
                names: Vec::new(),
                defaults: Vec::new(),
            };
        };
        let defaults = object
            .properties
            .iter()
            .filter_map(|property| match &property.value {
                BindingPattern::BindingIdentifier(name) => Some((name.name.as_str(), None)),
                BindingPattern::AssignmentPattern(assignment) => match &assignment.left {
                    BindingPattern::BindingIdentifier(name) => {
                        Some((name.name.as_str(), Some(&assignment.right)))
                    }
                    _ => None,
                },
                _ => None,
            })
            .collect();
        let names = pattern
            .get_binding_identifiers()
            .iter()
            .map(|name| name.name.as_str())
            .collect();
        Self { names, defaults }
    }

    /// The default to infer from: a sibling's own, as svelte2tsx's `typeof sibling`, or `None` for
    /// an untyped prop, as is one that reads a sibling another way, which svelte2tsx types `any`.
    fn independent(&self, mut default: &'e Expression<'e>) -> Option<&'e Expression<'e>> {
        for _ in 0..=self.defaults.len() {
            if let Expression::Identifier(name) = default.without_parentheses()
                && let Some(&(_, next)) = self.defaults.iter().find(|(n, _)| *n == name.name)
            {
                default = next?;
                continue;
            }
            let mut reads = Reads {
                names: &self.names,
                found: false,
            };
            reads.visit_expression(default);
            return (!reads.found).then_some(default);
        }
        None
    }
}

struct Reads<'n, 'e> {
    names: &'n [&'e str],
    found: bool,
}

impl<'a> Visit<'a> for Reads<'_, '_> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        self.found |= self.names.contains(&it.name.as_str());
    }
}
