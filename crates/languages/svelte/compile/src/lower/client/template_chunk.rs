use oxc_ast::ast::{Expression, LogicalOperator};
use rsvelte_svelte_semantic::evaluate::{Evaluator, Value};

use super::{ClientCompilationContext, Item, Memo, Part, decode_attribute};

impl<'a, 'o> ClientCompilationContext<'a, 'o> {
    /// Upstream `build_template_chunk`.
    pub(super) fn template_chunk(
        &self,
        values: &[Item<'_>],
        memo: &mut Memo<'o>,
        if_state: bool,
    ) -> (Expression<'o>, bool) {
        let b = self.b;
        let mut quasis: Vec<String> = vec![String::new()];
        let mut expressions: Vec<Expression<'o>> = Vec::new();
        let mut has_state = false;
        for item in values {
            let expression = match item {
                Item::Text { data, .. } => {
                    quasis.last_mut().expect("never empty").push_str(data);
                    continue;
                }
                Item::Expression(e) => *e,
                Item::Node(_) | Item::Comment => {
                    unreachable!("sequences hold text and expression tags")
                }
            };
            let source = self
                .javascript
                .get_expression(expression)
                .get_inner_expression();
            match source {
                Expression::StringLiteral(_)
                | Expression::NumericLiteral(_)
                | Expression::BooleanLiteral(_) => {
                    let v = Evaluator::new(self.res).evaluate(source).value;
                    quasis
                        .last_mut()
                        .expect("never empty")
                        .push_str(&v.to_javascript_string());
                    continue;
                }
                Expression::NullLiteral(_) => continue,
                Expression::Identifier(i)
                    if i.name == "undefined" && self.res.symbol(i).is_none() =>
                {
                    continue;
                }
                _ => {}
            }
            let meta = self.an.meta(expression);
            let built = self.expression(expression);
            let mut value = self.memoize(memo, expression, built, if_state);
            let evaluated = Evaluator::in_scope(self.res, self.scope).evaluate(&value);
            let known = evaluated.is_known.then_some(&evaluated);
            has_state |= meta.has_state && known.is_none();
            if values.len() == 1 {
                if let Some(k) = known {
                    value = b.string(&Self::template_string(&k.value));
                }
                return (value, has_state);
            }
            if let Expression::LogicalExpression(logical) = &mut value
                && matches!(
                    logical.operator,
                    LogicalOperator::Coalesce | LogicalOperator::Or
                )
                && logical.right.is_null()
            {
                logical.right = b.string("");
            }
            if let Some(k) = known {
                let s = Self::template_string(&k.value);
                quasis.last_mut().expect("never empty").push_str(&s);
            } else {
                if !evaluated.is_defined {
                    value = b.logical(value, LogicalOperator::Coalesce, b.string(""));
                }
                expressions.push(value);
                quasis.push(String::new());
            }
        }
        if expressions.is_empty() {
            let s = quasis.pop().expect("never empty");
            return (b.string(&s), has_state);
        }
        (
            b.template(quasis.iter().map(String::as_str), expressions),
            has_state,
        )
    }

    fn template_string(value: &Value) -> String {
        match value {
            Value::Null | Value::Undefined => String::new(),
            value => value.to_javascript_string(),
        }
    }

    pub(super) fn chunk_items(&self, parts: &[Part]) -> Vec<Item<'a>> {
        parts
            .iter()
            .map(|p| match p {
                Part::Text(s) => {
                    let raw = s.text(self.source_text);
                    Item::Text {
                        data: decode_attribute(raw),
                        raw: raw.into(),
                    }
                }
                Part::Expression { expression, .. } => Item::Expression(*expression),
            })
            .collect()
    }
}
