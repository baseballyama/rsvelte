mod attributes;
mod awaits;
mod binding;
mod call;
mod children;
mod contract;
mod directive;
mod each;
mod element;
mod names;
mod nested;
pub use contract::store_reads;
mod hoistable;
mod render;
mod root_snippets;
mod slot_scope;
mod tag;
mod type_assertion;
use std::cell::OnceCell;

use oxc_ast::ast::{AssignmentTarget, ChainElement, Expression, IdentifierReference};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode, TokenType};
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span, node_span};

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
    path: &str,
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
        component_instance_name: None,
        directives: directive::Directives::default(),
        root_snippets: None,
        slot_parent: None,
        component_parent: false,
        route: contract::Route::of(path),
        props_hoisted: false,
        module_snippets: None,
        slot_elements: Vec::new(),
        slot_scope: Buffer::new(0),
        names: OnceCell::new(),
    };
    builder.tree.javascript = !component.checked_as_typescript(source);
    builder.tree.holes =
        (component.instance.as_ref()).is_some_and(|script| !script.holes.is_empty());
    // svelte2tsx moves the root's snippets after the instance script's imports. Without one it
    // moves those it may into the module script and leaves the rest in place.
    let instance = component.instance.is_some();
    let moved = if instance {
        builder.root_snippets = builder.root_snippets()?;
        Vec::new()
    } else {
        builder.snippets_moved_to_module()?
    };
    let (contract, generics) = builder.scripts()?;
    let start = builder.scratch.len();
    if instance {
        builder.append_matching(component.root, false)?;
    } else {
        for &identifier in component.children(component.root) {
            if moved.contains(&identifier) {
                continue;
            }
            if let Some(node) = builder.node(identifier)? {
                builder.scratch.push(node);
            }
        }
    }
    let body = builder.finish_list(start);
    // TypeScript reads a cut-short script on into the template's head, even an empty template's.
    let head = component.instance.as_ref().and_then(crate::cut_short_at);
    if !builder.tree.children(body).is_empty() || head.is_some() {
        let value = builder.tree.push(Node::Template { body, head });
        builder
            .scratch
            .push(builder.tree.push(Node::Statement(value)));
    }
    let (component, instance) = builder.component(contract);
    builder.render(component, instance, generics);
    builder.tree.root = builder.finish_list(0);
    Ok(builder.tree)
}

/// [`lower`] outside the artifact database: it analyzes the component itself, when it must.
///
/// # Errors
///
/// As [`lower`].
pub fn lower_alone(component: &Component, source: &str, path: &str) -> Result<SyntaxTree> {
    let resolution = OnceCell::new();
    let resolve = || {
        Some(resolution.get_or_init(|| rsvelte_svelte_semantic::resolve_alone(component, source)))
    };
    lower(component, source, path, &resolve)
}

struct Builder<'a> {
    component: &'a Component,
    resolution: &'a Resolve<'a>,
    source: &'a str,
    scratch: Buffer<NodeIdentifier>,
    tree: SyntaxTree,
    element_callee: Option<NodeIdentifier>,
    attachment_key: Option<NodeIdentifier>,
    component_instance_name: Option<NodeIdentifier>,
    /// Reused for each element, as elements' directives are done before their children.
    directives: directive::Directives,
    /// The root's snippets, which the instance script holds after its imports.
    root_snippets: Option<NodeIdentifier>,
    /// The component whose children are being lowered, whose named slots their `let:` read.
    slot_parent: Option<NodeIdentifier>,
    /// Whether the children being lowered are a component's, through any blocks.
    component_parent: bool,
    /// The `SvelteKit` route file the component is, whose untyped props svelte2tsx types.
    route: Option<contract::Route>,
    /// Whether `$$ComponentProps` moved before the render function.
    props_hoisted: bool,
    /// The root snippets svelte2tsx moves before the render function.
    module_snippets: Option<NodeIdentifier>,
    /// The attributes of each `<slot>` lowered, with its properties when svelte2tsx writes them
    /// as an object, which type the slots without `$$Slots`.
    slot_elements: Vec<contract::SlotElement<'a>>,
    /// The names svelte2tsx unpacks for a `<slot>` prop that reads them, innermost last.
    slot_scope: Buffer<slot_scope::Declared>,
    /// What the component's names say about generated names, read when first needed.
    names: OnceCell<names::Names<'a>>,
}

/// The source text at `span`, whose mapping ends at `end` when that is not its own end.
fn source_expression(span: Span, end: Option<u32>) -> SourceExpression {
    SourceExpression {
        span,
        end: end.unwrap_or(span.end_offset),
    }
}

/// Whether `expression` reads one of `names`.
fn reads_any(expression: &Expression<'_>, names: &[&str]) -> bool {
    struct Reads<'n, 's> {
        names: &'n [&'s str],
        found: bool,
    }
    impl<'a> Visit<'a> for Reads<'_, '_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            self.found |= self.names.contains(&it.name.as_str());
        }
    }
    let mut reads = Reads {
        names,
        found: false,
    };
    reads.visit_expression(expression);
    reads.found
}

/// Whether `e`'s first token is the `{` of an object literal.
fn starts_with_object(mut e: &Expression<'_>) -> bool {
    let start = e.span().start;
    loop {
        let next = match e {
            Expression::ObjectExpression(_) => return true,
            Expression::StaticMemberExpression(m) => &m.object,
            Expression::ComputedMemberExpression(m) => &m.object,
            Expression::PrivateFieldExpression(m) => &m.object,
            Expression::CallExpression(c) => &c.callee,
            Expression::TaggedTemplateExpression(t) => &t.tag,
            Expression::BinaryExpression(b) => &b.left,
            Expression::LogicalExpression(l) => &l.left,
            Expression::ConditionalExpression(c) => &c.test,
            Expression::SequenceExpression(s) => match s.expressions.first() {
                Some(first) => first,
                None => return false,
            },
            Expression::ChainExpression(c) => match c.expression.as_member_expression() {
                Some(member) => member.object(),
                None => match &c.expression {
                    ChainElement::CallExpression(call) => &call.callee,
                    _ => return false,
                },
            },
            Expression::TSAsExpression(t) => &t.expression,
            Expression::TSSatisfiesExpression(t) => &t.expression,
            Expression::TSNonNullExpression(t) => &t.expression,
            Expression::AssignmentExpression(a) => {
                return matches!(a.left, AssignmentTarget::ObjectAssignmentTarget(_))
                    && a.left.span().start == start;
            }
            _ => return false,
        };
        // A part that starts later sits after a parenthesis the tree drops.
        if next.span().start != start {
            return false;
        }
        e = next;
    }
}

impl Builder<'_> {
    fn expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        self.component.javascript.get_expression(identifier)
    }

    fn source(&mut self, at: oxc_span::Span, end: Option<u32>) -> NodeIdentifier {
        self.source_at(document_span(at), end)
    }

    fn source_at(&mut self, span: Span, end: Option<u32>) -> NodeIdentifier {
        self.tree.push(Node::Source(source_expression(span, end)))
    }

    /// The source text of `span` with each hole, in order, replaced by its node or removed.
    fn spliced(
        &mut self,
        span: Span,
        holes: impl IntoIterator<Item = (Span, Option<NodeIdentifier>)>,
    ) -> Range {
        let start = self.scratch.len();
        let mut cursor = span.start_offset;
        for (hole, node) in holes {
            if cursor < hole.start_offset {
                let copy = self.source_at(Span::new(cursor, hole.start_offset), None);
                self.scratch.push(copy);
            }
            self.scratch.extend(node);
            cursor = hole.end_offset;
        }
        if cursor < span.end_offset {
            let copy = self.source_at(Span::new(cursor, span.end_offset), None);
            self.scratch.push(copy);
        }
        self.finish_list(start)
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

    /// A tag's `copied;`, which svelte2tsx parenthesizes only when it starts with `{`, which would
    /// open a block.
    fn mustache(&self, expression: ExpressionIdentifier, copied: Span, end: u32) -> Node {
        let value = SourceExpression { span: copied, end };
        if starts_with_object(self.expression(expression)) {
            Node::Expression(value)
        } else {
            Node::Bare(value)
        }
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
            TemplateNode::Expression { expression, span } => {
                // svelte2tsx copies all between the braces, the parentheses included.
                let inside = Span::new(span.start_offset + 1, span.end_offset - 1);
                self.mustache(expression, inside, span.end_offset - 1)
            }
            TemplateNode::Html {
                expression,
                span: tag,
            } => {
                let at = node_span(self.expression(expression));
                self.mustache(expression, at, tag.end_offset - 1)
            }
            TemplateNode::Element {
                name,
                component,
                attributes,
                children,
                start_tag,
                self_closing,
                end,
                span,
                ..
            } => {
                // svelte2tsx reads a component's name again where its end tag names it.
                let end_name = (end.has_end_tag() && component.is_some())
                    .then(|| self.end_tag_name(name, span))
                    .flatten();
                let tag = (start_tag, self_closing);
                return self
                    .element(name, tag, component, attributes, children, end_name)
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
            TemplateNode::Each { .. } => self.each_block(identifier)?,
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
