use super::{
    ClientCompilationContext, Frag, Item, Kind, LogicalOperator, NodeIdentifier, Part,
    SourceLocation, decode_text, sanitize_template_string,
};

impl<'a> ClientCompilationContext<'a> {
    /// Upstream `build_template_chunk`.
    pub(super) fn template_chunk(
        &mut self,
        values: &[Item<'_>],
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        let mut quasis: Vec<String> = vec![String::new()];
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        let mut has_state = false;
        for item in values {
            let expression = match item {
                Item::Text { data, .. } => {
                    quasis.last_mut().expect("never empty").push_str(data);
                    continue;
                }
                Item::Expression(e) => *e,
                Item::Node(_) => unreachable!("sequences hold text and expression tags"),
            };
            let javascript = self.javascript;
            match javascript.kind(expression) {
                Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => {
                    if !matches!(javascript.kind(expression), Kind::Null) {
                        let v = self
                            .res
                            .evaluate(javascript, self.source_text, expression)
                            .value
                            .to_javascript_string();
                        quasis.last_mut().expect("never empty").push_str(&v);
                    }
                    continue;
                }
                Kind::Identifier(_)
                    if javascript.name(expression) == "undefined"
                        && self.res.binding(expression).is_none() =>
                {
                    continue;
                }
                _ => {}
            }
            let meta = self.an.meta(expression);
            let built = self.expression(expression);
            let mut value = self.memoize(frag, built, meta);
            let evaluated = self.res.evaluate_output(
                javascript,
                self.source_text,
                &self.out,
                value,
                self.scope,
            );
            let known = evaluated.is_known.then_some(&evaluated);
            has_state |= meta.has_state && known.is_none();
            if values.len() == 1 {
                if let Some(k) = known {
                    let s = Self::template_string(&k.value);
                    value = self.out.write_string(&s);
                }
                return (value, has_state);
            }
            if let Kind::Logical(op @ (LogicalOperator::Nullish | LogicalOperator::Or), l, r) =
                self.out.kind(value)
                && matches!(self.out.kind(r), Kind::Null)
            {
                let empty = self.out.write_string("");
                value = self
                    .out
                    .logical(op, l, empty, self.out.source_location(value));
            }
            if let Some(k) = known {
                let s = Self::template_string(&k.value);
                quasis.last_mut().expect("never empty").push_str(&s);
            } else {
                if !evaluated.is_defined {
                    let empty = self.out.write_string("");
                    value = self.out.logical(
                        LogicalOperator::Nullish,
                        value,
                        empty,
                        SourceLocation::SYNTHETIC,
                    );
                }
                expressions.push(value);
                quasis.push(String::new());
            }
        }
        if expressions.is_empty() {
            let s = quasis.pop().expect("never empty");
            return (self.out.write_string(&s), has_state);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        (
            self.out
                .template(&elements, &expressions, SourceLocation::SYNTHETIC),
            has_state,
        )
    }

    fn template_string(value: &rsvelte_svelte::semantic::evaluate::Value) -> String {
        match value {
            rsvelte_svelte::semantic::evaluate::Value::Null
            | rsvelte_svelte::semantic::evaluate::Value::Undefined => String::new(),
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
                        data: decode_text(raw),
                        raw: raw.into(),
                    }
                }
                Part::Expression { expression, .. } => Item::Expression(*expression),
            })
            .collect()
    }
}
