//! The emitter: the translation as a Vapor client module (`defineVaporComponent`) or a Vue SSR
//! module (`defineComponent` with `ssrRender`), built in an arena of its own.

use std::collections::BTreeSet;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKind, Statement};
use oxc_semantic::SymbolId;
use oxc_span::SPAN;
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::ExpressionIdentifier;
use rsvelte_vue_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, Directive, Node, NodeKind,
    PropertyKind as VueProperty,
};
use rsvelte_vue_semantic::resolve::Resolution;
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};
use rustc_hash::{FxHashMap, FxHashSet};

use super::{Translation, helpers, program, statements};

mod blocks;
mod components;
mod custom_element;
mod effects;
mod elements;
mod expressions;
mod patterns;
mod scopes;
mod script;
mod server;
mod slots;
mod snippets;

use effects::Body;

pub(super) fn compile(t: &Translation, res: &Resolution) -> String {
    rsvelte_typescript_tree::with_scratch_arena(|allocator| compile_in(t, res, allocator))
}

fn compile_in(t: &Translation, res: &Resolution, allocator: &Allocator) -> String {
    let b = Builder::new(allocator);
    let mut e = Emitter::new(t, res, &b);
    e.async_helpers();
    let mut body = Body::default();
    let (mut module, mut fields) = e.script(&mut body);
    e.slot_context(&mut body);
    let tree = &t.template.compiler_syntax_tree;
    if t.server {
        e.helpers.insert("normalizeStyle");
        if tree.nodes.iter().any(|node| e.tag_is(node, "$$Component")) {
            module.push(super::import(
                &b,
                [("ssrRenderComponent", "$$ssr_component")],
                "vue/server-renderer",
            ));
        }
        module.push(helpers::boolean_names("$$boolean_names", &b));
        module.extend(statements(&b, include_str!("vapor/server.js")));
    }
    if t.template.helpers.contains(&helpers::Helper::Group) && !t.server {
        body.insert(b.const_("$$instance_groups", b.object([])));
    }
    if !t.server
        && tree
            .nodes
            .iter()
            .any(|node| e.tag_is(node, "svelte:window") || e.tag_is(node, "svelte:document"))
    {
        let owner = b.call(b.id("$$lifecycle_owner"), []);
        body.insert(b.const_("$$instance_lifecycles", owner));
    }
    let custom_element = t.template.custom_element.as_ref();
    let injected = custom_element.map_or(t.css_mode == super::template::CssMode::Injected, |o| {
        !o.shadow_root
    });
    if !t.server && t.stylesheet.is_some() && injected {
        module.extend(statements(&b, include_str!("vapor/styles.js")));
        let instance = e.call("getCurrentInstance", []);
        let [hash, stylesheet] = e.stylesheet_values();
        let call = b.call(b.id("$$inject_styles"), [instance, hash, stylesheet]);
        body.push(b.statement(call));
    }
    let result = if t.server {
        e.server_setup(&mut body, &mut fields)
    } else {
        e.client_setup(&mut body)
    };
    let mut body = body.finish(&b);
    body.push(b.return_(Some(result)));
    let setup = e.setup_function(body, &mut module);
    fields.push(method(&b, "setup", setup));
    let helper = if t.server {
        "defineComponent"
    } else {
        "defineVaporComponent"
    };
    module.append(&mut e.preamble);
    let mut component = e.call(helper, [b.object(fields)]);
    if !t.server
        && let Some(options) = custom_element
    {
        component = e.custom_element(component, options, &mut module);
    }
    let export = Statement::new_export_default_declaration(SPAN, component.into(), &b);
    module.insert(0, e.import());
    module.push(export);
    let source_text = b.str(t.javascript.source_text());
    rsvelte_typescript_compile::print::print(&program(&b, source_text, module))
}

/// `name(params) { body }`, from a function expression.
fn method<'o>(b: &Builder<'o>, name: &str, function: Expression<'o>) -> ObjectPropertyKind<'o> {
    ObjectPropertyKind::new_object_property(
        SPAN,
        PropertyKind::Init,
        b.key(name),
        function,
        true,
        false,
        false,
        b,
    )
}

struct Emitter<'a, 'o> {
    t: &'a Translation,
    res: &'a Resolution,
    tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    b: &'a Builder<'o>,
    preamble: Vec<Statement<'o>>,
    helpers: BTreeSet<&'static str>,
    next_name: usize,
    exposed: bool,
    /// The names of the `computed` cells memoized reads are, which a merged effect reads first.
    memoized: FxHashSet<String>,
    /// The memoized cells each element callback that only updates the DOM reads.
    dom_callbacks: FxHashMap<String, Vec<String>>,
    next_effect_order: usize,
    attribute_effect_order: Option<usize>,
    /// The template's names that are cells here: the aliases and declarations in scope.
    cells: FxHashSet<SymbolId>,
}

impl<'a, 'o> Emitter<'a, 'o> {
    fn new(t: &'a Translation, res: &'a Resolution, b: &'a Builder<'o>) -> Self {
        Self {
            t,
            res,
            tree: &t.template.compiler_syntax_tree,
            source_text: t.javascript.source_text(),
            b,
            preamble: Vec::new(),
            helpers: BTreeSet::new(),
            next_name: 0,
            exposed: false,
            memoized: FxHashSet::default(),
            dom_callbacks: FxHashMap::default(),
            next_effect_order: 0,
            attribute_effect_order: None,
            cells: FxHashSet::default(),
        }
    }

    fn async_helpers(&mut self) {
        if self.t.template.helpers.contains(&helpers::Helper::Async) {
            self.helpers.extend([
                "ReactiveEffect",
                "shallowRef",
                "onScopeDispose",
                "currentInstance",
                "handleError",
                "inject",
            ]);
        }
        if self.t.template.helpers.contains(&helpers::Helper::Pending) {
            self.helpers.insert("inject");
        }
    }

    fn tag_is(&self, node: &Node, tag: &str) -> bool {
        matches!(&node.kind, NodeKind::Element(element) if element.tag.text(self.source_text) == tag)
    }

    fn tag(&self, identifier: CompilerNodeIdentifier) -> &'a str {
        match &self.tree.node(identifier).kind {
            NodeKind::Element(element) => element.tag.text(self.source_text),
            _ => "",
        }
    }

    /// A template expression as the resolution holds it, its names resolved.
    fn source(&self, e: ExpressionIdentifier) -> &'a Expression<'a> {
        self.res.tree().get_expression(e)
    }

    /// A call to Vue's `name`, imported as `$$v_name`.
    fn call(
        &mut self,
        name: &'static str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        self.helpers.insert(name);
        self.b.call(self.b.id(&format!("$$v_{name}")), arguments)
    }

    fn import(&self) -> Statement<'o> {
        let locals: Vec<(&str, String)> = self
            .helpers
            .iter()
            .map(|&name| (name, format!("$$v_{name}")))
            .collect();
        super::import(
            self.b,
            locals.iter().map(|(name, local)| (*name, local.as_str())),
            "vue",
        )
    }

    /// `() => body`.
    fn arrow(&self, body: Expression<'o>) -> Expression<'o> {
        self.b.arrow(self.b.parameters([]), body)
    }

    /// `(() => { statements })()`.
    fn run(&self, statements: Vec<Statement<'o>>, is_async: bool) -> Expression<'o> {
        let b = self.b;
        b.call(b.arrow_block(b.parameters([]), statements, is_async), [])
    }

    fn transition_branch(&self, render: Expression<'o>) -> Expression<'o> {
        if !self
            .t
            .template
            .helpers
            .contains(&helpers::Helper::Transition)
        {
            return render;
        }
        self.b.call(self.b.id("$$transition_branch"), [render])
    }

    fn keyed_fragment(&mut self, key: Expression<'o>, render: Expression<'o>) -> Expression<'o> {
        if self
            .t
            .template
            .helpers
            .contains(&helpers::Helper::Transition)
        {
            self.helpers.insert("createKeyedFragment");
            self.b.call(self.b.id("$$transition_keyed"), [key, render])
        } else {
            self.call("createKeyedFragment", [key, render])
        }
    }

    fn name(&mut self) -> String {
        let name = format!("$$v_n{}", self.next_name);
        self.next_name += 1;
        name
    }

    /// `const $$v_nN = value`, and its name.
    fn declare(&mut self, value: Expression<'o>, body: &mut Body<'o>) -> String {
        let name = self.name();
        body.push(self.b.const_(&name, value));
        name
    }

    fn tracked_callback(&self, callback: Expression<'o>) -> Expression<'o> {
        if !self.t.tracking {
            return callback;
        }
        self.arrow(self.b.call(self.b.id("$$tracked"), [callback]))
    }

    const fn reserve_effect_order(&mut self) -> usize {
        let order = self.next_effect_order;
        self.next_effect_order += 1;
        order
    }

    /// `renderEffect(() => update)`; one that only updates the DOM may merge with the others of
    /// its body.
    fn effect(&mut self, update: Expression<'o>, dom: bool, body: &mut Body<'o>) {
        let update = if self.t.tracking {
            self.b.call(self.b.id("$$tracked"), [self.arrow(update)])
        } else {
            update
        };
        let order = self
            .attribute_effect_order
            .unwrap_or_else(|| self.reserve_effect_order());
        self.helpers.insert("renderEffect");
        if dom {
            let reads = effects::reads(&update, &self.memoized, &self.dom_callbacks);
            body.effect(order, update, reads);
        } else {
            let effect = self.call("renderEffect", [self.arrow(update)]);
            body.push(self.b.statement(effect));
        }
    }

    /// `const $$v_nN = template(markup)()` in the body, its factory in the module.
    fn template(&mut self, markup: &str, namespace: Namespace, body: &mut Body<'o>) -> String {
        const DEFAULT_TEMPLATE_FLAGS: f64 = 0.0;
        const SVG_NAMESPACE: f64 = 1.0;
        const MATHML_NAMESPACE: f64 = 2.0;
        let b = self.b;
        let mut arguments = vec![b.string(markup)];
        if namespace != Namespace::Html {
            arguments.push(b.number(DEFAULT_TEMPLATE_FLAGS));
            arguments.push(b.number(if namespace == Namespace::Svg {
                SVG_NAMESPACE
            } else {
                MATHML_NAMESPACE
            }));
        }
        let factory = self.call("template", arguments);
        let name = self.name();
        self.preamble.push(b.const_(&name, factory));
        self.declare(b.call(b.id(&name), []), body)
    }

    /// The node `identifier` makes, as an expression of the block.
    fn node(&mut self, identifier: CompilerNodeIdentifier, body: &mut Body<'o>) -> Expression<'o> {
        let b = self.b;
        match &self.tree.node(identifier).kind {
            NodeKind::Element(_) => self.element(identifier, body),
            NodeKind::Text(text) => {
                let node = self.call("createTextNode", [b.string(text.text(self.source_text))]);
                b.id(&self.declare(node, body))
            }
            &NodeKind::Interpolation { expression } => {
                let node = self.template(" ", Namespace::Html, body);
                let value = self.render_expression(self.source(expression), body);
                let call = self.call("setText", [b.id(&node), value]);
                self.effect(call, true, body);
                b.id(&node)
            }
            NodeKind::Comment { .. } => unreachable!("Svelte translation removes comments"),
        }
    }

    /// The first directive `name` of an element.
    fn structural(
        &self,
        identifier: CompilerNodeIdentifier,
        name: DirectiveName,
    ) -> Option<&'a Directive> {
        let NodeKind::Element(el) = &self.tree.node(identifier).kind else {
            return None;
        };
        self.tree
            .props(el.props)
            .iter()
            .find_map(|p| match &p.kind {
                VueProperty::Directive(d) if d.name == name => Some(d),
                VueProperty::Directive(_) | VueProperty::Attribute { .. } => None,
            })
    }

    /// The value of `:name` on an element, or of its first directive without `name`.
    fn bound(
        &self,
        identifier: CompilerNodeIdentifier,
        name: Option<&str>,
    ) -> Option<ExpressionIdentifier> {
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            return None;
        };
        self.tree.props(element.props).iter().find_map(|property| {
            let VueProperty::Directive(directive) = &property.kind else {
                return None;
            };
            let named = name.is_none_or(|name| {
                directive
                    .arg
                    .as_ref()
                    .is_some_and(|arg| arg.text(self.source_text) == name)
            });
            match directive.exp {
                DirectiveExpression::Expression(value) if named => Some(value),
                _ => None,
            }
        })
    }

    fn stylesheet_values(&self) -> [Expression<'o>; 2] {
        let hash = self
            .t
            .stylesheet_hash
            .as_deref()
            .expect("a stylesheet has an identity");
        let stylesheet = self
            .t
            .stylesheet
            .as_deref()
            .expect("a stylesheet is present");
        [self.b.string(hash), self.b.string(stylesheet)]
    }

    fn namespace(&self, identifier: CompilerNodeIdentifier) -> Namespace {
        self.t
            .template
            .namespaces
            .get(&identifier)
            .copied()
            .unwrap_or(Namespace::Html)
    }
}
