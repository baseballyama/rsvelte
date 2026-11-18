//! svelte2tsx's generic component: the instance and the template in a function of the
//! `generics` type parameters, and a default export whose call signature takes them.

use oxc_ast::ast::{
    Declaration, ExportDeclaration, Program, Statement, TSInterfaceDeclaration, TSType,
    TSTypeAliasDeclaration, TSTypeName,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::Script;

use super::contract::Edit;
use super::hoistable::{Hoisted, hoisted};
use super::{Buffer, Builder, Node, NodeIdentifier, Range, Refusal, Result, Span, refuse, span};
use crate::syntax_tree::TypeParameters;

/// A generic component's type parameters and where its render function starts in the scratch.
#[derive(Clone, Copy)]
pub(super) struct Generics {
    pub(super) start: usize,
    /// None for a component without generics.
    type_parameters: Option<TypeParameters>,
    pub(super) asynchronous: bool,
    names: Range,
    /// Each parameter without its modifiers, which an interface or a type alias rejects.
    declared: Range,
    /// Whether the default export takes the type parameters: not when they do not parse.
    exported: bool,
    name: Option<Span>,
}

impl Generics {
    /// A component's render function without type parameters.
    pub(super) const NONE: Self = Self {
        start: 0,
        type_parameters: None,
        asynchronous: false,
        names: Range { start: 0, len: 0 },
        declared: Range { start: 0, len: 0 },
        exported: false,
        name: None,
    };

    pub(super) const fn is_generic(&self) -> bool {
        self.type_parameters.is_some()
    }
}

impl Builder<'_> {
    /// The instance's generics, after its imports, which svelte2tsx keeps outside the render
    /// function: the `generics` attribute's or, without it, the `$$Generic` aliases'.
    pub(super) fn generics(
        &mut self,
        script: &Script,
        program: &Program<'_>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Generics> {
        let aliases = DollarGenerics::of(program);
        // svelte2tsx reads `generics` only in a TypeScript script.
        let attribute = script
            .attributes
            .iter()
            .filter(|_| !self.tree.javascript)
            .find(|(name, _)| name.text(self.source) == "generics");
        let mut exported = true;
        // From after the `<` of the start tag to the value's opening quote.
        let name = attribute
            .and_then(|&(_, value)| value)
            .map(|value| Span::new(script.span.start_offset + 1, value.start_offset - 1));
        let (type_parameters, names, declared) = match attribute {
            // svelte2tsx copies a list that does not parse, so TypeScript reports its errors.
            Some(&(_, Some(value))) if aliases.found.is_empty() && script.generics.is_none() => {
                exported = false;
                let none = Range::default();
                (TypeParameters::Attribute(value), none, none)
            }
            Some(&(attribute, _)) if aliases.found.is_empty() => {
                self.attribute_generics(script, attribute)?
            }
            Some(_) => {
                return Err(thrown(
                    "Invalid $$Generic declaration: $$Generic definitions are not allowed when \
                     the generics attribute is present on the script tag",
                ));
            }
            None if aliases.found.is_empty() => {
                self.hoist(program, &aliases, false, edits)?;
                return Ok(Generics::NONE);
            }
            None => self.alias_generics(&aliases, edits)?,
        };
        self.hoist(program, &aliases, true, edits)?;
        Ok(Generics {
            start: 0,
            type_parameters: Some(type_parameters),
            asynchronous: false,
            names,
            declared,
            exported,
            name,
        })
    }

    /// The `generics` attribute's parameters, their names and the parameters without modifiers.
    fn attribute_generics(
        &mut self,
        script: &Script,
        attribute: Span,
    ) -> Result<(TypeParameters, Range, Range)> {
        let unsupported = || refuse("generic component contracts", attribute);
        let declaration = script
            .generics
            .map(|generics| self.component.javascript.get_type_parameters(generics))
            .ok_or_else(unsupported)?;
        let (Some(first), Some(last)) = (declaration.params.first(), declaration.params.last())
        else {
            return Err(unsupported());
        };
        let start = self.scratch.len();
        for parameter in &declaration.params {
            let name = span(parameter.name.span);
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(name)));
        }
        let names = self.finish_list(start);
        for parameter in &declaration.params {
            let declared = Span::new(parameter.name.span.start, parameter.span.end);
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(declared)));
        }
        let declared = self.finish_list(start);
        let type_parameters = TypeParameters::Attribute(Span::new(first.span.start, last.span.end));
        Ok((type_parameters, names, declared))
    }

    /// The `$$Generic` aliases as type parameters, which svelte2tsx removes from the script.
    fn alias_generics(
        &mut self,
        aliases: &DollarGenerics,
        edits: &mut Buffer<Edit>,
    ) -> Result<(TypeParameters, Range, Range)> {
        let start = self.scratch.len();
        for alias in &aliases.found {
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(alias.name)));
        }
        let names = self.finish_list(start);
        for alias in &aliases.found {
            let constraint = match alias.arguments[..] {
                [] => None,
                [constraint] => Some(constraint),
                _ => {
                    return Err(thrown(
                        "Invalid $$Generic declaration: Only one type argument allowed",
                    ));
                }
            };
            self.scratch.push(self.tree.push(Node::TypeParameter {
                name: alias.name,
                constraint,
            }));
            edits.push(Edit {
                span: alias.span,
                replacement: None,
            });
        }
        let declared = self.finish_list(start);
        Ok((TypeParameters::Declared(declared), names, declared))
    }

    /// Moves the imports before the render function, then for a generic component each type a
    /// constraint names, which it would otherwise read before declaring it, and for another
    /// svelte2tsx's hoistable types.
    fn hoist(
        &mut self,
        program: &Program<'_>,
        aliases: &DollarGenerics,
        generic: bool,
        edits: &mut Buffer<Edit>,
    ) -> Result<()> {
        let start = self.scratch.len();
        let mut moved = |builder: &mut Self, at: Span| {
            let copy = builder.tree.push(Node::SourceCopy { span: at });
            builder
                .scratch
                .push(builder.tree.push(Node::Statement(copy)));
            edits.push(Edit {
                span: at,
                replacement: None,
            });
        };
        // The comments are in source order, so each statement takes those before it once.
        let mut comments = program.comments.iter().peekable();
        for statement in &program.body {
            let start = statement.span().start;
            let import = matches!(statement, Statement::ImportDeclaration(_));
            // svelte2tsx moves an import's leading comments with it. TypeScript 6 reads a JSDoc
            // `@import` in a function, as TypeScript 7 does only at the top level.
            while let Some(comment) = comments.next_if(|comment| comment.span.start < start) {
                if comment.span.end <= start
                    && (import || span(comment.span).text(self.source).contains("@import"))
                {
                    moved(self, span(comment.span));
                }
            }
            // A comment inside the statement belongs to it.
            while comments
                .next_if(|comment| comment.span.start < statement.span().end)
                .is_some()
            {}
            // svelte2tsx moves an import inside a namespace too.
            let mut imports = Vec::new();
            super::namespace::nested_imports(statement, &mut imports);
            for import in imports {
                moved(self, import);
            }
            match statement {
                Statement::ImportDeclaration(import) => moved(self, span(import.span)),
                // A type export would leave the render function; svelte2tsx moves it out.
                Statement::ExportDeclaration(export)
                    if generic
                        && matches!(
                            export.declaration,
                            Declaration::TSTypeAliasDeclaration(_)
                                | Declaration::TSInterfaceDeclaration(_)
                        )
                        && !aliases
                            .found
                            .iter()
                            .any(|alias| alias.span == span(export.span)) =>
                {
                    return Err(refuse("generic component contracts", span(export.span)));
                }
                _ => {}
            }
        }
        let constrained = aliases
            .found
            .iter()
            .any(|alias| !alias.arguments.is_empty());
        let named = if constrained {
            DollarGenerics::named_in(program).named
        } else {
            Vec::new()
        };
        for &(declaration, name) in &named {
            let name = name.text(self.source);
            let constrains = aliases
                .found
                .iter()
                .filter_map(|alias| alias.arguments.first())
                .any(|constraint| constraint.text(self.source) == name);
            if constrains && !aliases.found.iter().any(|alias| alias.span == declaration) {
                moved(self, declaration);
            }
        }
        if !generic {
            for hoisted in self.hoistable(program) {
                match hoisted {
                    Hoisted::Statement(at) => moved(self, at),
                    Hoisted::ComponentProps(annotation) => {
                        let name = self.tree.push(Node::Identifier("$$ComponentProps"));
                        let value = self.tree.push(Node::SourceCopy { span: annotation });
                        let alias = self.tree.push(Node::TypeAlias { name, value });
                        self.scratch.push(alias);
                        self.props_hoisted = true;
                    }
                }
            }
        }
        if let Some(snippets) = self.module_snippets.take() {
            self.scratch.push(snippets);
        }
        if self.scratch.len() > start {
            let parts = self.finish_list(start);
            self.scratch
                .push(self.tree.push(Node::ProgramParts { parts }));
        }
        Ok(())
    }

    /// svelte2tsx's hoistable types of a component whose instance is `program`.
    fn hoistable(&self, program: &Program<'_>) -> Vec<Hoisted> {
        let module = self
            .component
            .module
            .as_ref()
            .map(|script| self.component.javascript.get_program(script.program));
        let props = program.body.iter().find_map(|statement| {
            let Statement::VariableDeclaration(declaration) = statement else {
                return None;
            };
            declaration.declarations.iter().find_map(|declarator| {
                let initializer = declarator.init.as_ref()?;
                self.is_rune(initializer, "$props")
                    .then_some(declarator.type_annotation.as_ref())?
                    .map(|annotation| &annotation.type_annotation)
            })
        });
        // svelte2tsx hoists nothing without an annotated `$props()`.
        let Some(props) = props else {
            return Vec::new();
        };
        let stores: Vec<&str> = (self.resolution)()
            .map(|resolution| {
                resolution
                    .unresolved_names()
                    .filter(|name| resolution.is_store_subscription(name))
                    .map(|name| &name[1..])
                    .collect()
            })
            .unwrap_or_default();
        hoisted(module, program, props, &stores)
    }

    /// svelte2tsx rejects the first `$$Generic` alias, or `$$Events`, `$$Slots` or `$$Props`
    /// declaration, in the module script.
    pub(super) fn module_declarations(&self) -> Result<()> {
        let Some(script) = &self.component.module else {
            return Ok(());
        };
        let program = self.component.javascript.get_program(script.program);
        instance_only(program, 0).map_or(Ok(()), Err)
    }

    /// Wraps the instance and the template, from `generics.start`, in the render function that
    /// returns `contract`, and exports the component.
    pub(super) fn render(&mut self, contract: NodeIdentifier, generics: Generics) {
        self.scratch.push(self.tree.push(Node::Return(contract)));
        let body = self.finish_list(generics.start);
        self.scratch.push(self.tree.push(Node::Render {
            type_parameters: generics.type_parameters,
            asynchronous: generics.asynchronous,
            body,
            name: generics.name,
        }));
        let export = if let Some(type_parameters) = generics.type_parameters
            && generics.exported
        {
            Node::GenericExport {
                type_parameters,
                names: generics.names,
                declared: generics.declared,
            }
        } else {
            let callee = self.tree.push(Node::Identifier("$$render"));
            let component = self.tree.push(Node::Call {
                callee,
                arguments: Range::default(),
            });
            // svelte2tsx awaits an async render function at the top level.
            let component = if generics.asynchronous {
                self.tree.push(Node::Await(component))
            } else {
                component
            };
            Node::ExportDefault(component)
        };
        self.scratch.push(self.tree.push(export));
    }
}

/// What svelte2tsx does to a script that Svelte does not parse, which it still reads as
/// TypeScript.
#[derive(Debug, Default)]
pub struct UnparsedScript {
    /// The error it throws for a module script that declares `$$Generic`, `$$Events`, `$$Slots` or
    /// `$$Props`.
    pub refusal: Option<Refusal>,
    /// The instance script's imports, which move before the render function.
    pub imports: Vec<Span>,
    /// The export lists and `export` keywords it removes from the instance script.
    pub removed: Vec<Span>,
}

/// [`UnparsedScript`] for the script at `content` in `source_text`.
#[must_use]
pub fn unparsed_script(source_text: &str, content: Span, module: bool) -> UnparsedScript {
    let text = &source_text[content.start_offset as usize..content.end_offset as usize];
    rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        let program = oxc_parser::Parser::new(allocator, text, oxc_span::SourceType::ts())
            .parse()
            .program;
        read_unparsed(&program, content.start_offset, module)
    })
}

/// [`unparsed_script`] of the parsed `program`, whose spans are `offset` bytes into the component.
fn read_unparsed(program: &Program<'_>, offset: u32, module: bool) -> UnparsedScript {
    let shift = |at: Span| Span::new(at.start_offset + offset, at.end_offset + offset);
    if module {
        return UnparsedScript {
            refusal: instance_only(program, offset),
            ..UnparsedScript::default()
        };
    }
    let mut moved = Moved::default();
    moved.visit_program(program);
    UnparsedScript {
        imports: moved.imports.into_iter().map(shift).collect(),
        removed: moved.removed.into_iter().map(shift).collect(),
        ..UnparsedScript::default()
    }
}

/// The imports svelte2tsx moves and the exports it removes in a script Svelte does not parse,
/// where they may stand at any depth.
#[derive(Default)]
struct Moved {
    imports: Vec<Span>,
    removed: Vec<Span>,
}

impl<'a> Visit<'a> for Moved {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if let Statement::ImportDeclaration(import) = it {
            self.imports.push(span(import.span));
        }
        self.removed.extend(super::namespace::removed_export(it));
        walk::walk_statement(self, it);
    }
}

/// The error for the first declaration in `program` that only the instance script may make, with
/// `program`'s spans `offset` bytes into the component.
fn instance_only(program: &Program<'_>, offset: u32) -> Option<Refusal> {
    DollarGenerics::of(program)
        .instance_only
        .map(|(span, message)| Refusal::Thrown {
            message,
            span: Span::new(span.start_offset + offset, span.end_offset + offset),
        })
}

/// An error svelte2tsx throws without a position, which svelte-check reports at the start.
const fn thrown(message: &'static str) -> Refusal {
    Refusal::Thrown {
        message,
        span: Span::new(0, 0),
    }
}

/// A `type T = $$Generic<C>` anywhere in a script, as svelte2tsx finds it.
struct DollarGeneric {
    /// The declaration with its `export`, which svelte2tsx removes.
    span: Span,
    name: Span,
    arguments: Vec<Span>,
}

#[derive(Default)]
struct DollarGenerics {
    found: Vec<DollarGeneric>,
    /// Every interface and type alias, with its name, which a constraint may name; collected
    /// only when one does.
    named: Vec<(Span, Span)>,
    collect_named: bool,
    /// The `export` around the declaration being visited.
    export: Option<Span>,
    /// The first declaration that svelte2tsx allows only in the instance script, with its error.
    instance_only: Option<(Span, &'static str)>,
}

impl DollarGenerics {
    fn of(program: &Program<'_>) -> Self {
        let mut found = Self::default();
        found.visit_program(program);
        found
    }

    fn named_in(program: &Program<'_>) -> Self {
        let mut found = Self {
            collect_named: true,
            ..Self::default()
        };
        found.visit_program(program);
        found
    }

    fn name(&mut self, declared: Span, name: oxc_span::Span) {
        if self.collect_named {
            self.named.push((declared, span(name)));
        }
    }

    /// Records `declared` when it is the first `$$Events`, `$$Slots` or `$$Props` declaration.
    fn convention(&mut self, declared: Span, name: &str) {
        let message = match name {
            "$$Events" => "$$Events can only be declared in the instance script",
            "$$Slots" => "$$Slots can only be declared in the instance script",
            "$$Props" => "$$Props can only be declared in the instance script",
            _ => return,
        };
        self.instance_only.get_or_insert((declared, message));
    }

    /// The declaration's span with its `export`, which svelte2tsx's node starts at.
    fn declared(&self, declaration: oxc_span::Span) -> Span {
        self.export.unwrap_or_else(|| span(declaration))
    }
}

impl<'a> Visit<'a> for DollarGenerics {
    fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
        let outer = self.export;
        if matches!(
            it.declaration,
            Declaration::TSTypeAliasDeclaration(_) | Declaration::TSInterfaceDeclaration(_)
        ) {
            self.export = Some(span(it.span));
        }
        walk::walk_export_declaration(self, it);
        self.export = outer;
    }

    fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
        let declared = self.declared(it.span);
        self.export = None;
        self.name(declared, it.id.span);
        if let TSType::TSTypeReference(reference) = &it.type_annotation
            && let TSTypeName::IdentifierReference(name) = &reference.type_name
            && name.name == "$$Generic"
        {
            self.instance_only.get_or_insert((
                declared,
                "$$Generic declarations are only allowed in the instance script",
            ));
            self.found.push(DollarGeneric {
                span: declared,
                name: span(it.id.span),
                arguments: reference
                    .type_arguments
                    .iter()
                    .flat_map(|arguments| &arguments.params)
                    .map(|argument| span(argument.span()))
                    .collect(),
            });
        } else {
            self.convention(declared, &it.id.name);
        }
        walk::walk_ts_type_alias_declaration(self, it);
    }

    fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
        let declared = self.declared(it.span);
        self.export = None;
        self.name(declared, it.id.span);
        self.convention(declared, &it.id.name);
        walk::walk_ts_interface_declaration(self, it);
    }
}
