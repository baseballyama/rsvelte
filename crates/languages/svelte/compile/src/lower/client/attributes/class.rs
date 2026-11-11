use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_typescript_tree::ExpressionIdentifier;

use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Lists, Memo,
    escape_markup, needs_clsx,
};
use crate::lower::javascript::string_value;

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

    /// Upstream `build_set_class`; `attribute` is `None` for the empty `class` upstream's analysis
    /// adds.
    pub(in crate::lower::client) fn set_class(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
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
            let mut props = Vec::with_capacity(directives.len());
            for d in directives {
                let AttributeValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let meta = self.an.meta(e);
                let built = self.expression(e);
                let v = self.memoize(memo, e, built, false);
                has_state |= meta.has_state;
                props.push(b.init(d.name.text(self.source_text), v));
            }
            next = Some(b.object(props));
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
                Expression::StringLiteral(s) => Some(string_value(s.value)),
                Expression::NullLiteral(_) => Some("".into()),
                _ => None,
            };
            match literal.as_deref() {
                Some("") => value = b.string(hash),
                Some(v) => value = b.string(&format!("{} {hash}", escape_markup(v, true))),
                None => stylesheet_hash = Some(b.string(hash)),
            }
        }
        if stylesheet_hash.is_none() && next.is_some() {
            stylesheet_hash = Some(b.null());
        }
        let x = b.id(node);
        let super::super::NodeKind::Element(element) =
            &self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("classes belong to elements")
        };
        let markup_namespace = element.kind == super::super::ElementKind::Regular
            && self.plan.namespace(identifier) == crate::render_plan::Namespace::Html;
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
        let s = b.stmt(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }
}
