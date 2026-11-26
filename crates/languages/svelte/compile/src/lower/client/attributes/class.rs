use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, ElementKind, NodeKind,
};
use rsvelte_svelte_syntax::syntax_tree::escape_markup;
use rsvelte_typescript_tree::{ExpressionIdentifier, JsString};

use crate::input::Target;
use crate::lower::attributes::{needs_clsx, scoped_literal_class};
use crate::lower::builder::Runtime;
use crate::lower::client::{ClientCompilationContext, Lists, Memo, NodeVar};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// A `class` value written as one expression, through `$.clsx` when upstream's `needs_clsx`.
    fn class_expression(
        &self,
        expression: ExpressionIdentifier,
        unquoted: bool,
        memo: &mut Memo<'o>,
    ) -> (Expression<'o>, bool) {
        let meta = self.an.meta(expression);
        let mut built = self.expression(expression);
        if unquoted
            && needs_clsx(
                self.javascript
                    .get_expression(expression)
                    .get_inner_expression(),
            )
        {
            built = self.b.runtime("clsx", [built]);
        }
        (self.memoize(memo, expression, built, false), meta.has_state)
    }

    /// Upstream `build_class_directives_object`: `{ name: value }`, memoized; whether a value reads
    /// state.
    pub(in crate::lower::client) fn class_directives(
        &self,
        directives: &[&Attribute],
        memo: &mut Memo<'o>,
    ) -> (Expression<'o>, bool) {
        let mut has_state = false;
        let props = directives.iter().map(|d| {
            let AttributeValue::Class(e) = d.value else {
                unreachable!("class directives")
            };
            has_state |= self.an.meta(e).has_state;
            let built = self.expression(e);
            self.b.init(
                d.name.text(self.source_text),
                self.memoize(memo, e, built, false),
            )
        });
        let object = self.b.object(props);
        (object, has_state)
    }

    /// Upstream `build_set_class`; `attribute` is `None` for the empty `class` upstream's analysis
    /// adds.
    pub(in crate::lower::client) fn set_class(
        &self,
        identifier: CompilerNodeIdentifier,
        node: &NodeVar,
        attribute: Option<&Attribute>,
        directives: &[&Attribute],
        memo: &mut Memo<'o>,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        let (mut value, mut has_state) = match attribute.map(|a| &a.value) {
            None => (b.string(""), false),
            Some(&AttributeValue::Expression { expression, quoted }) => {
                self.class_expression(expression, !quoted, memo)
            }
            Some(&AttributeValue::Shorthand(expression)) => {
                self.class_expression(expression, true, memo)
            }
            Some(_) => self.attribute_value(attribute.expect("matched above"), memo, false),
        };
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let (object, state) = self.class_directives(directives, memo);
            has_state |= state;
            next = Some(object);
            if has_state {
                let name = self.names.generate("classes");
                l.initializer.push(b.let_(&name, None));
                prev = Some(b.id(&name));
                previous_id = Some(name);
            } else {
                prev = Some(b.object([]));
            }
        }
        let mut stylesheet_hash = None;
        if self.an.scoped[identifier]
            && let Some(hash) = &self.identity.stylesheet_hash
        {
            let literal = match &value {
                Expression::StringLiteral(s) => Some(JsString::from_js_str(s.value)),
                Expression::NullLiteral(_) => Some(JsString::new()),
                _ => None,
            };
            match literal {
                Some(v) => {
                    let escaped = v.map_text(|text| escape_markup(text, true));
                    value = b.js_string(&scoped_literal_class(&escaped, hash, Target::Client));
                }
                None => stylesheet_hash = Some(b.string(hash)),
            }
        }
        if stylesheet_hash.is_none() && next.is_some() {
            stylesheet_hash = Some(b.null());
        }
        let x = node.id(b);
        let NodeKind::Element(element) = &self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("classes belong to elements")
        };
        let markup_namespace = element.kind == ElementKind::Regular && self.is_markup(identifier);
        let is_markup = b.number(f64::from(u8::from(markup_namespace)));
        let mut set_class = b.runtime_some(
            "set_class",
            vec![
                Some(x),
                Some(is_markup),
                Some(value),
                stylesheet_hash,
                prev,
                next,
            ],
        );
        if let Some(name) = previous_id {
            set_class = b.assign_name(&name, set_class);
        }
        let s = b.statement(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }
}
