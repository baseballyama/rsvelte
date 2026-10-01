//! What the compiler derives on top of name resolution ([`crate::semantic::resolve`]).
//!
//! That is what each template
//! expression depends on, which fragments are dynamic, the component name, the CSS hash and which
//! elements the style sheet selects. All of it lives in side tables keyed by identifiers, so the
//! trees stay immutable.

use rsvelte_javascript::scope::DeclarationKind;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::index::IndexVector;
use rsvelte_stylesheet::matcher::{self, Element, Match};
use rustc_hash::FxHashMap;

use crate::compilation::compiler_syntax_tree::{
    self, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, NodeKind, Part,
};
use crate::compilation::lower::CompileInput;
use crate::semantic::resolve::{BindingKind, Resolution, rune_call};

#[derive(Clone, Copy, Debug, Default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "independent facts upstream tracks as separate flags"
)]
pub struct ExpressionMetadata {
    /// Any identifier used as a reference (upstream marks the enclosing fragments dynamic).
    pub has_reference: bool,
    pub has_state: bool,
    pub has_call: bool,
    pub has_member: bool,
}

#[derive(Debug)]
pub struct Analysis {
    /// Keyed by the expression root of every template expression.
    pub expressions: FxHashMap<NodeIdentifier, ExpressionMetadata>,
    pub name: String,
    pub stylesheet_hash: Option<String>,
    pub needs_context: bool,
    /// Per HIR node: whether the style sheet selects it (elements only).
    pub scoped: IndexVector<CompilerNodeIdentifier, bool>,
    /// Per element: whether its children are dynamic (upstream `fragment.metadata.dynamic`).
    pub dynamic: IndexVector<CompilerNodeIdentifier, bool>,
    pub root_dynamic: bool,
    /// Per complex selector, in [`rsvelte_stylesheet::scope::selectors`] order.
    pub stylesheet_used: Vec<bool>,
}

impl Analysis {
    /// # Panics
    ///
    /// If `expression` is not the root of a template expression.
    #[must_use]
    pub fn meta(&self, expression: NodeIdentifier) -> ExpressionMetadata {
        *self
            .expressions
            .get(&expression)
            .expect("every template expression is analysed")
    }
}

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
pub fn component_name(filename: &str) -> String {
    let mut parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.pop().unwrap_or("");
    let last_dir = parts.last().copied();
    let mut name = basename.replacen(".svelte", "", 1);
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        dir.clone_into(&mut name);
    }
    let mut chars = name.chars();
    let upper: String = chars
        .next()
        .map_or_else(String::new, |c| c.to_uppercase().chain(chars).collect());
    sanitize_identifier(&upper)
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
#[must_use]
pub fn sanitize_identifier(name: &str) -> String {
    let mut out: String = name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect();
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}

/// Upstream `hash` (utils.js): djb2 over UTF-16 code units, right to left, base 36.
#[must_use]
pub fn hash(s: &str) -> String {
    let units: Vec<u16> = s
        .encode_utf16()
        .filter(|&u| u != u16::from(b'\r'))
        .collect();
    let mut h: i32 = 5381;
    for &u in units.iter().rev() {
        h = (h.wrapping_shl(5).wrapping_sub(h)) ^ i32::from(u);
    }
    to_base36(h.cast_unsigned())
}

fn to_base36(mut v: u32) -> String {
    const DIGITS: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if v == 0 {
        return "0".into();
    }
    let mut buffer = Vec::new();
    while v > 0 {
        buffer.push(DIGITS[(v % 36) as usize]);
        v /= 36;
    }
    buffer.reverse();
    String::from_utf8(buffer).expect("ASCII digits")
}

#[must_use]
pub fn analyze(input: &CompileInput<'_>, res: &Resolution, filename: &str) -> Analysis {
    let (compiler_syntax_tree, source_text, javascript) = (
        input.compiler_syntax_tree,
        input.source_text,
        input.javascript,
    );
    let mut an = Analysis {
        expressions: FxHashMap::default(),
        name: component_name(filename),
        stylesheet_hash: input.style.map(|_| format!("svelte-{}", hash(filename))),
        needs_context: false,
        scoped: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        dynamic: IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len()),
        root_dynamic: false,
        stylesheet_used: Vec::new(),
    };
    let mut walker = MetadataWalker {
        syntax_tree: javascript,
        source_text,
        res,
        meta: ExpressionMetadata::default(),
        deps: 0,
        needs_context: false,
        function_depth: 0,
    };
    walker.visit(input.program);
    let script_needs_context = walker.needs_context;
    let mut expressions = FxHashMap::default();
    let mut needs_context = script_needs_context;
    for &e in input.template_expressions {
        let mut w = MetadataWalker {
            syntax_tree: javascript,
            source_text,
            res,
            meta: ExpressionMetadata::default(),
            deps: 0,
            needs_context: false,
            function_depth: 0,
        };
        w.visit(e);
        needs_context |= w.needs_context;
        expressions.insert(e, w.meta);
    }
    an.expressions = expressions;
    an.needs_context = needs_context;
    let mut dynamic = IndexVector::from_element_n(false, compiler_syntax_tree.nodes.len());
    an.root_dynamic = mark_dynamic(
        input,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
        &mut dynamic,
    );
    an.dynamic = dynamic;

    if let Some(sheet) = input.style {
        let selectors = rsvelte_stylesheet::scope::selectors(sheet);
        an.stylesheet_used = vec![false; selectors.len()];
        for (identifier, _) in compiler_syntax_tree.elements() {
            let el = El {
                compiler_syntax_tree,
                source_text,
                identifier,
            };
            for (i, sel) in selectors.iter().enumerate() {
                if matcher::matches(source_text, sel, el) {
                    an.stylesheet_used[i] = true;
                    let global = sel
                        .parts
                        .last()
                        .is_some_and(|r| matcher::is_global(source_text, r));
                    if !global {
                        an.scoped[identifier] = true;
                    }
                }
            }
        }
    }
    an
}

/// Computes [`ExpressionMetadata`] the way upstream's analysis visitors do, and `needs_context`.
struct MetadataWalker<'a> {
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    meta: ExpressionMetadata,
    /// Bindings referenced so far (upstream `metadata.dependencies`, as a count).
    deps: u32,
    needs_context: bool,
    function_depth: u32,
}

impl MetadataWalker<'_> {
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's expression visitors in one walk"
    )]
    fn visit(&mut self, identifier: NodeIdentifier) {
        // Upstream `NewExpression`.
        self.needs_context |= matches!(self.syntax_tree.kind(identifier), Kind::New { .. });
        match self.syntax_tree.kind(identifier) {
            Kind::Identifier(_) => {
                let declares = self
                    .res
                    .binding(identifier)
                    .is_some_and(|(b, _)| self.res.sem.bindings[b].node == identifier);
                self.meta.has_reference |= !declares;
                if let Some((_, info)) = self.res.binding(identifier)
                    && !declares
                {
                    self.deps += 1;
                    let prop = matches!(
                        info.kind,
                        BindingKind::Property
                            | BindingKind::BindableProperty
                            | BindingKind::RestProperty
                    );
                    if info.kind != BindingKind::StaticIndex
                        && (prop || !info.is_function)
                        && !self
                            .res
                            .evaluate(self.syntax_tree, self.source_text, identifier)
                            .is_known
                    {
                        self.meta.has_state = true;
                    }
                }
            }
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                self.visit(object);
                if computed {
                    self.visit(property);
                }
                self.meta.has_member = true;
                if !self.is_pure(identifier) {
                    self.meta.has_state = true;
                }
                if !self.is_safe(identifier) {
                    self.needs_context = true;
                }
            }
            Kind::Call {
                callee, arguments, ..
            } => {
                let rune = rune_call(self.syntax_tree, identifier).map(|(r, _)| r);
                self.visit(callee);
                for &a in arguments {
                    self.visit(a);
                }
                if rune.is_none() {
                    if !self.is_safe(callee) {
                        self.needs_context = true;
                    }
                    if !self.is_pure(callee) || self.deps > 0 {
                        self.meta.has_call = true;
                        self.meta.has_state = true;
                    }
                } else if matches!(rune, Some("$effect" | "$effect.pre" | "$bindable")) {
                    self.needs_context = true;
                }
            }
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    self.visit(key);
                }
                self.visit(value);
            }
            // Upstream `SpreadElement`: `[...x]` reads like `[...x.values()]`. Its expression state
            // is cleared inside functions.
            Kind::Spread(arg) => {
                if self.function_depth == 0 {
                    self.meta.has_call = true;
                    self.meta.has_state = true;
                }
                self.visit(arg);
            }
            Kind::Function { .. } | Kind::Arrow { .. } => {
                self.function_depth += 1;
                let mut children = Vec::new();
                self.syntax_tree
                    .for_each_child(identifier, |c| children.push(c));
                for c in children {
                    self.visit(c);
                }
                self.function_depth -= 1;
            }
            _ => {
                let mut children = Vec::new();
                self.syntax_tree
                    .for_each_child(identifier, |c| children.push(c));
                for c in children {
                    self.visit(c);
                }
            }
        }
    }

    fn root_ident(&self, mut e: NodeIdentifier) -> Option<NodeIdentifier> {
        while let Kind::Member { object, .. } = self.syntax_tree.kind(e) {
            e = object;
        }
        matches!(self.syntax_tree.kind(e), Kind::Identifier(_)).then_some(e)
    }

    /// Upstream `is_pure`.
    fn is_pure(&self, e: NodeIdentifier) -> bool {
        match self.syntax_tree.kind(e) {
            Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => true,
            Kind::Call {
                callee, arguments, ..
            } => self.is_pure(callee) && arguments.iter().all(|&a| self.is_pure(a)),
            Kind::Identifier(_) | Kind::Member { .. } => self
                .root_ident(e)
                .is_some_and(|root| self.res.binding(root).is_none()),
            _ => false,
        }
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, e: NodeIdentifier) -> bool {
        let Some(root) = self.root_ident(e) else {
            return false;
        };
        let Some((b, info)) = self.res.binding(root) else {
            return true;
        };
        self.res.sem.bindings[b].kind != DeclarationKind::Import
            && !matches!(
                info.kind,
                BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
            )
    }
}

/// Upstream `mark_subtree_dynamic` callers, for the node types this port has: returns whether
/// `list` makes its fragment dynamic, and records the answer for each element's own children.
fn mark_dynamic(
    input: &CompileInput<'_>,
    list: &[CompilerNodeIdentifier],
    out: &mut IndexVector<CompilerNodeIdentifier, bool>,
) -> bool {
    let (compiler_syntax_tree, source_text) = (input.compiler_syntax_tree, input.source_text);
    let mut any = false;
    for &identifier in list {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Expression { .. } => any = true,
            NodeKind::If {
                branches,
                otherwise,
            } => {
                any = true;
                for b in compiler_syntax_tree.branches(*branches) {
                    mark_dynamic(input, compiler_syntax_tree.children(b.body), out);
                }
                if let Some(o) = otherwise {
                    mark_dynamic(input, compiler_syntax_tree.children(*o), out);
                }
            }
            NodeKind::Each(each) => {
                any = true;
                mark_dynamic(input, compiler_syntax_tree.children(each.body), out);
                if let Some(f) = each.fallback {
                    mark_dynamic(input, compiler_syntax_tree.children(f), out);
                }
            }
            NodeKind::Element(el) => {
                let own = mark_dynamic(input, compiler_syntax_tree.children(el.children), out);
                out[identifier] = own;
                any |= own;
                for a in compiler_syntax_tree.attributes(el.attributes) {
                    let attribute = a.name.text(source_text);
                    // Upstream's `ExpressionTag` marks the subtree dynamic whatever the tag holds,
                    // in an attribute value as in the template.
                    let (has_tag, single_expression, quoted) = match &a.value {
                        AttributeValue::Boolean => {
                            any |= crate::compilation::lower::cannot_be_set_statically(attribute);
                            continue;
                        }
                        AttributeValue::Static(_) => (false, None, true),
                        &AttributeValue::Expression { expression, quoted } => {
                            (true, Some(expression), quoted)
                        }
                        &AttributeValue::Shorthand(expression) => (true, Some(expression), false),
                        AttributeValue::Interpolated(parts) => (
                            parts.iter().any(|p| matches!(p, Part::Expression { .. })),
                            None,
                            true,
                        ),
                        // A binding's expression is a reference by construction; an attachment,
                        // a class directive and a spread mark the subtree dynamic whatever they
                        // read.
                        AttributeValue::Bind(_)
                        | AttributeValue::Attach(_)
                        | AttributeValue::Class(_)
                        | AttributeValue::Spread(_) => {
                            any = true;
                            continue;
                        }
                    };
                    let is_event = attribute.starts_with("on") && single_expression.is_some();
                    let class_expression = attribute == "class"
                        && !quoted
                        && single_expression.is_some_and(|e| {
                            crate::compilation::lower::needs_clsx(input.javascript, e)
                        });
                    let option_value =
                        attribute == "value" && el.name.text(source_text) == "option";
                    any |= has_tag
                        || is_event
                        || class_expression
                        || option_value
                        || crate::compilation::lower::cannot_be_set_statically(attribute);
                }
            }
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
        }
    }
    any
}

#[derive(Clone, Copy)]
struct El<'a> {
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    identifier: CompilerNodeIdentifier,
}

impl El<'_> {
    fn element(&self) -> &compiler_syntax_tree::Element {
        let NodeKind::Element(el) = &self.compiler_syntax_tree.node(self.identifier).kind else {
            unreachable!("El wraps elements")
        };
        el
    }

    fn has_class_directive(&self, name: Option<&str>) -> bool {
        self.compiler_syntax_tree
            .attributes(self.element().attributes)
            .iter()
            .any(|a| {
                matches!(a.value, AttributeValue::Class(_))
                    && name.is_none_or(|n| a.name.text(self.source_text) == n)
            })
    }

    fn attribute_state(&self, name: &str, check: impl Fn(&str) -> bool) -> Match {
        for a in self
            .compiler_syntax_tree
            .attributes(self.element().attributes)
        {
            match a.value {
                AttributeValue::Attach(_) | AttributeValue::Class(_) => continue,
                // Upstream `attribute_matches`: a spread may set any attribute.
                AttributeValue::Spread(_) => return Match::Maybe,
                _ => {}
            }
            // Upstream compares a binding's name case-sensitively and stops at it.
            if let AttributeValue::Bind(_) = a.value {
                if a.name.text(self.source_text) == name {
                    return Match::Yes;
                }
                continue;
            }
            if !a.name.text(self.source_text).eq_ignore_ascii_case(name) {
                continue;
            }
            return match &a.value {
                AttributeValue::Boolean => Match::from_bool(check("")),
                AttributeValue::Static(text) => Match::from_bool(check(text)),
                AttributeValue::Interpolated(parts) if parts.is_empty() => {
                    Match::from_bool(check(""))
                }
                AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_) => Match::Maybe,
                AttributeValue::Bind(_)
                | AttributeValue::Attach(_)
                | AttributeValue::Class(_)
                | AttributeValue::Spread(_) => unreachable!("directives are matched above"),
            };
        }
        Match::No
    }
}

trait FromBoolean {
    fn from_bool(b: bool) -> Self;
}

impl FromBoolean for Match {
    fn from_bool(b: bool) -> Self {
        if b { Self::Yes } else { Self::No }
    }
}

impl Element for El<'_> {
    fn tag_name(&self) -> Option<&str> {
        Some(self.element().name.text(self.source_text))
    }

    /// A `class:` directive of that name matches, whichever attribute comes first (upstream
    /// `attribute_matches` goes on past a static `class` that does not).
    fn class(&self, name: &str) -> Match {
        if self.has_class_directive(Some(name)) {
            return Match::Yes;
        }
        self.attribute_state("class", |v| v.split_ascii_whitespace().any(|c| c == name))
    }

    fn identifier(&self, name: &str) -> Match {
        self.attribute_state("id", |v| v == name)
    }

    fn attribute(&self, name: &str) -> Match {
        if name.eq_ignore_ascii_case("class") && self.has_class_directive(None) {
            return Match::Yes;
        }
        match self.attribute_state(name, |_| true) {
            Match::No => Match::No,
            _ => Match::Yes,
        }
    }

    /// Blocks are transparent for CSS: the parent is the enclosing element.
    fn parent(&self) -> Option<Self> {
        let mut at = self.compiler_syntax_tree.node(self.identifier).parent;
        while let Some(p) = at {
            if matches!(self.compiler_syntax_tree.node(p).kind, NodeKind::Element(_)) {
                return Some(El {
                    identifier: p,
                    ..*self
                });
            }
            at = self.compiler_syntax_tree.node(p).parent;
        }
        None
    }
}
