use std::collections::BTreeSet;

use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_typescript::copy::{Verbatim, copy};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_vue::resolve::{Resolution, call_name};

use super::{Translation, helpers};

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
mod styles;

const SYNTHETIC: SourceLocation = SourceLocation::SYNTHETIC;

pub(super) fn compile(t: &Translation, resolution: &Resolution, source_text: &str) -> String {
    let mut b = Builder::new(t, resolution, source_text);
    b.async_helpers();
    let mut body = Vec::new();
    let (mut module, mut fields) = b.script(&mut body);
    b.slot_context(&mut body);
    if t.server {
        b.helpers.insert("normalizeStyle");
        if t.compiler_syntax_tree.nodes.iter().any(|node| {
            matches!(
                &node.kind,
                NodeKind::Element(element) if element.tag.text(source_text) == "$$Component"
            )
        }) {
            let imported = b.to.identifier("ssrRenderComponent");
            let local = b.to.identifier("$$ssr_component");
            let specifier = b.to.import_named(imported, local, false, SYNTHETIC);
            let source = b.to.write_string("vue/server-renderer");
            module.push(b.to.import(&[specifier], source, false, SYNTHETIC));
        }
        module.push(helpers::boolean_names("$$boolean_names", &mut b.to));
        module.extend(helpers::source_declarations(
            include_str!("vapor/server.js"),
            &mut b.to,
        ));
    }
    if t.helpers.contains(&helpers::Helper::Group) && !t.server {
        let groups = b.to.object(&[], SYNTHETIC);
        let name = b.to.identifier("$$instance_groups");
        body.insert(0, b.to.let_(flag::CONST, name, Some(groups)));
    }
    if !t.server
        && t.compiler_syntax_tree.nodes.iter().any(|node| {
            matches!(&node.kind, NodeKind::Element(element)
                if matches!(element.tag.text(source_text), "svelte:window" | "svelte:document"))
        })
    {
        let constructor = b.to.identifier("$$lifecycle_owner");
        let value = b.to.call0(constructor, &[]);
        let name = b.to.identifier("$$instance_lifecycles");
        body.insert(0, b.to.let_(flag::CONST, name, Some(value)));
    }
    if !t.server
        && t.stylesheet.is_some()
        && t.custom_element.as_ref().map_or(
            t.css_mode == super::template::CssMode::Injected,
            |options| !options.shadow_root,
        )
    {
        module.extend(helpers::source_declarations(
            include_str!("vapor/styles.js"),
            &mut b.to,
        ));
        let instance = b.call("getCurrentInstance", &[]);
        let (hash, stylesheet) = b.stylesheet_values();
        let callee = b.to.identifier("$$inject_styles");
        let call = b.to.call0(callee, &[instance, hash, stylesheet]);
        body.push(b.to.expression_statement(call));
    }
    let result = if t.server {
        b.server_setup(&mut body, &mut fields)
    } else {
        b.client_setup(&mut body)
    };
    body.push(b.to.return_(Some(result), SYNTHETIC));
    let setup = b.setup_function(&body, &mut module);
    let key = b.to.identifier("setup");
    fields.push(b.to.property(key, setup, flag::METHOD, SYNTHETIC));
    let options = b.to.object(&fields, SYNTHETIC);
    let helper = if t.server {
        "defineComponent"
    } else {
        "defineVaporComponent"
    };
    module.append(&mut b.preamble);
    let mut component = b.call(helper, &[options]);
    if !t.server
        && let Some(options) = &t.custom_element
    {
        component = b.custom_element(component, options, &mut module);
    }
    let export = b.to.export_default(component, SYNTHETIC);
    let import = b.import();
    module.insert(0, import);
    module.push(export);
    let program = b.to.program(&module, SYNTHETIC);
    let output = (!t.server).then(|| {
        effects::lower(
            &b.to,
            program,
            &b.dom_callbacks,
            &b.effect_order,
            &b.cached_reads,
        )
    });
    let (tree, program) = output
        .as_ref()
        .map_or((&b.to, program), |(tree, program)| (tree, *program));
    rsvelte_typescript_compile::codegen::print_program(tree, source_text, program).out
}

struct Builder<'a> {
    input: &'a Translation,
    resolution: &'a Resolution,
    source_text: &'a str,
    to: SyntaxTree,
    preamble: Vec<NodeIdentifier>,
    helpers: BTreeSet<&'static str>,
    next_name: usize,
    exposed: bool,
    dom_callbacks: rustc_hash::FxHashMap<NodeIdentifier, NodeIdentifier>,
    cached_reads: rustc_hash::FxHashSet<NodeIdentifier>,
    effect_order: rustc_hash::FxHashMap<NodeIdentifier, usize>,
    next_effect_order: usize,
    attribute_effect_order: Option<usize>,
    references: rustc_hash::FxHashMap<NodeIdentifier, rsvelte_typescript::scope::BindingIdentifier>,
    loop_bindings: rustc_hash::FxHashSet<rsvelte_typescript::scope::BindingIdentifier>,
}

impl<'a> Builder<'a> {
    fn new(input: &'a Translation, resolution: &'a Resolution, source_text: &'a str) -> Self {
        Self {
            input,
            resolution,
            source_text,
            to: SyntaxTree::new(),
            preamble: Vec::new(),
            helpers: BTreeSet::new(),
            next_name: 0,
            exposed: false,
            dom_callbacks: rustc_hash::FxHashMap::default(),
            cached_reads: rustc_hash::FxHashSet::default(),
            effect_order: rustc_hash::FxHashMap::default(),
            next_effect_order: 0,
            attribute_effect_order: None,
            references: resolution
                .sem
                .references
                .iter()
                .filter_map(|r| r.binding.map(|binding| (r.node, binding)))
                .collect(),
            loop_bindings: rustc_hash::FxHashSet::default(),
        }
    }

    fn async_helpers(&mut self) {
        if self.input.helpers.contains(&helpers::Helper::Async) {
            self.helpers.extend([
                "ReactiveEffect",
                "shallowRef",
                "onScopeDispose",
                "currentInstance",
                "handleError",
                "inject",
            ]);
        }
        if self.input.helpers.contains(&helpers::Helper::Pending) {
            self.helpers.insert("inject");
        }
    }

    fn call(&mut self, name: &'static str, arguments: &[NodeIdentifier]) -> NodeIdentifier {
        self.helpers.insert(name);
        let callee = self.to.identifier(&format!("$$v_{name}"));
        self.to.call0(callee, arguments)
    }

    fn import(&mut self) -> NodeIdentifier {
        let specs: Vec<_> = self
            .helpers
            .iter()
            .map(|name| {
                let imported = self.to.identifier(name);
                let local = self.to.identifier(&format!("$$v_{name}"));
                self.to.import_named(imported, local, false, SYNTHETIC)
            })
            .collect();
        let source = self.to.write_string("vue");
        self.to.import(&specs, source, false, SYNTHETIC)
    }

    fn transition_branch(&mut self, render: NodeIdentifier) -> NodeIdentifier {
        if !self.input.helpers.contains(&helpers::Helper::Transition) {
            return render;
        }
        let callee = self.to.identifier("$$transition_branch");
        self.to.call0(callee, &[render])
    }

    fn keyed_fragment(&mut self, key: NodeIdentifier, render: NodeIdentifier) -> NodeIdentifier {
        if self.input.helpers.contains(&helpers::Helper::Transition) {
            self.helpers.insert("createKeyedFragment");
            let callee = self.to.identifier("$$transition_keyed");
            self.to.call0(callee, &[key, render])
        } else {
            self.call("createKeyedFragment", &[key, render])
        }
    }

    fn name(&mut self) -> NodeIdentifier {
        let name = self.to.identifier(&format!("$$v_n{}", self.next_name));
        self.next_name += 1;
        name
    }

    fn declare(&mut self, value: NodeIdentifier, body: &mut Vec<NodeIdentifier>) -> NodeIdentifier {
        let name = self.name();
        body.push(self.to.let_(flag::CONST, name, Some(value)));
        name
    }

    fn tracked_callback(&mut self, callback: NodeIdentifier) -> NodeIdentifier {
        if !self.input.tracking {
            return callback;
        }
        let callee = self.to.identifier("$$tracked");
        let call = self.to.call0(callee, &[callback]);
        self.to.arrow(&[], call, true, false, SYNTHETIC)
    }

    const fn reserve_effect_order(&mut self) -> usize {
        let order = self.next_effect_order;
        self.next_effect_order += 1;
        order
    }

    fn effect(&mut self, expression: NodeIdentifier, body: &mut Vec<NodeIdentifier>) {
        let callback = self.to.arrow(&[], expression, true, false, SYNTHETIC);
        let callback = self.tracked_callback(callback);
        let call = self.call("renderEffect", &[callback]);
        let statement = self.to.expression_statement(call);
        let order = self
            .attribute_effect_order
            .unwrap_or_else(|| self.reserve_effect_order());
        self.effect_order.insert(statement, order);
        body.push(statement);
    }

    fn template(
        &mut self,
        markup: &str,
        namespace: Namespace,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let markup = self.to.write_string(markup);
        let mut arguments = vec![markup];
        if namespace != Namespace::Html {
            const DEFAULT_TEMPLATE_FLAGS: f64 = 0.0;
            const SVG_NAMESPACE: f64 = 1.0;
            const MATHML_NAMESPACE: f64 = 2.0;
            arguments.push(self.to.write_number(DEFAULT_TEMPLATE_FLAGS, SYNTHETIC));
            arguments.push(self.to.write_number(
                if namespace == Namespace::Svg {
                    SVG_NAMESPACE
                } else {
                    MATHML_NAMESPACE
                },
                SYNTHETIC,
            ));
        }
        let factory = self.call("template", &arguments);
        let name = self.name();
        self.preamble
            .push(self.to.let_(flag::CONST, name, Some(factory)));
        let value = self.to.call0(name, &[]);
        self.declare(value, body)
    }

    fn node(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        match &self.input.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(_) => self.element(identifier, body),
            NodeKind::Text(text) => {
                let value = self.to.write_string(text.text(self.source_text));
                let node = self.call("createTextNode", &[value]);
                self.declare(node, body)
            }
            NodeKind::Interpolation { expression } => {
                let node = self.template(" ", Namespace::Html, body);
                let value = self.render_expression(*expression, body);
                let call = self.call("setText", &[node, value]);
                self.effect(call, body);
                node
            }
            NodeKind::Comment { .. } => unreachable!("Svelte translation removes comments"),
        }
    }
}
