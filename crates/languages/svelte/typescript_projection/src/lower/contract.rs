use mode::ComponentMode;
use oxc_ast::ast::{
    BindingPattern, Declaration, ExportDefaultDeclarationKind, Expression, PropertyKey, Statement,
    VariableDeclaration, VariableDeclarationKind,
};
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::Script;
use rsvelte_typescript_semantic::property_key::literal_key_name;
use rsvelte_typescript_tree::{document_span, node_span};

use super::nested::Nested;
use super::render::Generics;
use super::{Buffer, Builder, Node, NodeIdentifier, Range, Result, Span, refuse};

pub(super) struct Edit {
    pub(super) span: Span,
    pub(super) replacement: Option<NodeIdentifier>,
}

impl Edit {
    /// Removes the text at `span`.
    pub(super) const fn removal(span: Span) -> Self {
        Self {
            span,
            replacement: None,
        }
    }
}

/// A name the instance exports, and the type of its value.
#[derive(Clone, Copy)]
struct Export {
    name: NodeIdentifier,
    value: NodeIdentifier,
}

/// What the render function returns but its slots, which the template's `<slot>` elements type.
#[derive(Clone, Copy)]
pub(super) struct Contract {
    props: NodeIdentifier,
    exports: NodeIdentifier,
    bindings: NodeIdentifier,
    mode: ComponentMode,
    events: Events,
    generic: bool,
}

impl Builder<'_> {
    /// The scripts, then the contract and the render function's generics.
    pub(super) fn scripts(&mut self) -> Result<(Contract, Generics)> {
        self.module_declarations()?;
        let (mut edits, render_start) = self.module_and_store_edits();
        let mut bindings = Buffer::new(0);
        let mut exports = Buffer::new(0);
        let mut props = None;
        let mut generics = Generics::NONE;
        let mut generated_start = render_start;
        let mut events = None;
        if let Some(script) = &self.component.instance {
            let program = self.component.javascript.get_program(script.program);
            generics = self.generics(script, program, &mut edits)?;
            events = Some(self.events(Some(program), &mut edits)?);
            generics.asynchronous = super::awaits::awaits_at_top_level(program);
            generated_start = self.scratch.len();
            if let Some(snippets) = self.root_snippets.take() {
                let after_imports = program
                    .body
                    .iter()
                    .take_while(|s| matches!(s, Statement::ImportDeclaration(_)))
                    .last()
                    .map_or(script.content.start_offset, |s| s.span().end);
                edits.push(Edit {
                    span: Span::new(after_imports, after_imports),
                    replacement: Some(snippets),
                });
            }
            if let Some(flags) = self.slot_flags(script.content.start_offset) {
                edits.push(flags);
            }
            for statement in &program.body {
                for at in Nested::inside(statement).removed {
                    edits.push(Edit::removal(at));
                }
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
                            return Err(refuse(
                                "multiple props declarations",
                                node_span(&declarator.id),
                            ));
                        }
                        let typed = self.props_type(program, declaration, declarator);
                        let declarator_at =
                            props_type::before_comments(&program.comments, declarator.span.start);
                        props = Some(self.props(
                            (&declarator.id, declarator_at),
                            typed,
                            document_span(declaration.span),
                            &mut bindings,
                            &mut edits,
                        )?);
                    }
                }
            }
            edits.sort_by_key(|edit| edit.span.start_offset);
            self.script_parts(script, &edits);
            self.scratch[generated_start..].rotate_right(1);
        }
        let events = match events {
            Some(events) => events,
            None => self.events(None, &mut edits)?,
        };
        let mode = self.component_mode(props.is_some(), generics.asynchronous);
        let props = props.unwrap_or_else(|| self.props_without_rune(&exports, mode));
        let exports = self.export_type(&exports, false);
        let bindings = match mode {
            // Outside runes mode svelte2tsx's `bindings: ""` widens to `string`, so any prop
            // binds.
            ComponentMode::Legacy => self.tree.push(Node::Identifier("string")),
            ComponentMode::Runes if bindings.is_empty() => self.tree.push(Node::StringLiteral("")),
            ComponentMode::Runes => {
                let parts = self.tree.list(&bindings);
                self.tree.push(Node::TypeUnion(parts))
            }
        };
        generics.start = generated_start;
        let contract = Contract {
            props,
            exports,
            bindings,
            mode,
            events,
            generic: generics.is_generic(),
        };
        Ok((contract, generics))
    }

    /// `{ name: value; … }` of `exports`, each property optional when `optional`.
    fn export_type(&mut self, exports: &[Export], optional: bool) -> NodeIdentifier {
        let properties: Vec<NodeIdentifier> = exports
            .iter()
            .map(|&Export { name, value }| {
                self.tree.push(Node::TypeProperty {
                    name,
                    value,
                    optional,
                })
            })
            .collect();
        let properties = self.tree.list(&properties);
        self.tree.push(Node::TypeLiteral(properties))
    }

    /// The variable declaration `statement` is or exports, after recording what it exports.
    fn instance_export<'s>(
        &mut self,
        statement: &'s Statement<'s>,
        exports: &mut Buffer<Export>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Option<&'s VariableDeclaration<'s>>> {
        let export = match statement {
            Statement::VariableDeclaration(declaration) => return Ok(Some(&**declaration)),
            Statement::ExportDeclaration(export) => export,
            // svelte2tsx's `handleExportFunctionOrClass` removes the `export` of a default function
            // or class, which TypeScript then refuses at `default`, and exports it by its name;
            // it leaves an interface or an expression as written.
            Statement::ExportDefaultDeclaration(export) => {
                let name = match &export.declaration {
                    ExportDefaultDeclarationKind::FunctionDeclaration(function) => &function.id,
                    ExportDefaultDeclarationKind::ClassDeclaration(class) => &class.id,
                    // An interface or one of the expressions.
                    _ => return Ok(None),
                };
                if let Some(name) = name {
                    self.export_property(name.span, exports);
                }
                edits.push(Edit::removal(Span::new(
                    export.span.start,
                    export.span.start + "export".len() as u32,
                )));
                return Ok(None);
            }
            // svelte2tsx's `handleExportDeclaration`: `export { a, b as c }` exports `a` and `c`.
            Statement::ExportNamedDeclaration(named) if named.export_kind.is_value() => {
                for specifier in &named.specifiers {
                    if specifier.export_kind.is_type() {
                        continue;
                    }
                    let local = self.source(specifier.local.span(), None);
                    let name = self.source(specifier.exported.span(), None);
                    let value = self.tree.push(Node::TypeQuery(local));
                    exports.push(Export { name, value });
                }
                edits.push(Edit {
                    span: document_span(named.span),
                    replacement: None,
                });
                return Ok(None);
            }
            // svelte2tsx removes every other export list, a type-only or a re-exporting one too.
            Statement::ExportNamedDeclaration(named) => {
                edits.push(Edit {
                    span: document_span(named.span),
                    replacement: None,
                });
                return Ok(None);
            }
            Statement::ExportFromDeclaration(from) => {
                edits.push(Edit {
                    span: document_span(from.span),
                    replacement: None,
                });
                return Ok(None);
            }
            _ => return Ok(None),
        };
        let declaration = match &export.declaration {
            Declaration::FunctionDeclaration(function) if function.id.is_some() => {
                let name = function.id.as_ref().expect("checked above");
                self.export_property(name.span, exports);
                None
            }
            Declaration::ClassDeclaration(class) if class.id.is_some() => {
                let name = class.id.as_ref().expect("checked above");
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
            // svelte2tsx keeps `export` on these, which TypeScript refuses in the render function.
            Declaration::TSTypeAliasDeclaration(_)
            | Declaration::TSInterfaceDeclaration(_)
            | Declaration::TSEnumDeclaration(_)
            | Declaration::TSGlobalDeclaration(_)
            | Declaration::TSExternalModuleDeclaration(_)
            | Declaration::TSNamespaceDeclaration(_) => return Ok(None),
            _ => {
                return Err(refuse(
                    "instance export contracts",
                    document_span(export.span),
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
        exports: &mut Buffer<Export>,
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

    fn export_property(&mut self, name: oxc_span::Span, exports: &mut Buffer<Export>) {
        let name = self.source(name, None);
        let value = self.tree.push(Node::TypeQuery(name));
        exports.push(Export { name, value });
    }

    /// The props of `$props()` assigned to `pattern`, whose declarator svelte2tsx types at `at`
    /// in JavaScript.
    fn props(
        &mut self,
        (pattern, at): (&BindingPattern<'_>, u32),
        typed: Option<PropsType>,
        declaration: Span,
        bindings: &mut Buffer<NodeIdentifier>,
        edits: &mut Buffer<Edit>,
    ) -> Result<NodeIdentifier> {
        let statement = declaration.start_offset;
        let BindingPattern::ObjectPattern(object) = pattern else {
            if let Some(typed) = typed {
                return Ok(self.typed_props(typed, statement, edits));
            }
            // svelte2tsx names an undeclared `$$ComponentProps` here, which TypeScript reads as
            // `any`.
            return Ok(self.tree.push(Node::Identifier("any")));
        };
        // svelte2tsx types a route file's untyped props by their names alone.
        let route = self
            .route
            .filter(|_| typed.is_none() && !self.tree.javascript);
        let mut required = Buffer::new(0);
        let mut optional = Buffer::new(0);
        let rest = object.rest.is_some();
        let siblings = Siblings::new(pattern);
        let mut reads = Buffer::new(0);
        for property in &object.properties {
            if property.key.is_computed() {
                return Err(refuse(
                    "computed props contracts",
                    document_span(property.span),
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
                if let BindingPattern::AssignmentPattern(assignment) = &property.value
                    && let BindingPattern::BindingIdentifier(local) = &assignment.left
                {
                    let local = self
                        .tree
                        .push(Node::UnmappedSource(document_span(local.span)));
                    reads.push(self.tree.push(Node::Statement(local)));
                }
            }
            if typed.is_none() && route.is_none() {
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
        if !reads.is_empty() {
            // svelte2tsx reads each bindable prop, which the parent may read, so it is never
            // unused.
            let reads = self.tree.list(&reads);
            edits.push(Edit {
                span: Span::new(declaration.end_offset, declaration.end_offset),
                replacement: Some(self.tree.push(Node::Statements(reads))),
            });
        }
        if let Some(typed) = typed {
            return Ok(self.typed_props(typed, statement, edits));
        }
        if let Some(route) = route {
            return Ok(self.route_props(route, object, (statement, pattern.span().end), edits));
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
        // JavaScript types a declarator in a JSDoc comment before it, which a comment of its own
        // there overrides.
        let (at, replacement) = if self.tree.javascript {
            (at, Node::DeclaredType(value))
        } else {
            (pattern.span().end, Node::TypeAnnotation(value))
        };
        let replacement = self.tree.push(replacement);
        edits.push(Edit {
            span: Span::new(at, at),
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
            let Some(fallback) = call.arguments.first().and_then(|a| a.as_expression()) else {
                return self.untyped_prop();
            };
            default = fallback;
        }
        // svelte2tsx's types for a default, which it reads from the syntax alone.
        let helper = match default {
            Expression::StringLiteral(_)
            | Expression::NumericLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::TSAsExpression(_) => None,
            Expression::Identifier(identifier) if identifier.name != "undefined" => None,
            Expression::ArrowFunctionExpression(_) => Some("__rsvelte_function_prop"),
            Expression::ObjectExpression(_) => Some("__rsvelte_record_prop"),
            Expression::ArrayExpression(_) => Some("__rsvelte_array_prop"),
            _ => Some("__rsvelte_untyped_prop"),
        };
        match (helper, siblings.independent(default)) {
            (None, Some(default)) => self.source(default.span(), None),
            (None, None) => self.untyped_prop(),
            (Some(helper), _) => {
                let callee = self.tree.push(Node::Identifier(helper));
                self.tree.push(Node::Call {
                    callee,
                    arguments: Range::default(),
                })
            }
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
        match key {
            PropertyKey::StaticStringLiteral(string) | PropertyKey::StringLiteral(string) => {
                self.source(string.span, None)
            }
            PropertyKey::StaticIdentifier(_) => {
                let text = self.tree.push(Node::Text(node_span(key)));
                let parts = self.tree.list(&[text]);
                self.tree.push(Node::String {
                    parts,
                    template: false,
                })
            }
            // The compiler names the prop `String(key.value)`, not as the key is written.
            _ => match literal_key_name(key) {
                Some(name) => self.tree.computed_string_literal(&name),
                None => unreachable!("a computed props key is refused before its binding"),
            },
        }
    }

    fn props_name(&mut self) -> NodeIdentifier {
        self.unused_name("__rsvelte_public_props")
    }

    /// Whether `e`, without its TypeScript wrappers, calls the rune `name` in its scope.
    pub(super) fn is_rune(&self, mut e: &Expression<'_>, name: &str) -> bool {
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

    fn script_parts(&mut self, script: &Script, edits: &[Edit]) {
        let span = script.content;
        let end_tag = crate::cut_short_at(script);
        if edits.is_empty() {
            self.scratch
                .push(self.tree.push(Node::Program { span, end_tag }));
            return;
        }
        let holes = edits.iter().map(|edit| (edit.span, edit.replacement));
        let parts = self.spliced(span, holes);
        self.scratch
            .push(self.tree.push(Node::ProgramParts { parts, end_tag }));
    }
}

mod component;
mod events;
pub(super) use events::Events;
mod mode;
mod props_alias;
pub(super) use props_alias::PropsAnnotation;
mod props_type;
use props_type::PropsType;
mod route;
pub(super) use route::Route;
mod siblings;
mod slot_def;
pub(super) use slot_def::SlotElement;
mod slot_flags;
mod stores;
use siblings::Siblings;
pub use stores::store_reads;
