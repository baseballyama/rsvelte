mod attribute;
mod attributes;
mod awaits;
mod binding;
mod call;
mod children;
mod contract;
mod directive;
mod element;
mod generic;
mod namespace;
pub use contract::store_reads;
pub use generic::{UnparsedScript, unparsed_script};
mod hoistable;
mod root_snippets;
mod script_kind;
pub use script_kind::checked_as_typescript;
mod tag;
mod type_assertion;

use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode, TokenType};
use rsvelte_typescript_tree::ExpressionIdentifier;

use crate::buffers::Buffer;
use crate::syntax_tree::{Node, NodeIdentifier, SourceExpression, SyntaxTree};

type Result<T> = std::result::Result<T, Refusal>;

/// Why a component has no projection.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Refusal {
    /// A construct the projection does not cover yet.
    Unsupported(Unsupported),
    /// An error svelte2tsx throws, which svelte-check reports as it is.
    Thrown { message: &'static str, span: Span },
}

impl Refusal {
    /// What the projection does not cover, or the error svelte2tsx throws.
    #[must_use]
    pub const fn what(&self) -> &'static str {
        match self {
            Self::Unsupported(unsupported) => unsupported.what,
            Self::Thrown { message, .. } => message,
        }
    }

    /// The construct, or where svelte-check reports the thrown error.
    #[must_use]
    pub fn span(&self) -> Span {
        match self {
            Self::Unsupported(unsupported) => unsupported.span(),
            Self::Thrown { span, .. } => *span,
        }
    }
}

fn refuse(
    what: &'static str,
    at: impl Into<rsvelte_kernel::source::positions::SourceLocation>,
) -> Refusal {
    Refusal::Unsupported(Unsupported::at(what, at))
}

/// The component's analysis, which `lower` asks for only when a call may be a rune.
pub type Resolve<'a> = dyn Fn() -> Option<&'a Resolution> + 'a;

/// # Errors
///
/// Returns the source range of a construct whose type semantics are not supported yet.
pub fn lower<'a>(
    component: &'a Component,
    source: &'a str,
    resolution: &'a Resolve<'a>,
) -> Result<SyntaxTree> {
    let mut builder = Builder {
        component,
        resolution,
        source,
        scratch: Buffer::new(2),
        tree: SyntaxTree::default(),
        element_callee: None,
        attachment_key: None,
        component_name: None,
        directives: directive::Directives::default(),
        root_snippets: None,
        slot_parent: None,
        props_hoisted: false,
        module_snippets: None,
    };
    builder.tree.javascript = !checked_as_typescript(component, source);
    // svelte2tsx moves the root's snippets after the instance script's imports, or leaves them in
    // place without an instance script.
    let instance = component.instance.is_some();
    if instance {
        builder.root_snippets = builder.root_snippets()?;
    }
    let (contract, generics) = builder.scripts()?;
    let start = builder.scratch.len();
    if instance {
        builder.append_matching(component.root, false)?;
    } else {
        for &identifier in component.children(component.root) {
            if let Some(node) = builder.node(identifier)? {
                builder.scratch.push(node);
            }
        }
    }
    let body = builder.finish_list(start);
    if !builder.tree.children(body).is_empty() {
        let value = builder.tree.push(Node::Template(body));
        builder
            .scratch
            .push(builder.tree.push(Node::Statement(value)));
    }
    builder.render(contract, generics);
    builder.tree.root = builder.finish_list(0);
    Ok(builder.tree)
}

/// [`lower`] outside the artifact database: it analyzes the component itself, when it must.
///
/// # Errors
///
/// As [`lower`].
pub fn lower_alone(component: &Component, source: &str) -> Result<SyntaxTree> {
    let resolution = std::cell::OnceCell::new();
    let resolve = || {
        Some(resolution.get_or_init(|| {
            let lowered = rsvelte_svelte_semantic::compiler_syntax_tree::lower(component, source);
            rsvelte_svelte_semantic::resolve::resolve(
                &component.javascript,
                component.instance.as_ref().map(|s| s.program),
                component.module.as_ref().map(|s| s.program),
                &lowered,
            )
        }))
    };
    lower(component, source, &resolve)
}

struct Builder<'a> {
    component: &'a Component,
    resolution: &'a Resolve<'a>,
    source: &'a str,
    scratch: Buffer<NodeIdentifier>,
    tree: SyntaxTree,
    element_callee: Option<NodeIdentifier>,
    attachment_key: Option<NodeIdentifier>,
    component_name: Option<NodeIdentifier>,
    /// Reused for each element, as elements' directives are done before their children.
    directives: directive::Directives,
    /// The root's snippets, which the instance script holds after its imports.
    root_snippets: Option<NodeIdentifier>,
    /// The component whose children are being lowered, whose named slots their `let:` read.
    slot_parent: Option<NodeIdentifier>,
    /// Whether `$$ComponentProps` moved before the render function.
    props_hoisted: bool,
    /// The root snippets svelte2tsx moves before the render function.
    module_snippets: Option<NodeIdentifier>,
}

/// The source text at `at`, whose mapping ends at `end` when that is not its own end.
fn source_expression(at: oxc_span::Span, end: Option<u32>) -> SourceExpression {
    let span = span(at);
    SourceExpression {
        span,
        end: end.unwrap_or(span.end_offset),
    }
}

/// The document position of an oxc node.
const fn span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

impl Builder<'_> {
    fn expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        self.component.javascript.get_expression(identifier)
    }

    fn source(&mut self, at: oxc_span::Span, end: Option<u32>) -> NodeIdentifier {
        let expression = source_expression(at, end);
        self.tree.push(Node::Source(expression))
    }

    fn expression_source(
        &mut self,
        identifier: ExpressionIdentifier,
        end: Option<u32>,
    ) -> NodeIdentifier {
        let expression = self.expression(identifier);
        let (at, sequence) = (
            expression.span(),
            matches!(expression, Expression::SequenceExpression(_)),
        );
        let source = self.source(at, end);
        // A sequence's span leaves out its parentheses, which a property's value needs.
        if sequence {
            self.tree.push(Node::Parenthesized(source))
        } else {
            source
        }
    }

    /// A property's value. svelte2tsx copies `a, b` without its parentheses, which makes `b` a
    /// shorthand property; other sequences keep them, since the copy would not parse.
    fn property_value(
        &mut self,
        identifier: ExpressionIdentifier,
        end: Option<u32>,
    ) -> NodeIdentifier {
        if let Expression::SequenceExpression(sequence) = self.expression(identifier)
            && sequence.expressions[1..]
                .iter()
                .all(|e| matches!(e, Expression::Identifier(_)))
        {
            let at = sequence.span;
            return self.source(at, end);
        }
        self.expression_source(identifier, end)
    }

    fn finish_list(&mut self, start: usize) -> Range {
        let range = self.tree.list(&self.scratch[start..]);
        self.scratch.truncate(start);
        range
    }

    fn children(&mut self, range: Range) -> Result<Range> {
        let start = self.scratch.len();
        self.append_children(range)?;
        Ok(self.finish_list(start))
    }

    /// The children with their snippets first, as svelte2tsx hoists them.
    fn append_children(&mut self, range: Range) -> Result<()> {
        self.append_matching(range, true)?;
        self.append_matching(range, false)
    }

    /// The children that are snippets, or those that are not.
    fn append_matching(&mut self, range: Range, snippets: bool) -> Result<()> {
        for &identifier in self.component.children(range) {
            let snippet = matches!(
                self.component.node(identifier),
                TemplateNode::Snippet { .. }
            );
            if snippet == snippets
                && let Some(node) = self.node(identifier)?
            {
                self.scratch.push(node);
            }
        }
        Ok(())
    }

    fn node(&mut self, identifier: u32) -> Result<Option<NodeIdentifier>> {
        let node = match *self.component.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => return Ok(None),
            TemplateNode::Expression { expression, span }
            | TemplateNode::Html { expression, span } => {
                let at = self.expression(expression).span();
                Node::Expression(source_expression(at, Some(span.end_offset - 1)))
            }
            TemplateNode::Element {
                name,
                component,
                attributes,
                children,
                start_tag,
                end_tag,
                span,
                ..
            } => {
                // svelte2tsx reads a component's name again where its end tag names it.
                let end_name = (end_tag && component.is_some())
                    .then(|| self.end_tag_name(name, span))
                    .flatten();
                return self
                    .element(name, start_tag, component, attributes, children, end_name)
                    .map(Some);
            }
            TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test = self.expression_source(test, None);
                let consequent = self.children(consequent)?;
                let alternate = alternate.map(|range| self.children(range)).transpose()?;
                Node::If {
                    test,
                    consequent,
                    alternate,
                }
            }
            TemplateNode::Each {
                expression,
                context,
                index,
                key,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                let start = self.scratch.len();
                let expression = self.expression_source(expression, None);
                let callee = self.tree.push(Node::Identifier("__rsvelte_each"));
                let arguments = self.tree.list(&[expression]);
                let iterable = self.tree.push(Node::Call { callee, arguments });
                let javascript = &self.component.javascript;
                let index = index.map(|index| javascript.get_pattern(index).span);
                let index = index.map(|at| self.source(at, None));
                // svelte2tsx drops a context's type annotation, and `for…of` takes none.
                let value = context.map(|context| javascript.get_pattern(context).pattern.span());
                let value = value.map(|at| self.source(at, None));
                let binding = self.tree.push(Node::ArrayPattern { index, value });
                if let Some(key) = key {
                    let value = source_expression(self.expression(key).span(), None);
                    self.scratch.push(self.tree.push(Node::Expression(value)));
                }
                self.append_children(body)?;
                let body = self.finish_list(start);
                let loop_node = self.tree.push(Node::ForOf {
                    binding,
                    iterable,
                    body,
                });
                self.scratch.push(loop_node);
                if has_fallback {
                    let body = self.children(fallback)?;
                    self.scratch.push(self.tree.push(Node::Block { body }));
                }
                let body = self.finish_list(start);
                Node::Block { body }
            }
            TemplateNode::Const { declaration, .. }
            | TemplateNode::Declaration { declaration, .. } => {
                let at = self.component.javascript.get_declaration(declaration).span;
                let declaration = self.source(at, None);
                Node::Statement(declaration)
            }
            TemplateNode::Key { .. }
            | TemplateNode::Render { .. }
            | TemplateNode::Debug { .. }
            | TemplateNode::Snippet { .. }
            | TemplateNode::Await { .. } => self.tag(identifier)?,
        };
        Ok(Some(self.tree.push(node)))
    }

    /// The name in an element's own end tag, which follows its last `</`.
    fn end_tag_name(&self, name: Span, span: Span) -> Option<Span> {
        let open = self
            .component
            .tokens
            .within(span)
            .iter()
            .rev()
            .find(|token| token.kind == TokenType::EndTagOpen)?;
        let start = open.span.end_offset;
        Some(Span::new(start, start + name.len()))
    }

    /// Whether the component binds `name`, a type included.
    fn declares(&self, name: &str) -> bool {
        (self.resolution)()
            .is_some_and(|resolution| resolution.scoping().symbol_names().any(|n| n == name))
    }

    /// A name for generated code that no binding or reference of the component uses.
    fn unused_name(&mut self, prefix: &'static str) -> NodeIdentifier {
        self.unused_name_from(prefix, 0)
    }

    /// [`Self::unused_name`] with an index of at least `from`, so names generated into one
    /// scope differ.
    fn unused_name_from(&mut self, prefix: &'static str, from: u32) -> NodeIdentifier {
        let taken = |name: &str| {
            (self.resolution)().is_some_and(|resolution| {
                let scoping = resolution.scoping();
                scoping.symbol_names().any(|n| n == name)
                    || resolution.unresolved_names().any(|n| n == name)
            })
        };
        let mut index = from;
        while taken(&format!("{prefix}{index}")) {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
    }

    fn element_callee(&mut self) -> NodeIdentifier {
        if let Some(callee) = self.element_callee {
            return callee;
        }
        let object = self.tree.push(Node::Identifier("svelteHTML"));
        let property = self.tree.push(Node::Identifier("createElement"));
        let callee = self.tree.push(Node::Member { object, property });
        self.element_callee = Some(callee);
        callee
    }

    fn attachment_key(&mut self) -> NodeIdentifier {
        if let Some(key) = self.attachment_key {
            return key;
        }
        let callee = self.tree.push(Node::Identifier("Symbol"));
        let value = self.tree.push(Node::StringLiteral("@attach"));
        let arguments = self.tree.list(&[value]);
        let key = self.tree.push(Node::Call { callee, arguments });
        self.attachment_key = Some(key);
        key
    }
}
